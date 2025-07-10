'use client';
import type { Message } from "~/components/ui/chatMessage"
interface askGeminiBackgroundProps { 
  chatId: string;
  question: string;
  history: Message[];
  model: string;
  onStart: () => void;
  onChunk: (chunk: string) => void;
  onDone?: () => void;
}
export default async function askGeminiBackground({ chatId, question, history, model, onStart, onChunk, onDone, }:askGeminiBackgroundProps ) {
  onStart?.();

  const res = await fetch('/api/ask-gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { question, history },
      model,
    }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    onChunk(chunk);
  }

  onDone?.();
}

