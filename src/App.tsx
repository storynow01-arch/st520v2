import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerCircle } from './components/TimerCircle';
import { PresetList } from './components/PresetList';
import { CustomTimerForm } from './components/CustomTimerForm';
import { TimerHistory } from './components/TimerHistory';
import { TimerStatus, TimerPreset, CompactHistory } from './types';
import { audioSynth } from './utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, AlertCircle, RefreshCw, Award } from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'zen_timer_history_list';
const LOCAL_STORAGE_MUTE_KEY = 'zen_timer_is_muted';
const LOCAL_STORAGE_VOL_KEY = 'zen_timer_volume_level';

// 動態彩色紙屑粒子的類型
interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  spin: number;
}

export default function App() {
  // 核心計時狀態
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [totalSeconds, setTotalSeconds] = useState<number>(1500); // 預設 25 分
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1500);
  const [timerLabel, setTimerLabel] = useState<string>('番茄鐘專注');
  const [activePresetId, setActivePresetId] = useState<string | null>('pomodoro');

  // 音訊與音量
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_MUTE_KEY);
    return saved ? saved === 'true' : false;
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_VOL_KEY);
    return saved ? parseFloat(saved) : 0.5;
  });

  // 歷史與統計
  const [history, setHistory] = useState<CompactHistory[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // 連續番茄鐘 (Pomodoro Loop) 的切換
  const [isLoopMode, setIsLoopMode] = useState<boolean>(false);
  // 連續番茄鐘狀態：'work' | 'break'
  const [loopState, setLoopState] = useState<'work' | 'break'>('work');

  // 煙火粒子狀態
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // 顯示完成的客製 Notification/Toast 狀態
  const [showCompleteToast, setShowCompleteToast] = useState<boolean>(false);

  // 定時器參考與時間戳參考 (用來精準校正，預防 tab 背景節流造成計時緩慢)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // 初始化音量設定
  useEffect(() => {
    audioSynth.setVolume(isMuted ? 0 : volume);
  }, [isMuted, volume]);

  // 紙屑粒子生命週期 (定時清理)
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  // 清除計時定時器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 完成時触发：寫入歷史紀錄 + 播放 Web Audio 慶祝和弦 + 粒子爆發
  const handleTimerComplete = useCallback((completedLabel: string, completedDuration: number) => {
    clearTimer();
    setStatus('completed');
    setRemainingSeconds(0);

    // 播放和弦 Chime
    audioSynth.playChime();

    // 彈出 Toast
    setShowCompleteToast(true);

    // 粒子生成 (50顆)
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    const newParticles: Particle[] = Array.from({ length: 60 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      x: 30 + Math.random() * 40, // 隨機水平居中
      y: 10 + Math.random() * 30, // 隨機偏上部
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8, // 毫米
      angle: Math.random() * 360,
      speed: 2 + Math.random() * 5,
      spin: -180 + Math.random() * 360,
    }));
    setParticles(newParticles);

    // 保存在歷史紀錄中 (LocalStorage)
    const newHistoryItem: CompactHistory = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      label: completedLabel,
      duration: completedDuration,
      completedAt: new Date().toISOString(),
    };

    setHistory((prev) => {
      const next = [newHistoryItem, ...prev].slice(0, 100); // 限制最多儲存 100 筆
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(next));
      return next;
    });

    // 處理「連續番茄鐘」循環模式
    if (isLoopMode) {
      setTimeout(() => {
        audioSynth.playClick();
        if (loopState === 'work') {
          // 工作完，自發切到 5 分鐘短休
          setLoopState('break');
          setTotalSeconds(300);
          setRemainingSeconds(300);
          setTimerLabel('連續短期休息 ☕');
          setActivePresetId('short-break');
          setStatus('running');
          endTimeRef.current = Date.now() + 300 * 1000;
          startPreciseTicker(300, '連續短期休息 ☕');
        } else {
          // 休息完，切到 25 分鐘工作
          setLoopState('work');
          setTotalSeconds(1500);
          setRemainingSeconds(1500);
          setTimerLabel('連續番茄專注 🎯');
          setActivePresetId('pomodoro');
          setStatus('running');
          endTimeRef.current = Date.now() + 1500 * 1000;
          startPreciseTicker(1500, '連續番茄專注 🎯');
        }
      }, 5000); // 下一輪定於 5 秒後優雅地自動啟程
    }
  }, [isLoopMode, loopState, clearTimer]);

  // 精確倒數定時器 (基於時間戳抵銷)
  const startPreciseTicker = useCallback((initialSeconds: number, currentLabel: string) => {
    clearTimer();
    
    // 計算準確的下線時間
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + initialSeconds * 1000;
    }

    timerRef.current = setInterval(() => {
      if (!endTimeRef.current) return;

      const deltaMs = endTimeRef.current - Date.now();
      const nextRemaining = Math.max(0, Math.ceil(deltaMs / 1000));

      setRemainingSeconds(nextRemaining);

      // 當倒數最後 5 秒，每秒播放一聲警示 Warning 音效 (3, 2, 1) 或者一般時鐘 tick
      if (nextRemaining > 0 && nextRemaining <= 3 && !isMuted) {
        audioSynth.playWarning(nextRemaining);
      } else if (nextRemaining > 0 && !isMuted && nextRemaining < initialSeconds) {
        // 設定在運行中是否靜靜滴答（我們在剩下 10 秒內都提供滴答）
        if (nextRemaining <= 10) {
          audioSynth.playTick();
        }
      }

      // 到期觸發
      if (deltaMs <= 0 || nextRemaining <= 0) {
        handleTimerComplete(currentLabel, initialSeconds);
      }
    }, 200); // 每 200ms 高頻檢查，保證哪怕切換 app 也能在重返時秒數完全吻合，完全消除傳統 1000ms 產生的誤差！
  }, [clearTimer, handleTimerComplete, isMuted]);

  // 點選 開始 / 暫停
  const handlePlayPause = () => {
    // 瀏覽器解鎖音調
    audioSynth.unlock();
    audioSynth.playClick();

    if (status === 'running') {
      // 暫停
      clearTimer();
      setStatus('paused');
      // 清空過期參考，供下次繼續累加
      endTimeRef.current = null;
    } else {
      // 開始 & 繼續
      setStatus('running');
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
      startPreciseTicker(totalSeconds, timerLabel);
    }
  };

  // 重置
  const handleReset = () => {
    audioSynth.playClick();
    clearTimer();
    setStatus('idle');
    setRemainingSeconds(totalSeconds);
    endTimeRef.current = null;
    setShowCompleteToast(false);
  };

  // 靜音開關
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem(LOCAL_STORAGE_MUTE_KEY, String(nextMuted));
    audioSynth.setVolume(nextMuted ? 0 : volume);
    // 開啟音量時順便解鎖
    if (!nextMuted) {
      audioSynth.unlock();
      audioSynth.playClick();
    }
  };

  // 音量變更
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    localStorage.setItem(LOCAL_STORAGE_VOL_KEY, String(vol));
    audioSynth.setVolume(vol);
  };

  // 套用常用預設 (Presets)
  const handleSelectPreset = (preset: TimerPreset) => {
    audioSynth.unlock();
    audioSynth.playClick();

    // 加載預設
    clearTimer();
    setStatus('idle');
    setTotalSeconds(preset.duration);
    setRemainingSeconds(preset.duration);
    setTimerLabel(preset.label);
    setActivePresetId(preset.id);
    endTimeRef.current = null;
    setShowCompleteToast(false);
  };

  // 套用自訂時間
  const handleApplyCustom = (hours: number, minutes: number, seconds: number, label: string) => {
    audioSynth.unlock();
    audioSynth.playClick();

    const calculatedSecs = hours * 3600 + minutes * 60 + seconds;
    if (calculatedSecs <= 0) return;

    clearTimer();
    setStatus('idle');
    setTotalSeconds(calculatedSecs);
    setRemainingSeconds(calculatedSecs);
    setTimerLabel(label);
    setActivePresetId(null);
    endTimeRef.current = null;
    setShowCompleteToast(false);
  };

  // 在運行中「快速追加」或「減少」秒數 (貼心體驗)
  const handleQuickAddSeconds = (secs: number) => {
    audioSynth.playClick();

    let newRemaining = remainingSeconds + secs;
    
    // 如果追加入秒太短，扣到 0 以下直接算完成
    if (newRemaining <= 0) {
      handleTimerComplete(timerLabel, totalSeconds);
      return;
    }

    // 限制最高不可大於 23小時 59分 59秒
    const maxSeconds = 23 * 3600 + 59 * 60 + 59;
    if (newRemaining > maxSeconds) {
      newRemaining = maxSeconds;
    }

    // 更新賸餘秒數
    setRemainingSeconds(newRemaining);
    // 我們同步擴張/減少總秒數
    const newTotal = Math.max(newRemaining, totalSeconds + (secs > 0 ? secs : 0));
    setTotalSeconds(newTotal);

    // 如果定時器正在運行，需要即時重設 expiration
    if (status === 'running') {
      endTimeRef.current = Date.now() + newRemaining * 1000;
      startPreciseTicker(newTotal, timerLabel);
    }
  };

  // 刪除單個歷史
  const handleDeleteHistoryItem = (id: string) => {
    audioSynth.playClick();
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  // 清空歷史
  const handleClearHistory = () => {
    audioSynth.playClick();
    if (window.confirm('確定要清除所有專注歷史紀錄嗎？')) {
      setHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col justify-between py-8 px-4 md:py-12 relative overflow-hidden">
      
      {/* 飄灑彩色高張力紙屑 (與 Bold Typography 霓虹朱紅、極致白共鳴) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
              }}
              initial={{ opacity: 1, scale: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [1, 1.4, 0.4],
                x: [0, Math.sin(p.angle) * p.speed * 25, Math.sin(p.angle) * p.speed * 45],
                y: [0, Math.cos(p.angle) * p.speed * 20 + 160, Math.cos(p.angle) * p.speed * 40 + 380],
                rotate: [0, p.spin],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 頂部導航與標題列 - 純粹科幻儀表板風格 */}
      <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#FF4D00] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,77,0,0.4)]">
            <Compass className="w-5.5 h-5.5 animate-spin" style={{ animationDuration: '15s' }} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-[0.15em] text-white uppercase flex items-center gap-2">
              Chronos Matrix
              <span className="text-[9px] bg-[#FF4D00]/15 text-[#FF4D00] border border-[#FF4D00]/25 font-black px-2 py-0.5 rounded-none uppercase tracking-widest scale-90">
                Zen v2.0
              </span>
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-stone-500 uppercase mt-0.5">Focus matrix sequence / 專念時間矩陣</p>
          </div>
        </div>

        {/* 循環番茄開關 - 直角幾何 */}
        <div className="flex items-center gap-4 bg-[#0F0F0F] border border-white/5 px-4 py-2.5 rounded-none">
          <div className="flex items-center gap-2.5">
            <div className={`relative w-8 h-4 rounded-none transition-colors cursor-pointer border border-white/10 ${
              isLoopMode ? 'bg-[#FF4D00]' : 'bg-stone-950'
            }`}
              onClick={() => {
                setIsLoopMode(!isLoopMode);
                audioSynth.playClick();
              }}
              title="番茄鐘和短休息會不斷地交替倒數，適合馬拉松式持久專注"
            >
              <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-none bg-white transition-transform ${
                isLoopMode ? 'translate-x-[16px]' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 select-none">
              Auto-Cycle / 連續專念
            </span>
          </div>

          {isLoopMode && (
            <span className="text-[9px] font-black py-0.5 px-2.5 rounded-none border bg-[#FF4D00]/10 text-[#FF4D00] border-[#FF4D00]/20 animate-pulse tracking-widest uppercase">
              {loopState === 'work' ? 'WORK_PHASE 🎯' : 'BREAK_PHASE ☕'}
            </span>
          )}
        </div>
      </header>

      {/* 核心內容板塊 - Bento 幾何網格排版 */}
      <main className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
        
        {/* 左側：大型計時圓盤與完成驚喜提示 (佔 5 欄) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0F0F0F] border border-white/5 p-6 md:p-8 rounded-none shadow-none w-full lg:sticky lg:top-10">
          
          <TimerCircle
            status={status}
            totalSeconds={totalSeconds}
            remainingSeconds={remainingSeconds}
            label={timerLabel}
            isMuted={isMuted}
            volume={volume}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onToggleMute={handleToggleMute}
            onVolumeChange={handleVolumeChange}
          />

          {/* 溫馨提醒句 */}
          <div className="mt-8 text-center max-w-xs text-stone-500 font-mono text-[10px] uppercase tracking-wider leading-relaxed select-none">
            {status === 'running' 
              ? '// Target locked. Discard environmental noise and execute task.'
              : status === 'paused'
                ? '// Queue held. Breathe deeply, prepare to resume operations.'
                : status === 'completed'
                  ? '// Sequence complete. Receptors saturated. Refresh sensory array.'
                  : '// Standby. Initialize preset or structure custom parameters.'
            }
          </div>

          {/* 完成提示 Modal-Toast 彈窗 - 幾何直角科技黑紅 */}
          <AnimatePresence>
            {showCompleteToast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="absolute inset-x-4 bottom-6 bg-[#0A0A0A] text-white p-4 rounded-none shadow-2xl z-40 flex items-start gap-4 border border-[#FF4D00]"
              >
                <div className="w-8 h-8 rounded-none bg-[#FF4D00]/20 text-[#FF4D00] flex items-center justify-center flex-shrink-0 border border-[#FF4D00]/30">
                  <Sparkles className="w-4.5 h-4.5 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-[#FF4D00] uppercase tracking-widest">Sequence Success / 計時圓滿</h4>
                  <p className="text-[10px] font-mono text-stone-400 mt-1 leading-relaxed">
                    Module <span className="text-white font-bold">[{timerLabel}]</span> has concluded. Database metrics synchronized. Ready for next loop.
                  </p>
                </div>
                <button
                  onClick={() => setShowCompleteToast(false)}
                  className="text-stone-400 hover:text-[#FF4D00] font-mono text-[9px] font-black px-2.5 py-1.5 rounded-none bg-stone-900 hover:bg-stone-850 border border-white/5"
                  id="btn-toast-dismiss"
                >
                  DISMISS
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 右側：常用與自訂控制欄 (佔 7 欄) */}
        <div className="lg:col-span-7 space-y-6 w-full">
          
          <PresetList
            activeId={activePresetId}
            onSelectPreset={handleSelectPreset}
            status={status}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomTimerForm
              onApplyCustom={handleApplyCustom}
              onQuickAddSeconds={handleQuickAddSeconds}
              status={status}
            />

            <TimerHistory
              history={history}
              onClearHistory={handleClearHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
            />
          </div>

        </div>
      </main>

      {/* 頁腳 */}
      <footer className="w-full max-w-5xl mx-auto text-center mt-12 border-t border-white/5 pt-5 text-stone-500 font-mono text-[9px] flex flex-col sm:flex-row items-center justify-between gap-2 uppercase tracking-wider">
        <div className="flex items-center gap-1.5 justify-center">
          <span>📅 Telemetry Stamp:</span>
          <span className="font-mono text-white font-bold bg-stone-900 border border-white/5 px-2.5 py-0.5 rounded-none">
            {new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <p className="tracking-wide text-stone-600">
          Independent Client Interface // Web Audio synthesized frequencies // No network payload.
        </p>
      </footer>
    </div>
  );
}
