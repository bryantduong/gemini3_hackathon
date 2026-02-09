import React from 'react';
import { UserSettings } from '../types';
import { User, Sparkles } from 'lucide-react';

interface ModeSelectorProps {
  savedProfiles: UserSettings[];
  onSelectSavedProfile: (settings: UserSettings) => void;
  onStartQuiz: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  savedProfiles, 
  onSelectSavedProfile,
  onStartQuiz 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 text-center">
      
      <div className="mb-12">
        {/* Hero Section: Sorting Ceremony */}
        <div className="bg-gradient-to-br from-brand-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-16 relative overflow-hidden group">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10">
                <Sparkles className="w-12 h-12 mb-6 mx-auto text-yellow-300 animate-pulse" />
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Discover Your Learning Faction</h2>
                <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                    We analyze your learning style to adapt the content specifically for you. Take the quick sorting ceremony to get started.
                </p>
                <button 
                    onClick={onStartQuiz}
                    className="bg-white text-brand-700 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-lg transition-all flex items-center gap-3 mx-auto"
                >
                    <Sparkles size={20} />
                    Begin Sorting Ceremony
                </button>
             </div>
        </div>
      </div>

      {savedProfiles.length > 0 ? (
         <div className="mb-12 text-left animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Or Use a Saved Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProfiles.map((profile) => (
                    <button
                        key={profile.id}
                        onClick={() => onSelectSavedProfile(profile)}
                        className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
                             <User size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{profile.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Saved Profile</div>
                        </div>
                    </button>
                ))}
            </div>
         </div>
      ) : (
        <div className="text-slate-400 dark:text-slate-500 text-sm italic">
            Complete the ceremony to create your first profile.
        </div>
      )}
    </div>
  );
};