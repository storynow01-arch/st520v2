import React, { useState } from 'react';
import { Clock, Plus, Minus, Timer } from 'lucide-react';

interface CustomTimerFormProps {
  onApplyCustom: (hours: number, minutes: number, seconds: number, label: string) => void;
  onQuickAddSeconds: (seconds: number) => void;
  status: 'idle' | 'running' | 'paused' | 'completed';
}

export const CustomTimerForm: React.FC<CustomTimerFormProps> = ({
  onApplyCustom,
  onQuickAddSeconds,
  status,
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(25);
  const [seconds, setSeconds] = useState<number>(0);
  const [customLabel, setCustomLabel] = useState<string>('');

  // 限制數值範圍
  const adjustValue = (
    type: 'h' | 'm' | 's',
    delta: number
  ) => {
    if (type === 'h') {
      setHours((prev) => Math.max(0, Math.min(23, prev + delta)));
    } else if (type === 'm') {
      setMinutes((prev) => {
        let next = prev + delta;
        if (next < 0) next = 59;
        if (next > 59) next = 0;
        return next;
      });
    } else if (type === 's') {
      setSeconds((prev) => {
        let next = prev + delta;
        if (next < 0) next = 59;
        if (next > 59) next = 0;
        return next;
      });
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLabel = customLabel.trim() || '自訂計時';
    onApplyCustom(hours, minutes, seconds, finalLabel);
  };

  return (
    <div className="w-full bg-[#0F0F0F] border border-white/5 p-5 rounded-none shadow-none text-white">
      <h3 className="text-white font-black text-xs tracking-[0.25em] uppercase flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <Clock className="w-4 h-4 text-[#FF4D00]" />
        Custom Duration / 自訂計時
      </h3>

      {/* 快捷微調時間（當計時器正在運作、或是暫停時非常實用） */}
      {status !== 'idle' && (
        <div className="mb-5 bg-stone-900/40 p-3 rounded-none border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
            Instant Adjust / 快速增減:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onQuickAddSeconds(30)}
              className="text-xs font-mono font-bold py-1.5 px-2.5 rounded-none bg-stone-950 border border-white/10 hover:border-[#FF4D00] hover:text-[#FF4D00] text-stone-300 transition-all cursor-pointer"
              id="btn-quick-add-30s"
            >
              +30s
            </button>
            <button
              onClick={() => onQuickAddSeconds(60)}
              className="text-xs font-mono font-bold py-1.5 px-2.5 rounded-none bg-stone-950 border border-white/10 hover:border-[#FF4D00] hover:text-[#FF4D00] text-stone-300 transition-all cursor-pointer"
              id="btn-quick-add-1m"
            >
              +1 Min
            </button>
            <button
              onClick={() => onQuickAddSeconds(300)}
              className="text-xs font-mono font-bold py-1.5 px-2.5 rounded-none bg-stone-950 border border-white/10 hover:border-[#FF4D00] hover:text-[#FF4D00] text-stone-300 transition-all cursor-pointer"
              id="btn-quick-add-5m"
            >
              +5 Min
            </button>
            <button
              onClick={() => onQuickAddSeconds(-60)}
              className="text-xs font-mono font-bold py-1.5 px-2.5 rounded-none bg-stone-950 border border-white/10 hover:border-rose-500 hover:text-rose-500 text-stone-300 transition-all cursor-pointer"
              id="btn-quick-sub-1m"
            >
              -1 Min
            </button>
          </div>
        </div>
      )}

      {/* 自訂時間主要輸入表單 */}
      <form onSubmit={handleApply} className="space-y-4">
        {/* 滾輪式/數字增減器 */}
        <div className="flex items-center justify-around gap-2 bg-stone-950 border border-white/5 p-4 rounded-none">
          {/* 時 */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => adjustValue('h', 1)}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-900 rounded-none border border-transparent hover:border-white/5 transition-all cursor-pointer"
              id="btn-adjust-h-up"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-baseline gap-0.5 my-1 select-none">
              <span className="font-mono text-2xl font-black text-white">
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-550 ml-0.5">H</span>
            </div>
            <button
              type="button"
              onClick={() => adjustValue('h', -1)}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-900 rounded-none border border-transparent hover:border-white/5 transition-all cursor-pointer"
              id="btn-adjust-h-down"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-stone-700 font-mono text-xl self-center mb-5">:</span>

          {/* 分 */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => adjustValue('m', 1)}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-900 rounded-none border border-transparent hover:border-white/5 transition-all cursor-pointer"
              id="btn-adjust-m-up"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-baseline gap-0.5 my-1 select-none">
              <span className="font-mono text-2xl font-black text-white">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-550 ml-0.5">M</span>
            </div>
            <button
              type="button"
              onClick={() => adjustValue('m', -1)}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-900 rounded-none border border-transparent hover:border-white/5 transition-all cursor-pointer"
              id="btn-adjust-m-down"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-stone-700 font-mono text-xl self-center mb-5">:</span>

          {/* 秒 */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => adjustValue('s', 1)}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-900 rounded-none border border-transparent hover:border-white/5 transition-all cursor-pointer"
              id="btn-adjust-s-up"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-baseline gap-0.5 my-1 select-none">
              <span className="font-mono text-2xl font-black text-white">
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-550 ml-0.5">S</span>
            </div>
            <button
              type="button"
              onClick={() => adjustValue('s', -1)}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-900 rounded-none border border-transparent hover:border-white/5 transition-all cursor-pointer"
              id="btn-adjust-s-down"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 備註與標籤 */}
        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block mb-1.5">
            Mission Label / 計時備註:
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 程式開發、咖啡靜止、敷眼軟化"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-none border border-white/10 bg-stone-900 focus:outline-none focus:border-[#FF4D00] focus:bg-stone-900/80 text-white placeholder:text-stone-605 transition-all"
              maxLength={20}
              id="input-timer-label"
            />
            {customLabel && (
              <button
                type="button"
                onClick={() => setCustomLabel('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 hover:text-white cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* 確定啟用按鈕 - 硬派朱直角 */}
        <button
          type="submit"
          disabled={hours === 0 && minutes === 0 && seconds === 0}
          className={`w-full py-3.5 px-4 rounded-none font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
            hours === 0 && minutes === 0 && seconds === 0
              ? 'bg-stone-900 text-stone-600 border border-white/5 cursor-not-allowed opacity-40'
              : 'bg-[#FF4D00] text-white hover:bg-[#FF6622] hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(255,75,0,0.25)]'
          }`}
          id="btn-apply-custom-timer"
        >
          <Timer className="w-4 h-4" />
          Load Custom Sequence
        </button>
      </form>
    </div>
  );
};

