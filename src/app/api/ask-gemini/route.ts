import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

export type Message = {
  id: string
  content: string|null
  role: "user" | "assistant"
}

export async function POST(req: NextRequest) {
  const { input, model } = await req.json();

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const config = {
    responseMimeType: 'text/plain',
  };

  const historyMessages = (input.history ?? []).map((msg: Message) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  })); 

  const contents = [
    ...historyMessages,
    {
      role: 'user',
      parts: [{ text: input.question }],
    },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await ai.models.generateContentStream({
          model,
          config,
          contents,
        });

        for await (const chunk of result) {
          controller.enqueue(new TextEncoder().encode(chunk.text));
        }
        controller.close();
      } catch (err) {
        console.log(err)
        controller.enqueue(new TextEncoder().encode('Error'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    },
  });
}

