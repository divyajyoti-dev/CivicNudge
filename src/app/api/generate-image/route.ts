import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt: string };

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Create a bold, visually striking SVG civic advocacy poster (512×512 pixels) for this campaign message: "${(prompt ?? "").slice(0, 300)}"

Requirements:
- viewBox="0 0 512 512", width="512" height="512"
- Dark or rich background using gradients or solid color
- Large, bold, white or light-colored headline text (wrap long text with <text> or <tspan> elements)
- Geometric shapes, abstract patterns, or visual motifs that reinforce the message
- Professional, modern design — think bold typography + minimal graphic elements
- Include 2–3 lines of text maximum, centered in the composition
- Use <defs> with gradients or patterns if it adds visual interest

Output ONLY the raw SVG code. No markdown, no explanation, no code fences.`,
        },
      ],
    });

    const svg = (message.content[0] as { text: string }).text
      .replace(/^```svg\s*/i, "")
      .replace(/^```xml\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch (err) {
    console.error("Image generation error:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
