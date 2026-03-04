import { AudioContext } from "react-native-audio-api";
import { NativeAudioOutput } from "./audio-output";
import type { StrudelPattern } from "./engine";

const TICK_MS = 25;
const LOOKAHEAD_S = 0.1; // 100ms look-ahead

export type StepCallback = (step: number, steps: number) => void;

/**
 * Two-clocks scheduler: JS setInterval for timing, AudioContext for precision.
 * Looks ahead 100ms and pre-schedules audio events for sample-accurate playback.
 */
export class Scheduler {
  private ctx: AudioContext;
  private output: NativeAudioOutput;
  private pattern: StrudelPattern | null = null;
  private bpm: number = 120;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private cycleTime: number = 0; // Position in cycles (0–1 = one cycle)
  private startTime: number = 0; // AudioContext time when playback started
  private _isPlaying: boolean = false;
  private stepCallback: StepCallback | null = null;
  private steps: number = 16;
  private lastScheduledCycle: number = 0; // Dedup: don't re-trigger events

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  constructor(ctx: AudioContext, output: NativeAudioOutput) {
    this.ctx = ctx;
    this.output = output;
  }

  setPattern(pattern: StrudelPattern | null) {
    this.pattern = pattern;
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  setSteps(steps: number) {
    this.steps = steps;
  }

  onStep(cb: StepCallback) {
    this.stepCallback = cb;
  }

  start() {
    if (this._isPlaying) return;
    this._isPlaying = true;
    this.cycleTime = 0;
    this.startTime = this.ctx.currentTime;
    this.lastScheduledCycle = 0;

    this.timerId = setInterval(() => this.tick(), TICK_MS);
  }

  stop() {
    if (!this._isPlaying) return;
    this._isPlaying = false;

    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tick() {
    if (!this.pattern) return;

    const now = this.ctx.currentTime;
    const cycleDuration = (60 / this.bpm) * 4; // 4 beats per cycle
    const elapsed = now - this.startTime;
    const currentCycle = elapsed / cycleDuration;

    const lookAheadEnd = (elapsed + LOOKAHEAD_S) / cycleDuration;

    // Only schedule events from where we left off to avoid duplicates
    const scheduleFrom = Math.max(currentCycle, this.lastScheduledCycle);
    if (scheduleFrom >= lookAheadEnd) {
      // Nothing new to schedule, just update cursor
      const cyclePos = currentCycle % 1;
      const currentStep = Math.floor(cyclePos * this.steps);
      if (this.stepCallback) this.stepCallback(currentStep, this.steps);
      return;
    }

    // Query pattern for events in the new window only
    try {
      const haps = this.pattern.queryArc(scheduleFrom, lookAheadEnd);

      for (const hap of haps) {
        if (!hap.hasOnset()) continue;

        const onset = hap.whole?.begin ?? hap.part.begin;
        const onsetNumber = typeof onset === "number" ? onset : Number(onset);
        const eventTime = this.startTime + onsetNumber * cycleDuration;

        // Skip events in the past
        if (eventTime < now - 0.01) continue;

        const value = hap.value as Record<string, unknown>;
        this.output.trigger(
          {
            s: (value.s as string) ?? "sine",
            note: value.note as number | undefined,
            gain: value.gain as number | undefined,
          },
          eventTime,
        );
      }
      this.lastScheduledCycle = lookAheadEnd;
    } catch {
      // Pattern query error — skip this tick
    }

    // Report current step for UI cursor
    const cyclePos = currentCycle % 1;
    const currentStep = Math.floor(cyclePos * this.steps);
    if (this.stepCallback) {
      this.stepCallback(currentStep, this.steps);
    }
  }
}
