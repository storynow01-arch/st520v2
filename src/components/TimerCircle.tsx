import React, { useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Sparkles, Activity } from 'lucide-react';
import { TimerStatus } from '../types';

interface TimerCircleProps {
  status: TimerStatus;
  totalSeconds: number;
  remainingSeconds: number;
  label: string;
  isMuted: boolean;
  volume: number;
  onPlayPause: () => void;
  onReset: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  status,
  totalSeconds,
  remainingSeconds,
  label,
  isMuted,
  volume,
  onPlayPause,
  onReset,
  onToggleMute,
  onVolumeChange,
}) => {
  // 格式化時間
  const formattedTime = useMemo(() => {
    const hrs = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }, [remainingSeconds]);

  // 計算 SVG 圓形邊界
  const radius = 135;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  // 計算剩餘進度百分比 (0 ~ 1)
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  const strokeDashoffset = circumference * (1 - progress);

  // 判斷是否在最後10秒 (低於 10 秒且正在運行)，會產生呼吸急促的紅色光暈與微光
  const isUrgent = remainingSeconds <= 10 && remainingSeconds > 0 && status === 'running';

  // 根據進度返回不同的色彩（從初始的藍綠，到中期的橙橘，再到最後的微光紅）
  const progressGradient = useMemo(() => {
    if (progress > 0.6) return 'url(#timer-grad-primary)';
    if (progress > 0.2) return 'url(#timer-grad-warning)';
    return 'url(#timer-grad-danger)';
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center relative select-none w-full">
      {/* 禪意呼吸光暈外環 */}
      <div
        className={`relative flex items-center justify-center rounded-3xl p-6 transition-all duration-1000 w-full ${
          status === 'running'
            ? isUrgent
              ? 'bg-rose-950/20 shadow-[0_0_50px_rgba(255,77,0,0.3)] border border-[#FF4D00]/20'
              : 'bg-stone-900/30 shadow-[0_0_40px_rgba(255,255,255,0.02)] border border-white/5 animate-[pulse_6s_infinite_ease-in-out]'
            : 'bg-transparent shadow-none border border-transparent'
        }`}
      >
        {/* SVG 進度環 */}
        <div className="relative w-76 h-76 md:w-80 md:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-md overflow-visible">
            <defs>
              {/* 各種漸層定義 */}
              <linearGradient id="timer-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FF4D00" />
              </linearGradient>
              <linearGradient id="timer-grad-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4D00" />
                <stop offset="100%" stopColor="#FF9900" />
              </linearGradient>
              <linearGradient id="timer-grad-danger" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1E00" />
                <stop offset="100%" stopColor="#7F0E00" />
              </linearGradient>
            </defs>

            {/* 底軌圓環 */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="transparent"
              stroke="#1C1C1E" /* Slate grey base */
              strokeWidth={strokeWidth}
              className="transition-colors duration-300"
            />

            {/* 動態進度圓環 */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="transparent"
              stroke={progressGradient}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-linear"
              style={{
                strokeDashoffset: strokeDashoffset,
                filter: isUrgent ? 'drop-shadow(0 0 10px rgba(255,77,0,0.8))' : 'drop-shadow(0 0 4px rgba(255,77,0,0.1))',
              }}
            />
          </svg>

          {/* 圓環內部文字資訊（絕對定位居中） */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {/* 上方標籤 */}
            <span className="text-[#FF4D00] font-black tracking-[0.25em] text-xs uppercase mb-2 italic">
              {label || '自由專注'}
            </span>

            {/* 時間主體 (等寬數字字型，防止字元抖動) */}
            <span
              className={`font-sans font-black tracking-tighter select-all leading-[0.95] transition-all duration-300 ${
                formattedTime.length > 5
                  ? 'text-5xl md:text-6xl text-white'
                  : 'text-6xl md:text-7xl lg:text-8xl text-white'
              } ${isUrgent ? 'text-[#FF4D00] scale-105 filter drop-shadow-[0_0_12px_rgba(255,77,0,0.5)]' : ''}`}
            >
              {formattedTime}
            </span>

            {/* 狀態微小指示 */}
            <div className="mt-3 flex items-center gap-1.5 h-6">
              {status === 'running' && (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#FF4D00] bg-[#FF4D00]/10 px-3 py-1 rounded-sm border border-[#FF4D00]/20 animate-pulse">
                  <Activity className="w-3 h-3 text-[#FF4D00]" />
                  SEQ_RUNNING
                </span>
              )}
              {status === 'paused' && (
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 bg-stone-800/80 px-3 py-1 rounded-sm border border-stone-700">
                  SEQ_HOLD
                </span>
              )}
              {status === 'completed' && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-white bg-green-600 px-3 py-1 rounded-sm border border-green-500 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" />
                  SUCCESS
                </span>
              )}
              {status === 'idle' && (
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 bg-stone-900 border border-stone-800 px-3 py-1 rounded-sm">
                  STANDBY
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 核心控制面板：極硬朗軍工直角科技風按鈕 */}
      <div className="flex items-stretch justify-center gap-4 mt-8 w-full max-w-sm relative z-10">
        {/* 重置按鈕 */}
        <button
          onClick={onReset}
          disabled={status === 'idle'}
          className={`px-5 py-4 border font-bold uppercase tracking-widest text-xs transition-all duration-200 flex items-center justify-center ${
            status === 'idle'
              ? 'text-stone-750 border-stone-900 bg-stone-950/20 cursor-not-allowed opacity-30'
              : 'text-stone-300 border-white/10 bg-stone-950 hover:bg-stone-900 active:scale-95 hover:border-white/30 hover:text-white'
          }`}
          title="重新開始"
          id="btn-timer-reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* 播放/暫停主控制按鈕 - 大膽直角高對比 */}
        <button
          onClick={onPlayPause}
          className={`flex-grow px-8 py-4 font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 transform active:scale-95 select-none text-center flex items-center justify-center gap-2 ${
            status === 'running'
              ? 'bg-white text-black hover:bg-stone-250 shadow-lg'
              : 'bg-[#FF4D00] text-white hover:bg-[#FF6622] shadow-[0_4px_20px_rgba(255,77,0,0.3)]'
          }`}
          id="btn-timer-play-pause"
        >
          {status === 'running' ? (
            <>
              <Pause className="w-4 h-4 fill-current text-current" />
              Hold Sequence
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-current ml-0.5" />
              Engage Window
            </>
          )}
        </button>

        {/* 靜音/音效快切按鈕 */}
        <button
          onClick={onToggleMute}
          className={`px-5 py-4 border font-bold uppercase tracking-widest text-xs transition-all duration-250 flex items-center justify-center ${
            isMuted 
              ? 'text-[#FF4D00] border-[#FF4D00]/30 bg-[#FF4D00]/5' 
              : 'text-stone-300 border-white/10 bg-stone-950 hover:bg-stone-900 hover:text-white hover:border-white/30'
          }`}
          title={isMuted ? '解除靜音' : '靜音'}
          id="btn-timer-mute"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 隱藏式精細音量控制軌 */}
      {!isMuted && (
        <div className="flex items-center gap-3 mt-4 text-stone-500 bg-stone-900/60 border border-stone-850 px-4 py-1.5 rounded-none transition-colors duration-200">
          <Volume2 className="w-3.5 h-3.5 text-[#FF4D00]" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#FF4D00]"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

