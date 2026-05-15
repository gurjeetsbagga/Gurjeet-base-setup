/**
 * Parse Server-Sent Events from a fetch Response body.
 * Auryn API emits `data: {json}\n\n` chunks and `data: [DONE]\n\n`.
 */
export async function* parseSseStream<T>(response: Response): AsyncGenerator<T, void, undefined> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        yield JSON.parse(payload) as T;
      } catch {
        /* skip malformed */
      }
    }
  }
}
