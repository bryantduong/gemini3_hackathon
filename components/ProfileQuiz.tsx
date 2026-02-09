import React, { useState } from 'react';
import { ProfileType } from '../types';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { getFactionName } from '../App';

interface ProfileQuizProps {
  onComplete: (recommendedProfile: ProfileType, isColorBlind: boolean) => void;
  onCancel: () => void;
}

const questions = [
  {
    id: 1,
    text: "When you try to read a spellbook (or textbook), what happens?",
    options: [
      { text: "The words dance, blur, or flip around.", score: { [ProfileType.DYSLEXIA]: 3 } },
      { text: "I can read, but I get bored and lose focus quickly.", score: { [ProfileType.ADHD]: 2 } },
      { text: "The words are fine, but I don't understand the hidden meanings.", score: { [ProfileType.ELL]: 2, [ProfileType.AUTISM]: 1 } },
    ]
  },
  {
    id: 2,
    text: "How do you handle complex potions (math problems)?",
    options: [
      { text: "I love the logic and rules!", score: { [ProfileType.AUTISM]: 1 } },
      { text: "The numbers get jumbled up in my head.", score: { [ProfileType.DYSCALCULIA]: 3 } },
      { text: "I skip steps because I want to finish fast.", score: { [ProfileType.ADHD]: 2 } },
    ]
  },
  {
    id: 3,
    text: "What helps you learn new magic best?",
    options: [
      { text: "Pictures, diagrams, and videos.", score: { [ProfileType.DYSLEXIA]: 1, [ProfileType.ELL]: 2 } },
      { text: "Short bursts of practice with rewards.", score: { [ProfileType.ADHD]: 3 } },
      { text: "Clear, logical instructions with no fluff.", score: { [ProfileType.AUTISM]: 2, [ProfileType.DYSCALCULIA]: 1 } },
    ]
  },
  {
    id: 4,
    text: "Does 'It's raining cats and dogs' make sense to you?",
    options: [
      { text: "No! Why would animals fall from the sky?", score: { [ProfileType.AUTISM]: 2, [ProfileType.ELL]: 2 } },
      { text: "Yes, I know it just means heavy rain.", score: { [ProfileType.ADHD]: 1 } },
    ]
  },
  {
    id: 5,
    text: "Do some magical colors look the same to you (like red/green)?",
    isColorBlindQuestion: true,
    options: [
        { text: "Yes, sometimes colors blend together.", colorBlind: true },
        { text: "No, I see all colors clearly.", colorBlind: false }
    ]
  }
];

const getFactionDescription = (profile: ProfileType) => {
    switch (profile) {
        case ProfileType.DYSLEXIA:
            return "As a Phoenix, you see the world visually. We will adapt content by using Dyslexia-friendly fonts, adding vivid images for vocabulary, and keeping sentences short and punchy to stop the words from dancing.";
        case ProfileType.DYSCALCULIA:
            return "As an Owl, you need structure. We will break down every math problem into clear, colorful steps and visualize numbers so they stop getting jumbled in your head.";
        case ProfileType.ADHD:
            return "As a Falcon, you have speed but need focus. We will chop long texts into 'micro-quests' with frequent checkpoints and rewards to keep your momentum flying high.";
        case ProfileType.ELL:
            return "As a Griffin, you are bridging worlds. We will translate complex idioms into plain English and provide instant definitions for tricky wizard words.";
        case ProfileType.AUTISM:
            return "As a Dragon, you value truth and logic. We will remove confusing metaphors and organize information into perfect, predictable structures that make sense.";
        default:
            return "We will adapt the content to be clear, structured, and multimodal.";
    }
};

export const ProfileQuiz: React.FC<ProfileQuizProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isColorBlind, setIsColorBlind] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<ProfileType>(ProfileType.ADHD);

  const handleOptionSelect = (option: any) => {
    // Handle Colorblind specific logic
    if (questions[step].isColorBlindQuestion) {
        setIsColorBlind(option.colorBlind);
        finishQuiz(scores, option.colorBlind);
        return;
    }

    // Handle Scoring Logic
    const newScores = { ...scores };
    if (option.score) {
        Object.entries(option.score).forEach(([key, val]) => {
            newScores[key] = (newScores[key] || 0) + (val as number);
        });
    }
    setScores(newScores);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      finishQuiz(newScores, isColorBlind);
    }
  };

  const finishQuiz = (finalScores: Record<string, number>, colorBlindStatus: boolean) => {
    // Determine highest score
    let maxScore = 0;
    let winner = ProfileType.ADHD; // Default fallback

    Object.entries(finalScores).forEach(([key, val]) => {
      if (val > maxScore) {
        maxScore = val;
        winner = key as ProfileType;
      }
    });

    setResult(winner);
    setFinished(true);
  };

  const currentQ = questions[step];

  if (finished) {
      return (
          <div className="max-w-xl mx-auto p-12 text-center bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex flex-col items-center animate-fade-in border border-slate-100 dark:border-slate-700 transition-colors">
              <Sparkles className="w-20 h-20 text-brand-500 mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">The Sorting Hat Has Spoken!</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">You belong to...</p>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-600 mt-4 mb-8">
                  {getFactionName(result)}
              </h1>
              
              <div className="bg-brand-50 dark:bg-brand-900/30 p-6 rounded-2xl mb-8 text-left border border-brand-100 dark:border-brand-800">
                 <h3 className="font-bold text-brand-700 dark:text-brand-400 mb-2 uppercase text-sm tracking-wider">How we help you:</h3>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {getFactionDescription(result)}
                 </p>
              </div>

              <button 
                onClick={() => onComplete(result, isColorBlind)}
                className="bg-slate-900 dark:bg-brand-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
              >
                  Enter Your Dashboard &rarr;
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-brand-500 mb-2">
          <Sparkles size={24} />
          <span className="font-bold uppercase tracking-wider text-sm">Sorting Ceremony</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-brand-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-tight">
        {currentQ.text}
      </h2>

      <div className="space-y-4">
        {currentQ.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionSelect(opt)}
            className="w-full p-5 text-left text-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-slate-600 border-2 border-transparent hover:border-brand-300 dark:hover:border-brand-500 rounded-xl transition-all duration-200 flex items-center justify-between group"
          >
            {opt.text}
            <ArrowRight className="opacity-0 group-hover:opacity-100 text-brand-500 transition-opacity" />
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center text-slate-400 dark:text-slate-500 text-sm">
        <button onClick={onCancel} className="hover:text-slate-600 dark:hover:text-slate-300 underline">
          Cancel
        </button>
        <span>Question {step + 1} of {questions.length}</span>
      </div>
    </div>
  );
};