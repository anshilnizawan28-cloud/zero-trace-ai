const BASE = "https://ai.gateway.lovable.dev/v1";

export async function callLovableAiJson<T = unknown>(opts: {
  model?: string;
  system: string;
  user: string;
}): Promise<T> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err: Error & { status?: number } = new Error(`AI gateway ${res.status}: ${txt.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as T;
  } catch {
    // Strip code fences if any
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
