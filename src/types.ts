export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerPreset {
  id: string;
  label: string;
  duration: number; // 單位：秒
  icon: string; // lucide icon 名稱
  color: string; // Tailwind class 或 漸層色
  description: string;
}

export interface CompactHistory {
  id: string;
  label: string;
  duration: number; // 總秒數
  completedAt: string; // ISO string
}

export interface SoundConfig {
  ticking: boolean;
  ambient: boolean;
  volume: number; // 0.0 ~ 1.0
}
