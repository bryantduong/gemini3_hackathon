import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { ModeSelector } from './components/ModeSelector';
import { DocumentViewer } from './components/DocumentViewer';
import { ProfileQuiz } from './components/ProfileQuiz';
import { AppMode, ProfileType, TransformedDocument, UserSettings } from './types';
import { transformDocument } from './services/gemini';
import { Loader2, Sparkles, Brain, Github, Info, User, Moon, Sun } from 'lucide-react';

const defaultSettings: UserSettings = {
  id: 'temp',
  name: 'Default',
  baseProfile: ProfileType.DYSLEXIA,
  customizations: {
    fontFamily: 'sans',
    fontSize: 'text-base',
    lineSpacing: 'leading-relaxed',
    colorTheme: 'default',
    ttsSpeed: 1,
    showImages: true,
    isColorBlind: false,
  }
};

// Map internal clinical profiles to Cool Faction Names
export const getFactionName = (profile: ProfileType) => {
    switch(profile) {
        case ProfileType.DYSLEXIA: return "Phoenix Faction"; // Visual, Rebirth, Seeing differently
        case ProfileType.DYSCALCULIA: return "Owl Faction"; // Wisdom, Logic
        case ProfileType.ADHD: return "Falcon Faction"; // Speed, Focus, Agility
        case ProfileType.ELL: return "Griffin Faction"; // Connecting worlds (Bridge)
        case ProfileType.AUTISM: return "Dragon Faction"; // Structure, Power, Detail
        default: return "Chimera Faction"; // Mixed/Custom
    }
};

const AboutPage: React.FC = () => (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">About ReFormat</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
                ReFormat is an intelligent adaptive learning interface designed to bridge the gap between standard educational materials and neurodiverse learning needs.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-500 transition-colors">
                <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    Standard textbooks and worksheets often present barriers for students with Dyslexia, ADHD, or Dyscalculia. 
                    ReFormat uses generative AI to instantly transmute these materials into formats that align with different cognitive profiles—turning text into podcasts, diagrams into stories, and problems into steps.
                </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-500 transition-colors">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                    <Brain size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">How It Works</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    Upload any document or image. Our "Sorting Ceremony" identifies your learning strengths (your Faction). 
                    The engine then rebuilds the content specifically for you—whether you need high-contrast visuals, rhythmic audio, or gamified checkpoints.
                </p>
            </div>
        </div>

        <div className="text-center bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-10">Meet the Team</h2>
            <div className="flex flex-col md:flex-row justify-center gap-8">
                {/* Anoushka Banerjee */}
                <div className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700 hover:border-brand-100 dark:hover:border-brand-500 hover:-translate-y-1 w-full md:w-80">
                    <div className="relative">
                        <div className="w-40 h-40 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-slate-50 dark:border-slate-600 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
                             <User size={80} className="text-slate-400 dark:text-slate-500 mt-4" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Anoushka Banerjee</h3>
                    </div>
                </div>

                {/* Bryant Duong */}
                <a 
                    href="https://bryantduong.github.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700 hover:border-brand-100 dark:hover:border-brand-500 hover:-translate-y-1 w-full md:w-80"
                >
                    <div className="relative">
                        <img 
                            src="https://github.com/bryantduong.png" 
                            alt="Bryant Duong" 
                            className="w-40 h-40 rounded-full object-cover border-4 border-slate-50 dark:border-slate-600 shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-2 right-2 bg-slate-900 dark:bg-slate-950 text-white p-2.5 rounded-full border-4 border-white dark:border-slate-800">
                            <Github size={20} />
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Bryant Duong</h3>
                    </div>
                </a>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  
  // Profile State
  const [activeSettings, setActiveSettings] = useState<UserSettings>(defaultSettings);
  const [savedProfiles, setSavedProfiles] = useState<UserSettings[]>([]);
  
  // Data State
  const [documentData, setDocumentData] = useState<TransformedDocument | null>(null);
  
  // Loading State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProfile, setProcessingProfile] = useState<ProfileType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive theme
  const activeColorTheme = activeSettings.customizations.isColorBlind ? 'high-contrast' : activeSettings.customizations.colorTheme;
  const isDarkMode = activeColorTheme === 'dark' || activeColorTheme === 'high-contrast';

  // Load profiles on mount
  useEffect(() => {
    const saved = localStorage.getItem('reformat_profiles');
    if (saved) {
      try {
        setSavedProfiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
    }
  }, []);

  const handleImageSelected = (base64: string, mimeType: string) => {
    setSelectedImage({data: base64, mimeType});
    
    // If user has saved profiles, let them choose. Otherwise, auto-start quiz.
    if (savedProfiles.length > 0) {
        setMode(AppMode.SELECT_PROFILE);
    } else {
        setMode(AppMode.QUIZ);
    }
    setError(null);
  };

  const processDocument = async (profile: ProfileType, settings: UserSettings) => {
    if (!selectedImage) return;
    
    setProcessingProfile(profile); // Set this immediately for the UI
    setIsProcessing(true);
    setError(null);

    try {
      // Use the base profile from the settings for the LLM transformation
      const result = await transformDocument(selectedImage.data, selectedImage.mimeType, profile);
      setDocumentData(result);
      setActiveSettings(settings);
      setMode(AppMode.VIEW_CONTENT);
    } catch (err) {
      console.error(err);
      setError("Failed to process the document. Please ensure the API Key is valid and try again.");
      setMode(AppMode.SELECT_PROFILE); 
    } finally {
      setIsProcessing(false);
      setProcessingProfile(null);
    }
  };

  const handleStandardProfileSelect = (profile: ProfileType) => {
    // Define distinct defaults based on the profile to make them look different immediately
    let customDefaults = { ...defaultSettings.customizations };

    switch (profile) {
      case ProfileType.DYSLEXIA:
        customDefaults = { ...customDefaults, fontFamily: 'dyslexic', lineSpacing: 'leading-loose', colorTheme: 'sepia' };
        break;
      case ProfileType.DYSCALCULIA:
        customDefaults = { ...customDefaults, fontFamily: 'mono', colorTheme: 'default' };
        break;
      case ProfileType.ADHD:
        customDefaults = { ...customDefaults, fontFamily: 'sans', lineSpacing: 'leading-normal', colorTheme: 'default' };
        break;
      case ProfileType.AUTISM:
        customDefaults = { ...customDefaults, fontFamily: 'sans', colorTheme: 'default' };
        break;
      case ProfileType.ELL:
        customDefaults = { ...customDefaults, fontFamily: 'sans', lineSpacing: 'leading-relaxed' };
        break;
    }

    const newSettings: UserSettings = {
        ...defaultSettings,
        id: `temp_${Date.now()}`,
        name: getFactionName(profile),
        baseProfile: profile,
        customizations: customDefaults
    };
    processDocument(profile, newSettings);
  };

  const handleSavedProfileSelect = (settings: UserSettings) => {
    processDocument(settings.baseProfile, settings);
  };

  const handleQuizComplete = (recommended: ProfileType, isColorBlind: boolean) => {
    const newSettings: UserSettings = {
        ...defaultSettings,
        id: `quiz_${Date.now()}`,
        name: getFactionName(recommended),
        baseProfile: recommended,
        customizations: {
            ...defaultSettings.customizations,
            fontFamily: recommended === ProfileType.DYSLEXIA ? 'dyslexic' : 'sans',
            fontSize: 'text-lg',
            // Auto-enable high contrast for colorblindness if detected
            colorTheme: isColorBlind ? 'high-contrast' : defaultSettings.customizations.colorTheme,
            isColorBlind: isColorBlind
        }
    };
    processDocument(recommended, newSettings);
  };

  const handleSaveProfile = () => {
    const name = prompt("Name your Faction Profile:", activeSettings.name);
    if (name) {
        const newProfile = { ...activeSettings, id: Date.now().toString(), name };
        const updated = [...savedProfiles, newProfile];
        setSavedProfiles(updated);
        localStorage.setItem('reformat_profiles', JSON.stringify(updated));
        alert("Faction Profile saved!");
    }
  };

  const handleReset = () => {
    setMode(AppMode.UPLOAD);
    setSelectedImage(null);
    setDocumentData(null);
    setError(null);
  };

  const toggleDarkMode = () => {
    const newTheme = activeSettings.customizations.colorTheme === 'dark' ? 'default' : 'dark';
    setActiveSettings({
      ...activeSettings,
      customizations: {
        ...activeSettings.customizations,
        colorTheme: newTheme
      }
    });
  };

  if (isProcessing) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md w-full text-center space-y-6 animate-pulse">
            <div className="relative w-32 h-32 mx-auto">
                 <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    ✨
                 </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Summoning Knowledge...</h2>
            <p className="text-slate-500 dark:text-slate-400">
                Your materials are being adapted for the <br/>
                <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider text-xl">{processingProfile ? getFactionName(processingProfile) : 'You'}</span>.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full`}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {/* Global Navbar */}
          {mode !== AppMode.VIEW_CONTENT && (
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode(AppMode.UPLOAD)}>
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
                <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">ReFormat</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                  title="Toggle Dark Mode"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {mode === AppMode.UPLOAD && (
                    <button 
                        onClick={() => setMode(AppMode.ABOUT)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                        <Info size={18} />
                        About
                    </button>
                )}
                {mode === AppMode.ABOUT && (
                    <button 
                        onClick={() => setMode(AppMode.UPLOAD)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                        Back to App
                    </button>
                )}
                {(mode === AppMode.SELECT_PROFILE || mode === AppMode.QUIZ) && (
                    <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                    Cancel
                    </button>
                )}
              </div>
            </nav>
          )}

          {error && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between">
               <span>{error}</span>
               <button onClick={() => setError(null)} className="font-bold">&times;</button>
            </div>
          )}

          <main className="animate-fade-in w-full h-full">
            {mode === AppMode.ABOUT && <AboutPage />}

            {mode === AppMode.UPLOAD && (
                <div className="flex flex-col items-center justify-evenly min-h-[calc(100vh-80px)] pb-10">
                    <div className="text-center max-w-2xl px-6">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
                            Learning Materials, <span className="text-brand-500 dark:text-brand-400">Transformed.</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Upload any worksheet, PDF, or photo. 
                            We'll adapt it to your unique Faction's learning style.
                        </p>
                    </div>
                    <UploadZone onImageSelected={handleImageSelected} />
                </div>
            )}

            {mode === AppMode.SELECT_PROFILE && (
              <div className="py-12">
                <ModeSelector 
                    savedProfiles={savedProfiles}
                    onSelectSavedProfile={handleSavedProfileSelect}
                    onStartQuiz={() => setMode(AppMode.QUIZ)}
                />
              </div>
            )}

            {mode === AppMode.QUIZ && (
                <div className="py-12">
                    <ProfileQuiz 
                        onComplete={handleQuizComplete}
                        onCancel={() => setMode(AppMode.SELECT_PROFILE)}
                    />
                </div>
            )}

            {mode === AppMode.VIEW_CONTENT && documentData && (
              <DocumentViewer 
                document={documentData} 
                settings={activeSettings}
                onSettingsChange={setActiveSettings}
                onSaveProfile={handleSaveProfile}
                onReset={handleReset} 
              />
            )}
          </main>
        </div>
    </div>
  );
};

export default App;