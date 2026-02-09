import { ProfileType, TransformedDocument, Message } from "../types";

export const transformDocument = async (
  dataBase64: string, 
  mimeType: string,
  profile: ProfileType
): Promise<TransformedDocument> => {
  const response = await fetch('/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataBase64, mimeType, profile })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transformation failed: ${errorText}`);
  }

  return response.json();
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
     throw new Error("TTS generation failed");
  }

  const data = await response.json();
  return data.audioData;
};

export const getAudioFeedback = async (
  audioBase64: string, 
  documentContext: TransformedDocument,
  profile: ProfileType
): Promise<string> => {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        audioBase64, 
        contextSummary: `Title: ${documentContext.title}. Summary: ${documentContext.audioScript.substring(0, 500)}...`,
        profile 
    })
  });

  if (!response.ok) return "I had trouble hearing that. Can you say it again?";

  const data = await response.json();
  return data.text;
};

export const chatWithGemini = async (
  history: Message[], 
  newMessage: string, 
  context: TransformedDocument,
  profile: ProfileType
): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        history, 
        newMessage, 
        contextTitle: context.title,
        contextScript: context.audioScript.substring(0, 1000),
        profile 
    })
  });

  if (!response.ok) throw new Error("Chat failed");

  const data = await response.json();
  return data.text;
};