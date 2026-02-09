import React, { useState } from 'react';
import { TransformedDocument, UserSettings, ContentBlock, ProfileType } from '../types';
import { RefreshCw, BookOpen, MonitorPlay, Headphones, PenTool, MessageCircle, Settings, X, ArrowLeft, GitBranch, Layers, Moon, Sun } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { SlidesView, AudioView, ActivitiesView, ConversationView, MindmapView, FlashcardsView } from './LessonModes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface DocumentViewerProps {
  document: TransformedDocument;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onSaveProfile: () => void;
  onReset: () => void;
}

type ViewMode = 'read' | 'watch' | 'listen' | 'practice' | 'explain' | 'mindmap' | 'flashcards';

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  settings, 
  onSettingsChange, 
  onSaveProfile,
  onReset 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('read');
  const [showSettings, setShowSettings] = useState(false);

  // Derive actual theme based on colorblind setting override
  const activeColorTheme = settings.customizations.isColorBlind ? 'high-contrast' : settings.customizations.colorTheme;
  const isDarkMode = activeColorTheme === 'dark' || activeColorTheme === 'high-contrast';

  const toggleDarkMode = () => {
    const newTheme = settings.customizations.colorTheme === 'dark' ? 'default' : 'dark';
    onSettingsChange({
      ...settings,
      customizations: {
        ...settings.customizations,
        colorTheme: newTheme
      }
    });
  };

  // --- Immersive Reader Component (Local) ---
  const ReaderView = () => {
    // Determine Base Styles based on Settings
    const getStyles = () => {
        const { fontFamily, fontSize, lineSpacing } = settings.customizations;
        let fontClass = 'font-sans';
        if (fontFamily === 'dyslexic') fontClass = 'font-dyslexic';
        if (fontFamily === 'mono') fontClass = 'font-mono';

        let themeClasses = 'bg-white text-slate-900';
        if (activeColorTheme === 'sepia') themeClasses = 'bg-amber-50 text-amber-900';
        if (activeColorTheme === 'dark') themeClasses = 'bg-slate-900 text-slate-100';
        if (activeColorTheme === 'high-contrast') themeClasses = 'bg-black text-yellow-300';

        return `${fontClass} ${fontSize} ${lineSpacing} ${themeClasses}`;
    };

    const getProfileSpecificLayout = () => {
        const profile = settings.baseProfile;
        if (profile === ProfileType.ADHD) return "space-y-8"; 
        if (profile === ProfileType.DYSLEXIA) return "space-y-6 max-w-2xl mx-auto";
        if (profile === ProfileType.AUTISM) return "space-y-4 divide-y divide-slate-200";
        return "space-y-6";
    };

    const blockRenderer = (block: ContentBlock) => {
        const isADHD = settings.baseProfile === ProfileType.ADHD;
        const isDyscalculia = settings.baseProfile === ProfileType.DYSCALCULIA;
        
        // Base styling for blocks
        const baseBlockStyle = isADHD 
            ? "bg-white/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-sm transition-all" 
            : "";
        
        const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';

        if (block.type === 'heading') {
            return (
                <div className={`mt-10 mb-6 ${isADHD ? 'border-b-4 border-brand-200 pb-2 inline-block' : ''} markdown-content`}>
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                    >
                        {block.content}
                    </ReactMarkdown>
                </div>
            );
        }

        if (block.type === 'summary') {
            return (
                <div className={`${isDarkMode ? 'bg-brand-900/30 border-brand-700 text-brand-100' : 'bg-brand-50 border-brand-500 text-brand-900'} border-l-4 p-6 rounded-r-xl shadow-sm my-6`}>
                    <strong className="block uppercase tracking-wide text-xs mb-2 opacity-70">Summary</strong>
                    <div className="text-lg leading-relaxed markdown-content">
                       <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                       >
                            {block.content}
                       </ReactMarkdown>
                    </div>
                </div>
            );
        }

        if (block.type === 'vocabulary') {
            return (
                <div className={`inline-block ${isDarkMode ? 'bg-purple-900/40 text-purple-200 border-purple-700' : 'bg-purple-50 text-purple-900 border-purple-200'} border px-4 py-3 rounded-xl mx-1 my-2 shadow-sm transform hover:scale-[1.02] transition-transform`}>
                     <div className="flex items-start gap-3">
                        {block.visualAid && <span className="text-2xl mt-1">{block.visualAid}</span>}
                        <div className="markdown-content">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm, remarkMath]} 
                                rehypePlugins={[rehypeKatex]}
                            >
                                {block.content}
                            </ReactMarkdown>
                        </div>
                     </div>
                </div>
            );
        }

        if (block.type === 'math') {
            return (
                <div className={`${cardBg} p-6 rounded-xl border my-6 shadow-inner overflow-x-auto`}>
                    <div className="font-mono text-xl tracking-widest mb-4 font-bold text-center markdown-content">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                        >
                            {block.content}
                        </ReactMarkdown>
                    </div>
                    {block.steps && (
                        <div className="space-y-3">
                            {block.steps.map((s, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">{i+1}</span>
                                    <div className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm, remarkMath]} 
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {s}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (block.type === 'checkpoint') {
            return (
                <div className={`${isDarkMode ? 'bg-green-900/30 border-green-700 text-green-100' : 'bg-green-50 border-green-200 text-green-900'} p-4 rounded-xl border flex items-center gap-4 my-6`}>
                    <div className="p-2 bg-green-200 rounded-full text-green-800 flex-shrink-0"><RefreshCw size={20} /></div>
                    <div className="font-medium italic markdown-content">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                        >
                            {block.content}
                        </ReactMarkdown>
                    </div>
                </div>
            );
        }

        // Standard Text Block
        return (
            <div className={`text-lg mb-4 ${baseBlockStyle} markdown-content`}>
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                >
                    {block.content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className={`p-6 md:p-12 min-h-[60vh] rounded-3xl transition-colors duration-300 shadow-sm ${getStyles()}`}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-10 leading-tight border-b pb-6 border-current opacity-90">{document.title}</h1>
            <div className={getProfileSpecificLayout()}>
                {document.blocks.map((block) => (
                    <div key={block.id}>
                        {blockRenderer(block)}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const navItems = [
    { id: 'read', label: 'Read', icon: <BookOpen size={20} /> },
    { id: 'watch', label: 'Watch', icon: <MonitorPlay size={20} /> },
    { id: 'listen', label: 'Listen', icon: <Headphones size={20} /> },
    { id: 'mindmap', label: 'Map', icon: <GitBranch size={20} /> },
    { id: 'flashcards', label: 'Cards', icon: <Layers size={20} /> },
    // Hidden Practice Tab as requested
    // { id: 'practice', label: 'Practice', icon: <PenTool size={20} /> },
    { id: 'explain', label: 'Explain', icon: <MessageCircle size={20} /> },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
        {/* Navigation Header */}
        <header className={`px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-4">
                <button onClick={onReset} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Back to Home">
                    <ArrowLeft size={24} />
                </button>
                <div className="hidden md:block">
                    <h1 className={`font-bold text-lg truncate max-w-xs ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{document.title}</h1>
                    <span className="text-xs font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {settings.name}
                    </span>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className={`flex items-center p-1 rounded-full overflow-x-auto no-scrollbar ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setViewMode(item.id as ViewMode)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap
                            ${viewMode === item.id 
                                ? (isDarkMode ? 'bg-slate-700 text-brand-400 shadow-sm' : 'bg-white text-brand-600 shadow-sm')
                                : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50')}
                        `}
                    >
                        {item.icon}
                        <span className="hidden sm:inline">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    title="Toggle Dark Mode"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                    onClick={() => setShowSettings(!showSettings)} 
                    className={`p-2 rounded-full transition-colors ${showSettings ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-200') : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100')}`}
                >
                    <Settings size={24} className={isDarkMode ? "text-slate-400" : "text-slate-600"} />
                </button>
            </div>
        </header>

        {showSettings && (
            <div className={`border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <SettingsPanel settings={settings} onChange={onSettingsChange} onSave={onSaveProfile} />
            </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
            {viewMode === 'read' && <ReaderView />}
            
            {viewMode === 'watch' && (
                <div className="animate-fade-in">
                    <div className="text-center mb-6">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Visual Breakdown</h2>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Understanding concepts through simplified visuals.</p>
                    </div>
                    <SlidesView slides={document.slides} />
                </div>
            )}

            {viewMode === 'listen' && (
                <div className="animate-fade-in">
                     <div className="text-center mb-8">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Audio Lesson</h2>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>A customized podcast just for you.</p>
                    </div>
                    <AudioView script={document.audioScript} />
                </div>
            )}

            {viewMode === 'mindmap' && (
                <div className="animate-fade-in">
                    <div className="text-center mb-8">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Interactive Map</h2>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Click nodes to expand and learn deeper details.</p>
                    </div>
                    <MindmapView mindmap={document.mindmap || []} />
                </div>
            )}

            {viewMode === 'flashcards' && (
                <div className="animate-fade-in">
                    <div className="text-center mb-8">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Key Terms</h2>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Master the details with memory aids.</p>
                    </div>
                    <FlashcardsView flashcards={document.flashcards || []} />
                </div>
            )}

            {/* Hidden Practice View - code preserved for when tab is restored */}
            {viewMode === 'practice' && (
                <div className="animate-fade-in">
                    <div className="text-center mb-8">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Adaptive Practice</h2>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Activities designed for your brain.</p>
                    </div>
                    <ActivitiesView activities={document.activities} />
                </div>
            )}

            {viewMode === 'explain' && (
                <div className="animate-fade-in">
                    <div className="text-center mb-8">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Talk it Out</h2>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Explain what you learned to your AI tutor.</p>
                    </div>
                    <ConversationView context={document} profile={settings.baseProfile} />
                </div>
            )}
        </main>
    </div>
  );
};