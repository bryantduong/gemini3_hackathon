import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ProfileType, TransformedDocument, Message } from "../types";

// Using 'gemini-3-flash-preview' for multimodal text generation tasks as it supports JSON schema
const MODEL_NAME_TRANSFORM = "gemini-3-flash-preview";
// Using the 'native-audio' optimized model for audio feedback tasks
const MODEL_NAME_AUDIO = "gemini-2.5-flash-native-audio-preview-12-2025";
// Chat model
const MODEL_NAME_CHAT = "gemini-3-flash-preview";
// TTS model
const MODEL_NAME_TTS = "gemini-2.5-flash-preview-tts";
// Video model
const MODEL_NAME_VIDEO = "veo-3.1-fast-generate-preview";

const getSystemInstruction = (profile: ProfileType): string => {
  const base = `You are an expert special education assistant. 
  Your goal is to restructure learning material into a multimodal JSON format optimized for: ${profile}.
  
  **GLOBAL REQUIREMENT**: 
  1. All explanations must be at a clear, accessible **High School Level**.
  2. Use Markdown heavily. Use **bold** for emphasis.
  3. For Math: Use LaTeX format enclosed in single dollar signs (e.g. $x^2 + 5$) for inline math.

  You must generate 6 distinct formats:
  1. **Blocks (Immersive Reader)**: This is the main content. Extract ALL details. Break long texts into chunks. Use 'math' blocks for step-by-step problems.
  2. **Slides**: Visual slideshow. Max 30 words per slide.
  3. **AudioScript**: Podcast-style script (3-5 mins).
  4. **Activities**: Interactive quizzes.
     - You **MUST** generate strictly **Multiple Choice Quizzes** (3-5 questions).
     - You **MUST** provide 'options', 'correctAnswer' (exact text string from options), and 'correctAnswerIndex' (0-based integer). Ensure there is exactly one correct answer.
  5. **Mindmap**: A hierarchical breakdown.
  6. **Flashcards**: Key terms only (front) and simple definitions (back).
  `;

  let specifics = "";
  switch (profile) {
    case ProfileType.DYSLEXIA:
      specifics = `Focus on: Short sentences, visual vocabulary aids. 
      In 'blocks', bold key terms within the text.
      Slides should have minimal text and strong visual cues. 
      Mindmap should be visual and simple. Mnemonics should use rhyme or imagery.`;
      break;
    case ProfileType.DYSCALCULIA:
      specifics = `Focus on: Breaking down math into granular steps. 
      In 'blocks', use specific 'math' type blocks for any numbers or formulas.
      Slides should visualize the logic (e.g., number lines). 
      Mindmap should show process flow for solving problems.`;
      break;
    case ProfileType.ADHD:
      specifics = `Focus on: "Micro-learning" chunks. 
      In 'blocks', keep text blocks short (max 2-3 sentences) and use 'checkpoint' blocks frequently to check understanding.
      Audio script should be energetic and concise. 
      Flashcards are crucial for active recall.`;
      break;
    case ProfileType.ELL:
      specifics = `Focus on: Plain English, explaining idioms. 
      In 'blocks', provide definitions for complex words using 'vocabulary' blocks.
      Mnemonics should help link English terms to concepts.`;
      break;
    case ProfileType.AUTISM:
      specifics = `Focus on: Literal language, logical structure. 
      In 'blocks', use very clear, logical headings. Avoid metaphors.
      Mindmap should be very structured and logical.`;
      break;
  }

  return `${base}\n${specifics}`;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A clear, descriptive title" },
    blocks: {
      type: Type.ARRAY,
      description: "Full-length detailed content split into blocks for reading.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['text', 'heading', 'math', 'vocabulary', 'checkpoint', 'summary'] },
          content: { type: Type.STRING, description: "Markdown supported (include math in $...$). For 'text', keep original detail." },
          visualAid: { type: Type.STRING, description: "Emoji or icon" },
          simplification: { type: Type.STRING },
          highlight: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['id', 'type', 'content']
      }
    },
    slides: {
      type: Type.ARRAY,
      description: "Visual slides for 'Watch' mode",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          content: { type: Type.STRING, description: "Concise text for the slide (High school level)" },
          visualCue: { type: Type.STRING, description: "Emoji or scene description" },
          speakerNotes: { type: Type.STRING, description: "Narration script for this slide" }
        },
        required: ['id', 'content', 'visualCue', 'speakerNotes']
      }
    },
    audioScript: { type: Type.STRING, description: "A complete, engaging podcast-style script summarizing the topic." },
    activities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['quiz'] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING, description: "The EXACT text of the correct option." },
          correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct option." }
        },
        required: ['id', 'type', 'question', 'options', 'correctAnswer', 'correctAnswerIndex']
      }
    },
    mindmap: {
      type: Type.ARRAY,
      description: "Flat list of nodes representing a tree structure",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          parentId: { type: Type.STRING, description: "ID of the parent node. Empty or null for root." },
          label: { type: Type.STRING, description: "Short label for the node" },
          description: { type: Type.STRING, description: "Definition or detail shown on expand." }
        },
        required: ['id', 'label']
      }
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          front: { type: Type.STRING, description: "The single Key Term or Concept Name (No dates unless it is the name)" },
          back: { type: Type.STRING, description: "The definition or explanation" },
          mnemonic: { type: Type.STRING, description: "A memory aid (rhyme, acronym, image association)" }
        },
        required: ['id', 'front', 'back']
      }
    }
  },
  required: ['title', 'blocks', 'slides', 'audioScript', 'activities', 'mindmap', 'flashcards']
};

export const transformDocument = async (
  dataBase64: string, 
  mimeType: string,
  profile: ProfileType
): Promise<TransformedDocument> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const parts = [];
  if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      parts.push({ inlineData: { mimeType, data: dataBase64 } });
      parts.push({ text: `Analyze and restructure for ${profile}. Output JSON.` });
  } else {
      // Text fallback
      parts.push({ text: `Analyze content (base64 decoded): ${atob(dataBase64)} for ${profile}. Output JSON.` });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME_TRANSFORM,
      contents: { parts },
      config: {
        systemInstruction: getSystemInstruction(profile),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      }
    });

    if (!response.text) throw new Error("No response generated");
    return JSON.parse(response.text) as TransformedDocument;
  } catch (error) {
    console.error("Transformation failed:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME_TTS,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is a neutral, friendly voice
        },
      },
    },
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateEducationalVideo = async (topic: string, detail: string): Promise<string> => {
  // Check for API Key selection (Required for Veo)
  if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
      // The component calling this should handle the UI to open the dialog, but we throw a specific error
      throw new Error("API_KEY_SELECTION_REQUIRED");
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const prompt = `Educational video clip, high school teacher style, explaining: ${topic}. ${detail}. Clear diagram, professional, educational animation, 16:9.`;

  let operation = await ai.models.generateVideos({
    model: MODEL_NAME_VIDEO,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video generation failed");
  
  // Append API key for playback
  return `${uri}&key=${import.meta.env.VITE_API_KEY}`;
};

export const getAudioFeedback = async (
  audioBase64: string, 
  documentContext: TransformedDocument,
  profile: ProfileType
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  // Truncate context to save tokens if needed, but usually fine
  const contextStr = `Title: ${documentContext.title}. Summary: ${documentContext.audioScript.substring(0, 500)}...`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME_AUDIO,
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
          { text: `The student (${profile}) is explaining this topic. Be encouraging and clarify any misconceptions. Context: ${contextStr}` }
        ]
      }
    });
    return response.text || "Keep going, I'm listening!";
  } catch (error) {
    return "I had trouble hearing that. Can you say it again?";
  }
};

export const chatWithGemini = async (
  history: Message[], 
  newMessage: string, 
  context: TransformedDocument,
  profile: ProfileType
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey:  });
  
  const chat = ai.chats.create({
    model: MODEL_NAME_CHAT,
    config: {
      systemInstruction: `You are a friendly tutor helping a student with ${profile} understand a topic. 
      Topic Context: ${context.title} - ${context.audioScript.substring(0, 1000)}.
      Encourage the student to explain the topic in their own words. 
      If they are wrong, gently guide them. If right, praise them.`
    },
    history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "";
};
