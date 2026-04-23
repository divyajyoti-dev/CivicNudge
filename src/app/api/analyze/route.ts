import Anthropic from "@anthropic-ai/sdk";
import { Bill, PersonaParams } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { bill, persona }: { bill: Bill; persona: PersonaParams } = await req.json();

    const platformInstructions: Record<string, string> = {
      story: `"story": { "slide1": "<hook — punchy 1-2 sentences>", "slide2": "<context — plain English>", "slide3": "<CTA — specific action>", "caption": "<caption with hashtags>" }`,
      image: `"image": { "headline": "<bold 1-sentence headline>", "body": "<1-2 sentence description>", "caption": "<caption with hashtags>" }`,
      audio: `"audio": { "intro": "<opening hook>", "body": "<main message, conversational, 45-60 seconds>", "cta": "<closing action step>" }`,
      sms: `"sms": { "text": "<160 char max English>", "text_es": "<160 char max Spanish>" }`,
      email: `"email": { "subject": "<email subject line>", "preview": "<preview text, 1 sentence>", "body": "<full email body, 3-4 paragraphs>" }`,
      twitter: `"twitter": { "thread": ["<tweet 1 — hook, under 240 chars>", "<tweet 2 — key detail, under 240 chars>", "<tweet 3 — CTA, under 240 chars>"] }`,
      video: `"video": { "prompt": "<15-second vertical video scene description for text-to-video — vivid, specific, no text overlays>" }`,
    };

    const requested = persona.platforms
      .map(p => platformInstructions[p])
      .filter(Boolean)
      .join(",\n    ");

    const prompt = `You are a civic communications expert. Translate dense government policy into targeted, empathetic content for a specific community.

Bill: ${bill.code} — ${bill.title}
Bill text: ${bill.fullText}
Target community: ${persona.description}
Action goal: ${persona.actionBias ? "Drive to Action" : "Inform"}
Requested platforms: ${persona.platforms.join(", ")}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "relevanceSummary": "<one sentence on why this bill matters to this specific community>",
  "platforms": {
    ${requested}
  }
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(clean);

    return Response.json(result);
  } catch (err) {
    console.error("Claude API error:", err);
    return Response.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
