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
  const models = [
    opts.model ?? "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`AI Model: ${model} Attempt: ${attempt}`);

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
          const cleaned = text
            .replace(/```json\s*|\s*```/g, "")
            .trim();

          return JSON.parse(cleaned) as T;
        }
      } catch (err) {
        lastError = err;

        console.error(
          `Gemini failed (${model}) attempt ${attempt}`,
          err
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      }
    }
  }

  throw lastError;
}
