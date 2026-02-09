
export enum AppMode {
  UPLOAD = 'UPLOAD',
  SELECT_PROFILE = 'SELECT_PROFILE',
  QUIZ = 'QUIZ',
  VIEW_CONTENT = 'VIEW_CONTENT',
  ABOUT = 'ABOUT',
}

// Internal identifiers - mapped to friendly names in UI
export enum ProfileType {
  DYSLEXIA = 'DYSLEXIA',
  DYSCALCULIA = 'DYSCALCULIA',
  ADHD = 'ADHD',
  ELL = 'ELL',
  AUTISM = 'AUTISM',
  CUSTOM = 'CUSTOM'
}

export interface UserSettings {
  id: string;
  name: string;
  baseProfile: ProfileType;
  customizations: {
    fontFamily: 'sans' | 'dyslexic' | 'mono';
    fontSize: 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl';
    lineSpacing: 'leading-normal' | 'leading-relaxed' | 'leading-loose';
    colorTheme: 'default' | 'sepia' | 'dark' | 'high-contrast';
    ttsSpeed: number;
    showImages: boolean;
    isColorBlind: boolean;
  };
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'math' | 'vocabulary' | 'checkpoint' | 'summary';
  content: string;
  originalText?: string;
  highlight?: string;
  visualAid?: string; // Emoji or description
  simplification?: string;
  steps?: string[]; // For math
}

export interface Slide {
  id: string;
  content: string;
  visualCue: string; // Emoji, icon name, or short scene description
  speakerNotes: string; // For TTS narration
}

export interface Activity {
  id: string;
  type: 'quiz' | 'checklist' | 'reflection';
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswerIndex?: number; // 0-based index of the correct option
}

export interface MindmapNode {
  id: string;
  parentId?: string; // If undefined/null, it's a root node
  label: string;
  description?: string;
}

export interface Flashcard {
  id: string;
  front: string;    // Key Term or Date
  back: string;     // Definition or Event
  mnemonic?: string; // Helpful memory aid
}

export interface TransformedDocument {
  title: string;
  blocks: ContentBlock[]; // For Immersive Reader
  slides: Slide[];        // For Visual/Watch mode
  audioScript: string;    // For Audio Lesson mode
  activities: Activity[]; // For Practice mode
  mindmap: MindmapNode[]; // For Mindmap mode
  flashcards: Flashcard[]; // For Flashcards mode
}

export interface FeedbackData {
  blockId: string;
  isPositive: boolean;
  comment?: string;
  originalContent: string;
  timestamp?: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}