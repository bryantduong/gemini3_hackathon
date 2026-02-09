import React from 'react';
import { UserSettings } from '../types';
import { Type, ALargeSmall, Palette, Sliders, Eye } from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  onChange: (newSettings: UserSettings) => void;
  onSave: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onSave }) => {
  const update = (key: keyof UserSettings['customizations'], value: any) => {
    onChange({
      ...settings,
      customizations: {
        ...settings.customizations,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 p-6 animate-slide-down">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Font Family */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
            <Type size={16} /> Font Style
          </div>
          <select 
            value={settings.customizations.fontFamily}
            onChange={(e) => update('fontFamily', e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="sans">Clean (Inter)</option>
            <option value="dyslexic">Dyslexia Friendly (Comic)</option>
            <option value="mono">Monospace (Code)</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
            <ALargeSmall size={16} /> Text Size
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
             {['text-base', 'text-lg', 'text-xl', 'text-2xl'].map((size) => (
               <button
                 key={size}
                 onClick={() => update('fontSize', size)}
                 className={`flex-1 py-1 rounded-md text-sm font-bold transition-colors ${
                   settings.customizations.fontSize === size 
                   ? 'bg-white text-brand-600 shadow-sm' 
                   : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 A
               </button>
             ))}
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
            <Palette size={16} /> Color Theme
          </div>
          <div className="flex gap-2">
            {[
              { id: 'default', bg: 'bg-white', border: 'border-slate-200' },
              { id: 'sepia', bg: 'bg-amber-50', border: 'border-amber-200' },
              { id: 'dark', bg: 'bg-slate-900', border: 'border-slate-700' },
              { id: 'high-contrast', bg: 'bg-black', border: 'border-white' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => update('colorTheme', theme.id)}
                className={`w-8 h-8 rounded-full border-2 ${theme.bg} ${theme.border} ${
                  settings.customizations.colorTheme === theme.id ? 'ring-2 ring-brand-500 ring-offset-2' : ''
                }`}
                title={theme.id}
              />
            ))}
          </div>
        </div>

        {/* Colorblind Toggle */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                <Eye size={16} /> Accessibility
            </div>
            <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">Colorblind Mode</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.customizations.isColorBlind ? 'bg-brand-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.customizations.isColorBlind ? 'translate-x-5' : ''}`}></div>
                </div>
                <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={settings.customizations.isColorBlind} 
                    onChange={(e) => update('isColorBlind', e.target.checked)}
                />
            </label>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end max-w-4xl mx-auto">
        <button 
          onClick={onSave}
          className="px-6 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          Save as Profile
        </button>
      </div>
    </div>
  );
};