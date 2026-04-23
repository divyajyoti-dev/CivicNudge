import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { billText } = (await req.json()) as { billText: string };

    // Use Sonnet for nuanced bias detection
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a neutral fact-checking expert analyzing a government bill document for bias indicators.

Analyze the following document for bias signals. Look for:
- "loaded_language": emotionally charged words (radical, dangerous, sensible, common-sense, etc.)
- "framing_asymmetry": document heavily favors one perspective (>70% of content)
- "missing_stakeholders": key affected groups are never mentioned
- "calls_to_action": text urges specific political actions (vote yes/no, contact your rep)
- "party_attribution": bill tied to a person or party rather than its provisions

Respond with ONLY valid JSON (no markdown):
{
  "verdict": "neutral" | "mixed" | "advocacy",
  "confidence": <0.0-1.0>,
  "signals": [
    { "type": "<signal_type>", "examples": ["<example>"], "severity": "low" | "medium" | "high" }
  ],
  "summary": "<one plain-English sentence describing the document's overall bias level>"
}

Rules:
- verdict "neutral": no high-severity signals
- verdict "mixed": 1-2 medium signals, no high
- verdict "advocacy": any high-severity signal present

DOCUMENT:
${billText.slice(0, 3000)}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const report = JSON.parse(text);
    return NextResponse.json(report);
  } catch (err) {
    console.error("Bias API error:", err);
    return NextResponse.json({ error: "Bias analysis failed" }, { status: 500 });
  }
}
