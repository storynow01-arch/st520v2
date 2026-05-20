/**
 * Web Audio API 音效合成器
 * 無須外接任何音檔，即時動態合成高質感禪意音效，保證 100% 播放成功
 */

class ZenAudioSynth {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // 解鎖 AudioContext (必須由使用者點擊事件觸發)
  unlock() {
    this.init();
  }

  // 擬真物理按鈕按下音效：極短的滑音，給予點擊回饋
  playClick() {
    this.init();
    if (!this.ctx || this.volume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 精準高雅的時鐘滴答聲 (Ticking)
  playTick() {
    this.init();
    if (!this.ctx || this.volume === 0) return;

    const now = this.ctx.currentTime;
    
    // 使用帶通濾波器與短瞬態來製作乾淨的木質滴答感
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    // 滴答音：高頻，極為短促
    osc.frequency.setValueAtTime(1200, now);
    
    gain.gain.setValueAtTime(this.volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 禪意風磬/和弦音 (Chime) - 倒數結束時播放
  // 合成一個溫暖多諧波、漸漸衰減的和弦 C9 (C4, E4, G4, D5)
  playChime() {
    this.init();
    if (!this.ctx || this.volume === 0) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [261.63, 329.63, 392.00, 587.33]; // C4, E4, G4, D5

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      // 不同的和弦音符給予輕微的延遲，達到彈奏的琶音感
      const startTime = now + idx * 0.08;
      const duration = 2.5 - idx * 0.2;

      // 使用 triangle 波形調製出溫和的風鈴琴色
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // 模擬物理敲擊：瞬間到最大值，隨後呈指數衰減，並加入溫柔的顫音
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }

  // 倒數最後 3 秒的警告節奏：由低轉高的警示音
  playWarning(step: number) {
    this.init();
    if (!this.ctx || this.volume === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    // 隨著步驟 (3, 2, 1) 音調漸高
    const freq = 440 + (3 - step) * 110;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const audioSynth = new ZenAudioSynth();
export default audioSynth;
