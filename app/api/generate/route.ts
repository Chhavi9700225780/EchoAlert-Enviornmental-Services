import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    // Remove the data URL prefix to get just the base64 string
    const base64Image = image.split(",")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `I have an image of waste material. Please suggest 3-5 creative DIY ideas to reuse or upcycle this item. 
    Focus on practical, environmentally friendly solutions that are relatively easy to implement. 
    Format each suggestion as a clear, step-by-step instruction.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Split the text into separate suggestions
    const suggestions = text
      .split(/\d+\./)
      .filter(Boolean)
      .map(s => s.trim());

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}