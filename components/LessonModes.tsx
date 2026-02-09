import React, { useState, useEffect, useRef } from 'react';
import { Slide, Activity, Message, TransformedDocument, ProfileType, MindmapNode, Flashcard } from '../types';
import { Play, Pause, ChevronRight, ChevronLeft, Mic, Send, Check, Volume2, RotateCcw, Loader2, GitBranch, Lightbulb, Video, AlertCircle, Plus, Minus, Square, CheckSquare } from 'lucide-react';
import { chatWithGemini, generateSpeech } from '../services/gemini';
import { AudioRecorder, playPCM } from '../utils/audio';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// --- Watch Mode (Slides) ---
export const SlidesView: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto p-4 md:p-8">
      
      {/* Slide Card Container */}
      <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Top Header Bar */}
        <div className="h-16 px-6 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-sm z-10">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                Slide {current + 1} / {slides.length}
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 overflow-hidden gap-8">
          
          {/* Visual Side */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md min-h-[300px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden">
             <div className="text-9xl transform transition-all duration-300 cursor-default select-none drop-shadow-sm opacity-90 hover:scale-110 hover:rotate-3">
                {slides[current].visualCue}
            </div>
          </div>

          {/* Text Side */}
          <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 text-center md:text-left flex flex-col justify-center">
             <div className="text-xl md:text-2xl font-bold text-slate-800 leading-snug mb-4 markdown-content">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                >
                    {slides[current].content}
                </ReactMarkdown>
             </div>
             <div className="text-slate-500 text-base md:text-lg leading-relaxed markdown-content">
                 <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                >
                    {slides[current].speakerNotes}
                </ReactMarkdown>
             </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-slate-50 h-24 px-6 md:px-12 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button 
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <div className="bg-white border border-slate-200 group-hover:bg-slate-50 p-2 rounded-full transition-colors shadow-sm">
                <ChevronLeft size={24} className="text-slate-700" />
            </div>
            <span className="font-bold text-slate-600 text-lg hidden md:block">Previous</span>
          </button>
          
          <div className="flex gap-2 mx-4">
            {slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-brand-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`} 
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))}
            disabled={current === slides.length - 1}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <span className="font-bold text-slate-600 text-lg hidden md:block">Next</span>
            <div className="bg-brand-500 group-hover:bg-brand-600 p-2 rounded-full transition-colors text-white shadow-lg shadow-brand-200 ring-2 ring-brand-100 ring-offset-2">
                <ChevronRight size={24} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Listen Mode (Audio) ---
export const AudioView: React.FC<{ script: string }> = ({ script }) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const togglePlay = async () => {
    if (!audioContextRef.current) return;

    if (playing) {
      currentSourceRef.current?.stop();
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        const pcmBase64 = await generateSpeech(script);
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const source = await playPCM(pcmBase64, audioContextRef.current);
        currentSourceRef.current = source;
        setPlaying(true);
        setLoading(false);

        source.onended = () => setPlaying(false);
      } catch (e) {
        console.error("Failed to play audio", e);
        setLoading(false);
        setPlaying(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
       <div className="w-64 h-64 bg-brand-50 rounded-full flex items-center justify-center mb-12 relative">
          {playing && (
            <div className="absolute inset-0 rounded-full border-4 border-brand-200 animate-ping opacity-20"></div>
          )}
          <Volume2 size={80} className={`text-brand-500 ${playing ? 'animate-pulse' : ''}`} />
       </div>

       <button 
         onClick={togglePlay}
         disabled={loading}
         className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl disabled:opacity-70 disabled:cursor-wait"
       >
         {loading ? <Loader2 className="animate-spin" /> : (playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />)}
         {loading ? "Generating Audio..." : (playing ? "Pause Lesson" : "Play Lesson")}
       </button>
       
       <div className="mt-8 max-w-xl text-center text-slate-500">
         {loading && (
             <p className="text-sm font-semibold text-brand-600 animate-pulse mb-2">Generating a full audio podcast can take up to 20 seconds. Please wait.</p>
         )}
         <p>Sit back and listen. This audio lesson is generated specifically for your learning profile using a natural, neural voice.</p>
       </div>
    </div>
  );
};

// --- Mindmap Mode ---

const InteractiveMindmapNode: React.FC<{ 
    node: MindmapNode, 
    allNodes: MindmapNode[], 
    depth: number 
}> = ({ node, allNodes, depth }) => {
    const [expanded, setExpanded] = useState(depth === 0);
    const children = allNodes.filter(n => n.parentId === node.id);
    const hasChildren = children.length > 0;

    return (
        <div className="flex flex-col items-center">
            <button 
                onClick={() => setExpanded(!expanded)}
                className={`
                    relative z-10 px-6 py-4 rounded-xl shadow-md border-2 transition-all duration-300 min-w-[180px] text-center
                    ${expanded 
                        ? 'bg-white border-brand-500 ring-4 ring-brand-100' 
                        : 'bg-slate-50 border-slate-200 hover:border-brand-300'
                    }
                `}
            >
                <div className="font-bold text-slate-800">{node.label}</div>
                {expanded && node.description && (
                     <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 animate-fade-in">
                        {node.description}
                     </div>
                )}
                {hasChildren && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full border border-slate-200 p-0.5 shadow-sm text-slate-400">
                        {expanded ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                )}
            </button>

            {expanded && hasChildren && (
                <div className="flex flex-col items-center animate-slide-down">
                    <div className="w-px h-8 bg-slate-300"></div>
                    
                    <div className="flex gap-8 relative pt-4">
                         {children.length > 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-px bg-slate-300 border-t border-slate-300"></div>
                         )}
                         
                         {children.map((child, index) => (
                             <div key={child.id} className="relative flex flex-col items-center">
                                 <div className="absolute -top-4 w-px h-4 bg-slate-300"></div>
                                 <InteractiveMindmapNode node={child} allNodes={allNodes} depth={depth + 1} />
                             </div>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const MindmapView: React.FC<{ mindmap: MindmapNode[] }> = ({ mindmap }) => {
  const rootNodes = mindmap.filter(n => !n.parentId || n.parentId === 'root');

  return (
    <div className="p-8 min-h-[60vh] overflow-x-auto bg-slate-50/50 rounded-3xl border border-slate-200">
        <div className="min-w-max mx-auto flex gap-12 justify-center py-8">
            {rootNodes.map(root => (
                <InteractiveMindmapNode key={root.id} node={root} allNodes={mindmap} depth={0} />
            ))}
        </div>
    </div>
  );
};

// --- Flashcards Mode ---
export const FlashcardsView: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c + 1) % flashcards.length), 150);
  };
  
  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c === 0 ? flashcards.length - 1 : c - 1)), 150);
  };

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-center p-12 text-slate-500">No flashcards available for this content.</div>;
  }

  const card = flashcards[current];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 perspective-1000">
       <div 
         onClick={() => setFlipped(!flipped)}
         className={`
           relative w-80 h-96 cursor-pointer transition-transform duration-500 transform-style-3d
           ${flipped ? 'rotate-y-180' : ''}
         `}
       >
         {/* Front */}
         <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 text-center overflow-y-auto custom-scrollbar hover:border-brand-300 transition-colors">
            <span className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-4 sticky top-0 bg-white pb-2 w-full">Key Term</span>
            <h3 className="text-3xl font-extrabold text-slate-800 leading-tight">{card.front}</h3>
            <p className="mt-8 text-slate-400 text-sm animate-pulse">Click to flip</p>
         </div>

         {/* Back */}
         <div 
           className="absolute inset-0 backface-hidden bg-brand-500 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 text-white overflow-y-auto custom-scrollbar"
         >
            <h3 className="text-lg font-medium leading-relaxed mb-6">{card.back}</h3>
            {card.mnemonic && (
               <div className="bg-white/20 p-4 rounded-xl w-full">
                  <div className="flex items-center justify-center gap-2 font-bold mb-1 text-yellow-300">
                     <Lightbulb size={16} /> Memory Aid
                  </div>
                  <p className="italic text-sm">{card.mnemonic}</p>
               </div>
            )}
         </div>
       </div>

       <div className="flex items-center gap-6">
          <button onClick={handlePrev} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm">
             <ChevronLeft size={24} />
          </button>
          <span className="font-bold text-slate-500">{current + 1} / {flashcards.length}</span>
          <button onClick={handleNext} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm">
             <ChevronRight size={24} />
          </button>
       </div>
    </div>
  );
};

// --- Practice Mode (Activities) ---
export const ActivitiesView: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  // Quiz State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState<Record<string, boolean>>({});
  
  // Checklist State (Multi-select)
  const [checklistState, setChecklistState] = useState<Record<string, Record<string, boolean>>>({});

  const handleQuizSelect = (id: string, option: string) => {
    setAnswers({ ...answers, [id]: option });
    setShowResult({ ...showResult, [id]: true });
  };

  const handleChecklistToggle = (id: string, option: string) => {
    setChecklistState(prev => {
        const activityState = prev[id] || {};
        return {
            ...prev,
            [id]: {
                ...activityState,
                [option]: !activityState[option]
            }
        };
    });
  };

  const isAnswerCorrect = (userOption: string, correctOption: string | undefined, correctIndex: number | undefined, allOptions: string[] = []): boolean => {
      // 1. Primary Check: Index Matching
      if (typeof correctIndex === 'number' && correctIndex >= 0 && allOptions && allOptions.length > correctIndex) {
          const userIndex = allOptions.findIndex(opt => opt === userOption);
          if (userIndex === correctIndex) return true;
      }
      if (!correctOption) return false;
      // 2. String Cleaning
      const clean = (str: string) => str.replace(/[\$\*_`\s]/g, '').toLowerCase().trim();
      const user = clean(userOption);
      const correct = clean(correctOption);
      if (user === correct) return true;
      // 3. Numeric Fuzzy Match
      const numUser = parseFloat(user);
      const numCorrect = parseFloat(correct);
      if (!isNaN(numUser) && !isNaN(numCorrect)) {
          return Math.abs(numUser - numCorrect) < 0.001;
      }
      return false;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      {activities.map((act, idx) => (
        <div key={act.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-lg text-sm">
               Task {idx + 1}
            </span>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{act.type}</span>
          </div>
          
          <div className="text-xl font-bold text-slate-800 mb-6 markdown-content">
             <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[rehypeKatex]}
             >
                {act.question}
             </ReactMarkdown>
          </div>
          
          {/* Quiz Rendering */}
          {act.type === 'quiz' && (
             <div className="space-y-3">
                {act.options?.map(opt => {
                  const isSelected = answers[act.id] === opt;
                  const revealed = showResult[act.id];
                  
                  const correct = isAnswerCorrect(opt, act.correctAnswer, act.correctAnswerIndex, act.options);
                  
                  let style = "border-slate-200 hover:border-brand-400 hover:bg-slate-50";
                  
                  if (revealed) {
                    if (correct) {
                        style = "bg-green-50 border-green-500 text-green-800 font-bold";
                    } else if (isSelected) {
                        style = "bg-red-50 border-red-500 text-red-800";
                    } else {
                        style = "border-slate-200 opacity-50";
                    }
                  } else if (isSelected) {
                    style = "border-brand-500 bg-brand-50";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => !revealed && handleQuizSelect(act.id, opt)}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex justify-between items-center ${style}`}
                    >
                      <div className="markdown-content">
                           <ReactMarkdown 
                               components={{p: 'span'}} 
                               remarkPlugins={[remarkGfm, remarkMath]} 
                               rehypePlugins={[rehypeKatex]}
                           >
                               {opt}
                           </ReactMarkdown>
                      </div>
                      {revealed && correct && <Check size={20} className="text-green-600" />}
                    </button>
                  );
                })}
             </div>
          )}

          {/* Checklist Rendering */}
          {act.type === 'checklist' && (
             <div className="space-y-3">
                 {act.options && act.options.length > 0 ? (
                     act.options.map(opt => {
                         const isChecked = checklistState[act.id]?.[opt] || false;
                         return (
                            <button
                                key={opt}
                                onClick={() => handleChecklistToggle(act.id, opt)}
                                className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-start gap-4 ${isChecked ? 'bg-brand-50 border-brand-500 text-brand-900' : 'bg-white border-slate-200 hover:border-brand-300'}`}
                            >
                                <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-slate-50'}`}>
                                    {isChecked && <Check size={16} />}
                                </div>
                                <div className={`markdown-content ${isChecked ? 'line-through opacity-70' : ''}`}>
                                    <ReactMarkdown 
                                        components={{p: 'span'}} 
                                        remarkPlugins={[remarkGfm, remarkMath]} 
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {opt}
                                    </ReactMarkdown>
                                </div>
                            </button>
                         );
                     })
                 ) : (
                     <div className="text-slate-400 italic p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                         Use this checklist to track your progress on paper.
                     </div>
                 )}
             </div>
          )}

          {/* Reflection Rendering */}
          {act.type === 'reflection' && (
             <textarea className="w-full border-2 border-slate-200 rounded-xl p-4 h-32 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" placeholder="Type your thoughts here..." />
          )}
        </div>
      ))}
    </div>
  );
};

// --- Explain Mode (Conversation) ---
export const ConversationView: React.FC<{ context: TransformedDocument; profile: ProfileType }> = ({ context, profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi! I'd love to hear what you learned about "${context.title}". Can you explain it to me in your own words?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef(new AudioRecorder());

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithGemini(messages, text, context, profile);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = async () => {
    if (isRecording) {
      setIsRecording(false);
      const recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (recognition) {
         // Placeholder for integration
      }
    } else {
      setIsRecording(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
        };
        recognition.start();
      } else {
        alert("Speech recognition not supported in this browser.");
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
         {messages.map((m, i) => (
           <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] p-4 rounded-2xl text-lg ${
               m.role === 'user' 
               ? 'bg-brand-500 text-white rounded-tr-none' 
               : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
             }`}>
               <div className="markdown-content">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                    >
                        {m.text}
                    </ReactMarkdown>
               </div>
             </div>
           </div>
         ))}
         {loading && (
           <div className="flex justify-start">
             <div className="bg-slate-200 p-4 rounded-2xl rounded-tl-none animate-pulse">Thinking...</div>
           </div>
         )}
         <div ref={scrollRef} />
       </div>

       <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
         <button 
           onClick={toggleMic}
           className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
         >
           <Mic size={24} />
         </button>
         <input 
           value={input}
           onChange={e => setInput(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && handleSend(input)}
           placeholder="Explain it in your own words..."
           className="flex-1 bg-slate-100 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-brand-500"
         />
         <button 
           onClick={() => handleSend(input)}
           disabled={!input.trim() || loading}
           className="p-3 bg-brand-500 text-white rounded-full hover:bg-brand-600 disabled:opacity-50 transition-colors"
         >
           <Send size={24} />
         </button>
       </div>
    </div>
  );
};