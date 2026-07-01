import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function callLovableAiJson<T = unknown>(opts: {
  model?: string;
  system: string;
  user: string;
}): Promise<T> {
  const model = opts.model ?? "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: `${opts.system}\n\n${opts.user}`,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "{}";

  try {
    return JSON.parse(text) as T;
  } catch {
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
