import { TimerPreset } from '../types';

export const TIMER_PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro',
    label: '番茄鐘專注',
    duration: 1500, // 25 分
    icon: 'Brain',
    color: 'from-amber-500 to-rose-500',
    description: '最經典的黃金專注時間，非常適合深度閱讀與常規工作。'
  },
  {
    id: 'deep-work',
    label: '深度專念',
    duration: 3000, // 50 分
    icon: 'Sparkles',
    color: 'from-blue-600 to-indigo-600',
    description: '半日型大型任務攻克，需要排除所有雜音與中斷。'
  },
  {
    id: 'short-break',
    label: '短暫修復',
    duration: 300, // 5 分
    icon: 'Coffee',
    color: 'from-emerald-400 to-teal-500',
    description: '伸個懶腰、喝口溫水、望向遠方，讓大腦重新蓄滿能量。'
  },
  {
    id: 'long-break',
    label: '悠長休憩',
    duration: 900, // 15 分
    icon: 'Trees',
    color: 'from-teal-500 to-cyan-600',
    description: '在幾輪專注之後進行中場深度放鬆，讓潛意識組織成果。'
  },
  {
    id: 'eye-relief',
    label: '20-20-20 護眼',
    duration: 20, // 20 秒
    icon: 'Eye',
    color: 'from-sky-400 to-blue-500',
    description: '每工作 20 分鐘，眺望 20 英尺（6公尺）外物體 20 秒，舒緩睫狀肌。'
  },
  {
    id: 'plank',
    label: '極限棒式',
    duration: 60, // 1 分
    icon: 'Flame',
    color: 'from-orange-500 to-rose-600',
    description: '核心鍛鍊肌耐力，在每秒的灼燒中，與身體深處對話。'
  },
  {
    id: 'zen-breath',
    label: '正念微冥想',
    duration: 180, // 3 分
    icon: 'Wind',
    color: 'from-purple-500 to-indigo-500',
    description: '閉上雙眼，吸氣四秒，呼氣四秒，平息浮躁、回歸自我的中心。'
  }
];
