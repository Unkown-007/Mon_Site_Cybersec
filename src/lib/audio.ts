"use client";

/*
 * Moteur audio Web Audio — 100% synthétisé (aucun fichier, aucun droit
 * d'auteur). Fournit :
 *  - sfx(kind) : sons d'interface courts (click, ok, err, open, type)
 *  - music     : lecteur de boucles synthwave/cyberpunk générées (play,
 *                pause, next, prev, volume, visualiseur)
 * Le contexte audio est créé paresseusement (au 1er son), idéalement depuis
 * un geste utilisateur — sinon les appels échouent silencieusement.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let currentVol = 0.35;
let muted = false;

function applyGain() {
  if (master) master.gain.value = muted ? 0 : currentVol;
}

export function setMuted(m: boolean) {
  muted = m;
  ensure();
  applyGain();
}
export function isMuted() {
  return muted;
}

/** Vrai si le contexte audio est déjà débloqué (après un geste utilisateur). */
export function isAudioActive() {
  return ctx?.state === "running" && !muted;
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : currentVol;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    master.connect(analyser);
    analyser.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

function voice(
  freq: number,
  time: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  cutoff?: number
) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  let node: AudioNode = o;
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = cutoff;
    o.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(master);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.start(time);
  o.stop(time + dur + 0.02);
}

function noise(time: number, dur: number, gain: number) {
  if (!ctx || !master) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(hp);
  hp.connect(g);
  g.connect(master);
  src.start(time);
}

/* Bruit filtré passe-bas — utilisé pour le tonnerre. */
function rumble(time: number, dur: number, gain: number, cutoff = 380) {
  if (!ctx || !master) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(cutoff, time);
  lp.frequency.exponentialRampToValueAtTime(cutoff * 0.45, time + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(lp);
  lp.connect(g);
  g.connect(master);
  src.start(time);
}

/* ───────── SFX d'interface ───────── */
export function sfx(kind: "click" | "ok" | "err" | "open" | "type" | "hover" | "thunder") {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  try {
    switch (kind) {
      case "click":
        voice(620, t, 0.06, "square", 0.18);
        break;
      case "hover":
        // tick discret de survol
        voice(2050, t, 0.018, "sine", 0.035);
        break;
      case "type":
        voice(1300, t, 0.03, "square", 0.06);
        break;
      case "ok":
        voice(660, t, 0.1, "triangle", 0.2);
        voice(990, t + 0.08, 0.14, "triangle", 0.2);
        break;
      case "err":
        voice(200, t, 0.18, "sawtooth", 0.22, 800);
        voice(140, t + 0.1, 0.22, "sawtooth", 0.2, 600);
        break;
      case "open":
        voice(330, t, 0.5, "sawtooth", 0.18, 1200);
        voice(660, t + 0.12, 0.5, "triangle", 0.15);
        break;
      case "thunder":
        // grondement lointain (suit un éclair du fond)
        rumble(t, 1.1, 0.16, 320);
        voice(54, t + 0.03, 0.9, "sine", 0.1, 200);
        voice(41, t + 0.18, 1.0, "sine", 0.08, 160);
        break;
    }
  } catch {
    /* audio indispo */
  }
}

/* ───────── Musique générative ───────── */
interface Track {
  name: string;
  bpm: number;
  bass: number[]; // une note (midi) par mesure
  arp: number[]; // motif d'arpège (midi), en croches
}

const TRACKS: Track[] = [
  {
    name: "NEON DRIVE",
    bpm: 102,
    bass: [33, 33, 31, 28],
    arp: [69, 72, 76, 72, 69, 74, 76, 72],
  },
  {
    name: "MIDNIGHT PROTOCOL",
    bpm: 84,
    bass: [29, 29, 32, 31],
    arp: [65, 68, 72, 75, 72, 68, 65, 60],
  },
  {
    name: "DATA STREAM",
    bpm: 124,
    bass: [40, 40, 38, 36],
    arp: [76, 79, 83, 79, 76, 81, 83, 88],
  },
  {
    name: "GHOST IN THE WIRE",
    bpm: 92,
    bass: [37, 37, 35, 32],
    arp: [73, 76, 80, 76, 73, 78, 80, 85],
  },
  {
    name: "RED MOON OVER NEO-TOKYO",
    bpm: 70,
    bass: [26, 26, 29, 28],
    arp: [62, 65, 69, 72, 69, 65, 62, 57],
  },
];

class Music {
  index = 0;
  playing = false;
  private step = 0;
  private nextTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<() => void>();

  get track() {
    return TRACKS[this.index];
  }
  get count() {
    return TRACKS.length;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }

  setVolume(v: number) {
    ensure();
    currentVol = v;
    applyGain();
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  play() {
    const c = ensure();
    if (!c) return;
    this.playing = true;
    this.step = 0;
    this.nextTime = c.currentTime + 0.1;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.schedule(), 25);
    this.emit();
  }

  pause() {
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.emit();
  }

  setIndex(i: number) {
    this.index = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    if (this.playing) this.play();
    else this.emit();
  }

  next() {
    this.index = (this.index + 1) % TRACKS.length;
    if (this.playing) this.play();
    else this.emit();
  }
  prev() {
    this.index = (this.index - 1 + TRACKS.length) % TRACKS.length;
    if (this.playing) this.play();
    else this.emit();
  }

  levels(): number[] {
    if (!analyser) return [];
    const arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    return Array.from(arr);
  }

  private schedule() {
    if (!ctx || !this.playing) return;
    const eighth = 60 / this.track.bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.12) {
      const t = this.nextTime;
      const s = this.step;
      const tr = this.track;
      // basse (à chaque mesure = 8 croches)
      if (s % 8 === 0) {
        const root = tr.bass[Math.floor(s / 8) % tr.bass.length];
        voice(midi(root), t, eighth * 7, "sawtooth", 0.25, 600);
        voice(midi(root + 12), t, eighth * 1.4, "square", 0.08, 900);
      }
      // arpège
      const an = tr.arp[s % tr.arp.length];
      voice(midi(an), t, eighth * 0.9, "triangle", 0.12, 2200);
      // nappe légère sur les temps
      if (s % 4 === 0) voice(midi(tr.bass[0] + 19), t, eighth * 3.5, "sine", 0.05);
      // hats
      noise(t, 0.03, s % 2 === 0 ? 0.05 : 0.025);
      this.step = (s + 1) % (tr.arp.length * 4);
      this.nextTime += eighth;
    }
  }
}

export const music = new Music();
