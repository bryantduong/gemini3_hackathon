import { GoogleGenAI, Modality } from "@google/genai";

const MODEL_NAME_TTS = "gemini-2.5-flash-preview-tts";

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { text } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
        return new Response('Missing API Key', { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: MODEL_NAME_TTS,
        contents: [{ parts: [{ text }] }],
        config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, 
            },
        },
        },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    
    return new Response(JSON.stringify({ audioData }), {
        headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}