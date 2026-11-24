/** Ambient pencil scratch. Off by default; the mute button toggles it. */
class Scratch {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private target = 0;
  enabled = false;

  private ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = this.ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2600; bp.Q.value = 0.7;
    this.gain = this.ctx.createGain(); this.gain.gain.value = 0;
    src.connect(bp).connect(this.gain).connect(this.ctx.destination);
    src.start();
  }
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) { this.ensure(); this.ctx?.resume(); }
    this.apply();
    return this.enabled;
  }
  /** Called by the Director while strokes are being drawn (1) or not (0). */
  drawing(v: number) { this.target = v; this.apply(); }
  private apply() {
    if (!this.gain || !this.ctx) return;
    const g = this.enabled ? this.target * 0.07 : 0;
    this.gain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.05);
  }
}
export const scratch = new Scratch();
