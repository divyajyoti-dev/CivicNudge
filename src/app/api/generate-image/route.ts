import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_API_KEY not set" }, { status: 500 });
  }

  try {
    const { prompt: rawPrompt } = (await req.json()) as { prompt: string };
    const prompt = rawPrompt?.slice(0, 500) ?? "";

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "imagen-3.0-generate-002",
      contents: prompt,
      config: { responseModalities: [Modality.IMAGE] },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    ) as { inlineData: { mimeType: string; data: string } } | undefined;

    if (!part?.inlineData) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    return NextResponse.json({
      imageBase64: part.inlineData.data,
      mimeType: part.inlineData.mimeType,
    });
  } catch (err) {
    console.error("Image generation error:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
