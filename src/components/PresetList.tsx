import React from 'react';
import * as Icons from 'lucide-react';
import { TIMER_PRESETS } from '../data/presets';
import { TimerPreset } from '../types';

interface PresetListProps {
  activeId: string | null;
  onSelectPreset: (preset: TimerPreset) => void;
  status: 'idle' | 'running' | 'paused' | 'completed';
}

// 動態 Icon 渲染器
const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    return <Icons.Timer className={className} />;
  }
  return <IconComponent className={className} />;
};

export const PresetList: React.FC<PresetListProps> = ({
  activeId,
  onSelectPreset,
  status,
}) => {
  // 將總秒數格式化成易讀的文字，例如 "25 分鐘" 或 "20 秒"
  const formatSeconds = (totalSecs: number) => {
    if (totalSecs >= 3600) {
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      return mins > 0 ? `${hrs} 小時 ${mins} 分` : `${hrs} 小時`;
    }
    if (totalSecs >= 60) {
      return `${Math.floor(totalSecs / 60)} 分`;
    }
    return `${totalSecs} 秒`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <h3 className="text-white font-black text-xs tracking-[0.25em] uppercase flex items-center gap-2">
          <Icons.Zap className="w-4 h-4 text-[#FF4D00] animate-pulse" />
          Mission Presets / 專念預設
        </h3>
        {status === 'running' && (
          <span className="text-[9px] uppercase tracking-wider text-stone-500 font-mono">
            ENGAGED / Tap to reset
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {TIMER_PRESETS.map((preset) => {
          const isActive = activeId === preset.id;
          
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              id={`preset-${preset.id}`}
              className={`p-4 rounded-none text-left border transition-all duration-300 group flex items-start gap-4 ${
                isActive
                  ? 'border-[#FF4D00] bg-stone-900/80 shadow-[0_0_20px_rgba(255,75,0,0.15)]'
                  : 'border-white/5 bg-stone-950 hover:border-white/20 hover:bg-stone-900/60'
              }`}
            >
              {/* 圖標與底色 - 高對比純黑/紅色底 */}
              <div
                className={`flex-shrink-0 p-3 rounded-none bg-stone-900 border text-white transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF4D00] ${
                  isActive 
                    ? 'border-[#FF4D00] text-[#FF4D00] bg-stone-905' 
                    : 'border-white/10 text-stone-400 group-hover:text-white'
                }`}
              >
                <IconRenderer name={preset.icon} className="w-5 h-5" />
              </div>

              {/* 內容文字 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-bold text-sm tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-white font-black' : 'text-stone-300 group-hover:text-white'
                  }`}>
                    {preset.label}
                  </span>
                  <span className={`font-mono text-[10px] font-bold border px-1.5 py-0.5 rounded-none ${
                    isActive
                      ? 'bg-[#FF4D00]/10 text-[#FF4D00] border-[#FF4D00]/20'
                      : 'bg-stone-900 text-stone-400 border-white/5'
                  }`}>
                    {formatSeconds(preset.duration)}
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-normal leading-relaxed line-clamp-2 select-none">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

