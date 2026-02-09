import { GoogleGenAI } from "@google/genai";

const MODEL_NAME_CHAT = "gemini-3-flash-preview";

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { history, newMessage, contextTitle, contextScript, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
        return new Response('Missing API Key', { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const chat = ai.chats.create({
        model: MODEL_NAME_CHAT,
        config: {
        systemInstruction: `You are a friendly tutor helping a student with ${profile} understand a topic. 
        Topic Context: ${contextTitle} - ${contextScript}.
        Encourage the student to explain the topic in their own words. 
        If they are wrong, gently guide them. If right, praise them.`
        },
        history: history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    
    return new Response(JSON.stringify({ text: result.text }), {
        headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}