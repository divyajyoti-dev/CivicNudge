import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Bill, PersonaParams } from "@/lib/types";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in .env.local");
}
const client = new Anthropic();

function buildPrompt(bill: Bill, persona: PersonaParams): string {
  const who = [
    persona.naturalLanguage,
    persona.occupation.join(", "),
    persona.occupationOther,
    persona.familyType.join(", "),
    persona.familyTypeOther,
    persona.demographicFocus,
    persona.location ? `in ${persona.location}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const tone =
    persona.actionBias === "action"
      ? "urgent, action-oriented — push them to contact their rep or sign a petition"
      : "clear and informative — help them understand the issue";

  const modeInstruction =
    persona.contentMode === "advocate"
      ? "Write persuasively for this community. Include a clear call to action. Emotionally resonant language is appropriate."
      : "Write in a strictly neutral, informational tone. Present facts only. No calls to action. No emotionally loaded language.";

  const platforms = persona.platforms.join(", ");

  return `You are a civic communications expert. Translate government policy into targeted social media content.

TARGET COMMUNITY: ${who}
TONE: ${tone}
CONTENT MODE: ${modeInstruction}
PLATFORMS NEEDED: ${platforms}

BILL: ${bill.title}
${bill.fullText.slice(0, 2000)}

Respond with ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "relevanceScore": <number 1-10>,
  "relevanceSummary": "<one sentence: why this bill matters to this specific community>",
  "instagram": {
    "slide1": "<hook slide: 1-2 punchy sentences, make it emotional and immediate>",
    "slide2": "<context slide: what the bill actually does in plain language>",
    "slide3": "<action slide: what to do next, with urgency>",
    "caption": "<instagram caption with 3-5 relevant hashtags>"
  },
  "tweet": [
    "<tweet 1/3: hook — under 240 chars>",
    "<tweet 2/3: detail — under 240 chars>",
    "<tweet 3/3: CTA — under 240 chars>"
  ],
  "sms": "<160 char max SMS in plain English>",
  "sms_es": "<160 char max SMS in Spanish — only if community is Spanish-speaking>"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { bill, persona } = (await req.json()) as {
      bill: Bill;
      persona: PersonaParams;
    };

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system:
        "You are a civic communications expert. You ALWAYS respond with valid JSON only — no prose, no markdown, no explanation. If bill text is short, infer from the title and generate your best content anyway.",
      messages: [{ role: "user", content: buildPrompt(bill, persona) }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown fences Claude sometimes adds despite instructions
    const text = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

    const campaign = JSON.parse(text);
    return NextResponse.json(campaign);
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "Failed to generate campaign" },
      { status: 500 }
    );
  }
}
