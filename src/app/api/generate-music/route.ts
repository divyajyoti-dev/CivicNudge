import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not set" }, { status: 500 });
  }

  try {
    const { prompt: rawPrompt } = (await req.json()) as { prompt: string };
    const prompt = rawPrompt?.slice(0, 500) ?? "";

    const res = await fetch("https://api.elevenlabs.io/v1/text-to-music", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ prompt, duration_ms: 30000 }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs Music error:", err);
      return NextResponse.json({ error: "Music generation failed" }, { status: 500 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("Music error:", err);
    return NextResponse.json({ error: "Music generation failed" }, { status: 500 });
  }
}
