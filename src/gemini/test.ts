import { GoogleGenAI } from "@google/genai";

export async function testGeminiKey(key: string) {
  const ai = new GoogleGenAI({
    apiKey: key,
  });

  await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: "Hello, how are you!",
  });
}
