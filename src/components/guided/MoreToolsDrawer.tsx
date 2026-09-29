import React, { useState } from 'react';
import { FarmContext, Language, SavedAdvisoryRecord } from '../../types';
import { FarmProfileForm } from '../FarmProfileForm';
import { LiveVoiceSection } from '../LiveVoiceSection';
import { SearchGroundingSection } from '../SearchGroundingSection';
import { MapsGroundingSection } from '../MapsGroundingSection';
import { RegenerativeSection } from '../RegenerativeSection';
import { MultiStateDashboard } from '../MultiStateDashboard';
import { SavedAdvisoriesSection } from '../SavedAdvisoriesSection';
import { AIAdvisorySection } from '../AIAdvisorySection';
import {
  X,
  Sliders,
  Radio,
  TrendingUp,
  MapPin,
  RefreshCw,
  Network,
  BookmarkCheck,
  Sparkles,
  Sprout,
} from 'lucide-react';

interface MoreToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  context: FarmContext;
  onContextChange: (ctx: FarmContext) => void;
  onLoadPreset: (
    state: string,
    district: string,
    crop: string,
    stage: string,
    soilType: string,
    ph: number,
    n: 'Low' | 'Medium' | 'High',
    p: 'Low' | 'Medium' | 'High',
    k: 'Low' | 'Medium' | 'High'
  ) => void;
  savedRecords: SavedAdvisoryRecord[];
  onRemoveRecord: (id: string) => void;
  onClearRecords: () => void;
}

export const MoreToolsDrawer: React.FC<MoreToolsDrawerProps> = ({
  isOpen,
  onClose,
  language,
  context,
  onContextChange,
  onLoadPreset,
  savedRecords,
  onRemoveRecord,
  onClearRecords,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'voice' | 'mandi' | 'kvk' | 'regen' | 'network' | 'saved' | 'advisory'
  >('profile');

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Farm & Soil Profile', icon: Sliders },
    { id: 'advisory', label: 'Comprehensive Advisory', icon: Sprout },
    { id: 'voice', label: 'Live Voice (3.8 Live)', icon: Radio },
    { id: 'mandi', label: 'Mandi Rates (Search)', icon: TrendingUp },
    { id: 'kvk', label: 'Nearby KVK (Maps)', icon: MapPin },
    { id: 'regen', label: 'Regenerative Farming', icon: RefreshCw },
    { id: 'network', label: 'Multi-State Network', icon: Network },
    { id: 'saved', label: `Saved Records (${savedRecords.length})`, icon: BookmarkCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content */}
      <div className="relative w-full max-w-4xl bg-stone-50 h-full overflow-y-auto shadow-2xl flex flex-col z-10 border-l border-stone-200">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 leading-tight">
                AgriSetu AI • Expert Tools
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Advanced farm telemetry, market prices, research & voice agent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-stone-200 px-6 py-2.5 overflow-x-auto flex items-center gap-2 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 font-bold">
                💡 Note: Adjust your farm size, soil pH, and N-P-K nutrient status here. These parameters automatically feed into the guided problem solver and farm advisories.
              </div>
              <FarmProfileForm
                context={context}
                onChange={onContextChange}
                onLoadPreset={onLoadPreset}
              />
            </div>
          )}

          {activeTab === 'advisory' && (
            <div className="space-y-4">
              <AIAdvisorySection
                context={context}
                language={language}
                onSaveAdvisory={(rec) => console.log('Saved record', rec)}
              />
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <LiveVoiceSection context={context} language={language} />
            </div>
          )}

          {activeTab === 'mandi' && (
            <div className="space-y-4">
              <SearchGroundingSection context={context} language={language} />
            </div>
          )}

          {activeTab === 'kvk' && (
            <div className="space-y-4">
              <MapsGroundingSection context={context} language={language} />
            </div>
          )}

          {activeTab === 'regen' && (
            <div className="space-y-4">
              <RegenerativeSection context={context} language={language} />
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
              <MultiStateDashboard language={language} />
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-4">
              <SavedAdvisoriesSection
                savedRecords={savedRecords}
                onSelectRecord={() => {}}
                onRemoveRecord={onRemoveRecord}
                onClearRecords={onClearRecords}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
