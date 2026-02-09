import { GoogleGenAI } from "@google/genai";

const MODEL_NAME_AUDIO = "gemini-2.5-flash-native-audio-preview-12-2025";

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { audioBase64, contextSummary, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
        return new Response('Missing API Key', { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME_AUDIO,
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
          { text: `The student (${profile}) is explaining this topic. Be encouraging and clarify any misconceptions. Context: ${contextSummary}` }
        ]
      }
    });

    return new Response(JSON.stringify({ text: response.text || "Keep going!" }), {
        headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}