import { AudioContext } from "react-native-audio-api";
import { getNoiseBuffer } from "./noise-buffers";

const MAX_VOICES = 32;
const DRUM_SOUNDS = new Set(["bd", "sd", "hh", "oh", "cp", "rim", "tom"]);
const OSC_TYPES: Record<string, OscillatorType> = {
  sine: "sine",
  triangle: "triangle",
  square: "square",
  sawtooth: "sawtooth",
};

interface Voice {
  endTime: number;
}

/**
 * NativeAudioOutput handles sound synthesis using react-native-audio-api.
 * Routes events to either drum synthesis or oscillator synthesis.
 *
 * Note: react-native-audio-api's createBufferSource() is async,
 * so noise-based sounds (snare, hihat, clap) use async methods.
 */
export class NativeAudioOutput {
  private ctx: AudioContext;
  private voices: Voice[] = [];

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  trigger(value: { s?: string; note?: number; gain?: number }, time: number) {
    this.cleanupVoices(time);
    if (this.voices.length >= MAX_VOICES) return;

    const sound = value.s ?? "sine";
    const gain = value.gain ?? 0.7;

    if (DRUM_SOUNDS.has(sound)) {
      this.triggerDrum(sound, time, gain);
    } else if (sound in OSC_TYPES) {
      this.triggerOsc(sound, time, gain, value.note);
    } else {
      this.triggerOsc("sine", time, gain, value.note);
    }
  }

  private triggerDrum(sound: string, time: number, gain: number) {
    switch (sound) {
      case "bd":
        this.synthKick(time, gain);
        break;
      case "sd":
        this.synthSnare(time, gain);
        break;
      case "hh":
        this.synthHihat(time, gain, 0.06);
        break;
      case "oh":
        this.synthHihat(time, gain, 0.3);
        break;
      case "cp":
        this.synthClap(time, gain);
        break;
      case "rim":
        this.synthRim(time, gain);
        break;
      case "tom":
        this.synthTom(time, gain);
        break;
    }
  }

  private triggerOsc(
    sound: string,
    time: number,
    gain: number,
    note?: number,
  ) {
    const ctx = this.ctx;
    const freq = note ? midiToFreq(note) : 440;
    const duration = 0.2;

    const osc = ctx.createOscillator();
    osc.type = (OSC_TYPES[sound] ?? "sine") as OscillatorType;
    osc.frequency.setValueAtTime(freq, time);

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  // --- Kick: sine sweep 160→50Hz with punch ---
  private synthKick(time: number, gain: number) {
    const ctx = this.ctx;
    const duration = 0.5;

    // Click transient
    const click = ctx.createOscillator();
    click.type = "sine";
    click.frequency.setValueAtTime(1000, time);
    click.frequency.exponentialRampToValueAtTime(200, time + 0.01);
    const clickEnv = ctx.createGain();
    clickEnv.gain.setValueAtTime(gain * 0.4, time);
    clickEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    click.connect(clickEnv);
    clickEnv.connect(ctx.destination);
    click.start(time);
    click.stop(time + 0.02);

    // Body
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.12);

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  // --- Snare: tone body + noise rattle (async buffer source) ---
  private async synthSnare(time: number, gain: number) {
    const ctx = this.ctx;
    const duration = 0.2;

    // Tone body
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.04);

    const oscEnv = ctx.createGain();
    oscEnv.gain.setValueAtTime(gain * 0.5, time);
    oscEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(oscEnv);
    oscEnv.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);

    // Noise rattle
    const noiseSrc = await ctx.createBufferSource();
    noiseSrc.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(3000, time);

    const noiseEnv = ctx.createGain();
    noiseEnv.gain.setValueAtTime(gain * 0.7, time);
    noiseEnv.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseEnv);
    noiseEnv.connect(ctx.destination);
    noiseSrc.start(time);
    noiseSrc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  // --- Hihat: filtered noise (async buffer source) ---
  private async synthHihat(time: number, gain: number, duration: number) {
    const ctx = this.ctx;

    const noiseSrc = await ctx.createBufferSource();
    noiseSrc.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(8000, time);

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain * 0.4, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noiseSrc.connect(filter);
    filter.connect(env);
    env.connect(ctx.destination);
    noiseSrc.start(time);
    noiseSrc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  // --- Clap: filtered noise bursts (async buffer source) ---
  private async synthClap(time: number, gain: number) {
    const ctx = this.ctx;
    const duration = 0.15;

    const noiseSrc = await ctx.createBufferSource();
    noiseSrc.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1500, time);
    filter.Q.setValueAtTime(2, time);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(gain * 0.8, time + 0.005);
    env.gain.linearRampToValueAtTime(gain * 0.3, time + 0.01);
    env.gain.linearRampToValueAtTime(gain * 0.7, time + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noiseSrc.connect(filter);
    filter.connect(env);
    env.connect(ctx.destination);
    noiseSrc.start(time);
    noiseSrc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  // --- Rimshot: short high-freq click ---
  private synthRim(time: number, gain: number) {
    const ctx = this.ctx;
    const duration = 0.04;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(900, time);

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain * 0.5, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  // --- Tom: sine sweep with body ---
  private synthTom(time: number, gain: number) {
    const ctx = this.ctx;
    const duration = 0.35;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + duration);

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);

    this.voices.push({ endTime: time + duration });
  }

  private cleanupVoices(currentTime: number) {
    this.voices = this.voices.filter((v) => v.endTime > currentTime);
  }
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
