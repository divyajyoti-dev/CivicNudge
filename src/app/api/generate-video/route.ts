import { NextRequest, NextResponse } from "next/server";

const KLING_BASE = "https://api.klingai.com";

export async function POST(req: NextRequest) {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KLING_API_KEY not set" }, { status: 500 });
  }

  try {
    const { prompt: rawPrompt } = (await req.json()) as { prompt: string };
    const prompt = rawPrompt?.slice(0, 500) ?? "";

    const res = await fetch(`${KLING_BASE}/v1/videos/text2video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "9:16",
        duration: 5,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Kling submit error:", err);
      return NextResponse.json({ error: "Video submission failed" }, { status: 500 });
    }

    const data = await res.json();
    const taskId = data?.data?.task_id ?? data?.task_id;
    return NextResponse.json({ taskId });
  } catch (err) {
    console.error("Video error:", err);
    return NextResponse.json({ error: "Video generation failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KLING_API_KEY not set" }, { status: 500 });
  }

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${KLING_BASE}/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Poll failed" }, { status: 500 });
    }

    const data = await res.json();
    const status = data?.data?.task_status ?? data?.status;
    const videoUrl = data?.data?.task_result?.videos?.[0]?.url ?? null;
    return NextResponse.json({ status, videoUrl });
  } catch (err) {
    console.error("Video poll error:", err);
    return NextResponse.json({ error: "Poll failed" }, { status: 500 });
  }
}
