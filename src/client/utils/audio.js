/**
 * Audio utilities (ported unchanged — cricket chirp for empty states).
 */
export function playCricketsChirp() {
  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return;
  const AudioCtx = typeof AudioContext !== 'undefined' ? AudioContext : webkitAudioContext;
  let ctx;
  try { ctx = new AudioCtx(); } catch { return; }

  const _play = () => {
    const CHIRP_FREQ_LO  = 4000;
    const CHIRP_FREQ_HI  = 5000;
    const CHIRP_DURATION = 0.04;
    const BURST_COUNT    = 3;
    const BURST_GAP      = 0.08;
    const GAIN_PEAK      = 0.15;
    let startTime = ctx.currentTime + 0.05;
    for (let burst = 0; burst < BURST_COUNT; burst++) {
      const burstStart = startTime + burst * (CHIRP_DURATION * 4 + BURST_GAP);
      for (let pulse = 0; pulse < 4; pulse++) {
        const freq  = pulse % 2 === 0 ? CHIRP_FREQ_LO : CHIRP_FREQ_HI;
        const t0    = burstStart + pulse * CHIRP_DURATION;
        const t1    = t0 + CHIRP_DURATION;
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(GAIN_PEAK, t0 + 0.005);
        gain.gain.linearRampToValueAtTime(0, t1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t1);
      }
    }
    const closePause = (BURST_COUNT * (CHIRP_DURATION * 4 + BURST_GAP) + 0.3) * 1000;
    setTimeout(() => ctx.close().catch(() => {}), closePause);
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(_play).catch(() => ctx.close().catch(() => {}));
  } else {
    _play();
  }
}
