import React, { useMemo } from 'react';
import { History, Award, Trash2, Calendar, Trophy } from 'lucide-react';
import { CompactHistory } from '../types';

interface TimerHistoryProps {
  history: CompactHistory[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const TimerHistory: React.FC<TimerHistoryProps> = ({
  history,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  // 統計總數據
  const stats = useMemo(() => {
    const totalCount = history.length;
    const totalSecs = history.reduce((acc, curr) => acc + curr.duration, 0);
    
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    return {
      totalCount,
      totalSecs,
      formattedTotalTime: hrs > 0 
        ? `${hrs}h ${mins}m` 
        : mins > 0 
          ? `${mins}m ${secs}s`
          : `${secs}s`
    };
  }, [history]);

  // 成就勳章定義
  const achievements = useMemo(() => {
    const totalMins = Math.floor(stats.totalSecs / 60);

    return [
      {
        id: 'badge-1',
        name: '專注萌芽 / ACT_INIT',
        target: '完成任意 1 次計時',
        met: true,
        icon: '🌱',
        color: 'bg-[#FF4D00]/5 border-[#FF4D00]/35 text-white',
        desc: '啟動並順利完成了第一次時間倒數。'
      },
      {
        id: 'badge-2',
        name: '番茄新手 / NOV_POMO',
        target: '累計專注 15 分鐘',
        met: totalMins >= 15,
        icon: '🍅',
        color: 'bg-stone-900 border-[#FF4D00]/35 text-white',
        desc: '順利掌握番茄工作法基本長度與節奏的實踐者。'
      },
      {
        id: 'badge-3',
        name: '心流旅人 / FLOW_TRV3',
        target: '累計專注 60 分鐘',
        met: totalMins >= 60,
        icon: '🧗',
        color: 'bg-stone-900 border-[#FF4D00]/40 text-white',
        desc: '高度集中思想，成功帶領大腦探尋無噪音心流。'
      },
      {
        id: 'badge-4',
        name: '時間主宰 / CHRON_PLT',
        target: '累計專注 180 分鐘',
        met: totalMins >= 180,
        icon: '🚀',
        color: 'bg-stone-900 border-[#FF4D00]/50 text-[#FF4D00]',
        desc: '主宰時間維度，成就卓越非凡的深度攻關者。'
      }
    ];
  }, [stats.totalSecs]);

  // 格式化 ISO 日期
  const formatTimeStr = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${date.getMonth() + 1}/${date.getDate()} ${hours}:${mins}`;
    } catch {
      return '剛剛';
    }
  };

  return (
    <div className="space-y-6">
      {/* 專注數據面板 */}
      <div className="bg-[#0F0F0F] border border-white/5 p-5 rounded-none shadow-none text-white relative overflow-hidden">
        {/* 背景大數字標記 */}
        <div className="absolute top-1 right-2 text-7xl font-mono opacity-[0.03] select-none pointer-events-none font-black">
          STATS
        </div>

        <div className="relative flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FF4D00]" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">Telemetry / 專注數據</span>
          </div>
          {stats.totalCount > 0 && (
            <span className="text-[9px] uppercase tracking-wider font-mono text-stone-500">
              SECURE_LOG
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="px-1">
            <span className="text-stone-500 uppercase tracking-widest text-[9px] font-bold block mb-1">Total Cycles / 完成次數</span>
            <span className="font-mono text-3xl font-black text-white flex items-baseline gap-1">
              {stats.totalCount}
              <span className="text-xs font-normal text-stone-500">CYC</span>
            </span>
          </div>

          <div className="border-l border-white/5 pl-4">
            <span className="text-stone-500 uppercase tracking-widest text-[9px] font-bold block mb-1">Total Duration / 累計長度</span>
            <span className="font-mono text-3xl font-black text-[#FF4D00] block truncate">
              {stats.formattedTotalTime}
            </span>
          </div>
        </div>
      </div>

      {/* 勳章牆 */}
      <div>
        <h4 className="text-white font-black text-xs tracking-[0.25em] uppercase flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
          <Award className="w-4 h-4 text-[#FF4D00]" />
          Focus Milestones / 勳章里程
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-none border flex flex-col items-center justify-center text-center transition-all duration-300 relative group overflow-hidden ${
                badge.met
                  ? `${badge.color} hover:border-[#FF4D00] shadow-[0_2px_10px_rgba(255,75,0,0.05)]`
                  : 'bg-stone-950 border-white/5 text-stone-600 opacity-25 cursor-not-allowed'
              }`}
            >
              <span className={`text-2xl mb-1 ${badge.met ? '' : 'grayscale filter'}`}>
                {badge.icon}
              </span>
              <span className={`text-[10px] font-bold truncate max-w-full ${badge.met ? 'text-white' : 'text-stone-500'}`}>
                {badge.name}
              </span>
              <span className="text-[9px] font-mono text-stone-500 mt-0.5 block font-bold">
                {badge.target}
              </span>

              {/* 懸停解說 */}
              {badge.met && (
                <div className="absolute inset-0 bg-stone-950 text-stone-300 p-2 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-[10px] uppercase font-bold text-[#FF4D00] tracking-wider">{badge.name.split('/')[0]}</p>
                  <p className="text-[9px] text-stone-400 mt-1 leading-normal">{badge.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 歷史詳細名單 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-black text-xs tracking-[0.25em] uppercase flex items-center gap-2">
            <History className="w-4 h-4 text-stone-400" />
            Registry Logs / 歷史紀錄
          </h4>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[9px] text-[#FF4D00] hover:text-[#FF6622] uppercase font-bold tracking-widest font-mono flex items-center gap-1.5 cursor-pointer"
              id="btn-clear-history-all"
            >
              <Trash2 className="w-3 h-3" />
              Wipe Logs
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-white/15 bg-[#0F0F0F] text-stone-500 rounded-none">
            <span className="text-xl block mb-1">📅</span>
            <p className="text-xs uppercase font-mono tracking-wider">No cycles on record</p>
            <p className="text-[10px] text-stone-605 mt-1">Ready to sync next completed window.</p>
          </div>
        ) : (
          <div className="max-h-54 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
            {history.map((item) => {
              const itemMinutes = Math.floor(item.duration / 60);
              const itemSeconds = item.duration % 60;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-none bg-stone-950 border border-white/5 hover:border-[#FF4D00]/30 transition-all duration-305 group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white block truncate uppercase tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono text-stone-500 flex items-center gap-1 mt-0.5 font-semibold">
                      <Calendar className="w-3 h-3 text-[#FF4D00]" />
                      {formatTimeStr(item.completedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-black text-[#FF4D00] bg-[#FF4D00]/5 border border-[#FF4D00]/20 px-2 py-0.5 rounded-none flex-shrink-0">
                      {itemMinutes > 0 ? `${itemMinutes}m ${itemSeconds}s` : `${itemSeconds}s`}
                    </span>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="text-stone-600 hover:text-[#FF4D00] transition-colors p-1 hover:bg-stone-900 cursor-pointer md:opacity-0 group-hover:opacity-100"
                      title="刪除此筆"
                      id={`btn-delete-history-${item.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

