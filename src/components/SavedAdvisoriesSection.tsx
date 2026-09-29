import React from 'react';
import { SavedAdvisoryRecord } from '../types';
import { Bookmark, Clock, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

interface SavedAdvisoriesSectionProps {
  savedRecords: SavedAdvisoryRecord[];
  onSelectRecord: (record: SavedAdvisoryRecord) => void;
  onClearRecords: () => void;
  onRemoveRecord: (id: string) => void;
}

export const SavedAdvisoriesSection: React.FC<SavedAdvisoriesSectionProps> = ({
  savedRecords,
  onSelectRecord,
  onClearRecords,
  onRemoveRecord,
}) => {
  if (savedRecords.length === 0) return null;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
            Saved Farm Advisories ({savedRecords.length})
          </h3>
        </div>
        <button
          onClick={onClearRecords}
          className="text-xs text-stone-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {savedRecords.map((rec) => (
          <div
            key={rec.id}
            className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                  🌾 {rec.crop} ({rec.district})
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rec.status === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                  rec.status === 'Attention Needed' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rec.status}
                </span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {rec.summary}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {rec.timestamp}
              </span>
              <button
                onClick={() => onRemoveRecord(rec.id)}
                className="hover:text-rose-600 p-1 cursor-pointer"
                title="Delete this record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
