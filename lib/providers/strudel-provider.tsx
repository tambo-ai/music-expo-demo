import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { AppState } from "react-native";
import { AudioContext } from "react-native-audio-api";
import { useSharedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { PatternEngine } from "../strudel/engine";
import { NativeAudioOutput } from "../strudel/audio-output";
import { Scheduler } from "../strudel/scheduler";
import { patternToGrid } from "../strudel/pattern-to-grid";
import { wireToolCallbacks } from "../tambo/tools";
import type { GridData } from "../types";

interface StrudelState {
  isPlaying: boolean;
  gridData: GridData | null;
  code: string;
  bpm: number;
  error: string | null;
}

interface StrudelActions {
  evaluate: (code: string) => { success: boolean; error?: string };
  play: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  reset: () => void;
}

interface StrudelContextValue {
  state: StrudelState;
  actions: StrudelActions;
  playbackStep: SharedValue<number>;
}

const StrudelContext = createContext<StrudelContextValue | null>(null);

export function useStrudel(): StrudelContextValue {
  const ctx = useContext(StrudelContext);
  if (!ctx) throw new Error("useStrudel must be used within StrudelProvider");
  return ctx;
}

export function StrudelProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef(new PatternEngine());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const outputRef = useRef<NativeAudioOutput | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);

  const [state, setState] = useState<StrudelState>({
    isPlaying: false,
    gridData: null,
    code: "",
    bpm: 120,
    error: null,
  });

  const playbackStep = useSharedValue(0);

  // Lazily initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      outputRef.current = new NativeAudioOutput(ctx);
      const sched = new Scheduler(ctx, outputRef.current);
      sched.onStep((step) => {
        playbackStep.value = step;
      });
      schedulerRef.current = sched;
    }
    return audioCtxRef.current;
  }, [playbackStep]);

  // Suspend/resume audio on app background/foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (nextState === "active") {
        // Resume is not available on react-native-audio-api, but we re-create if needed
      } else if (nextState === "background") {
        schedulerRef.current?.stop();
        setState((s) => ({ ...s, isPlaying: false }));
      }
    });
    return () => sub.remove();
  }, []);

  const evaluate = useCallback(
    (code: string): { success: boolean; error?: string } => {
      const engine = engineRef.current;
      try {
        const pattern = engine.evaluate(code);
        const gridData = patternToGrid(pattern);

        // Update scheduler with new pattern
        getAudioContext();
        schedulerRef.current?.setPattern(pattern);

        setState((s) => ({
          ...s,
          code,
          gridData,
          error: null,
        }));

        return { success: true };
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        setState((s) => ({ ...s, error }));
        return { success: false, error };
      }
    },
    [getAudioContext],
  );

  const play = useCallback(() => {
    getAudioContext();
    const scheduler = schedulerRef.current;
    if (!scheduler) return;

    scheduler.start();
    setState((s) => ({ ...s, isPlaying: true }));
  }, [getAudioContext]);

  const stop = useCallback(() => {
    schedulerRef.current?.stop();
    playbackStep.value = 0;
    setState((s) => ({ ...s, isPlaying: false }));
  }, [playbackStep]);

  const setBpm = useCallback((bpm: number) => {
    schedulerRef.current?.setBpm(bpm);
    setState((s) => ({ ...s, bpm }));
  }, []);

  const getBpm = useCallback(() => state.bpm, [state.bpm]);

  const reset = useCallback(() => {
    schedulerRef.current?.stop();
    playbackStep.value = 0;
    setState({
      isPlaying: false,
      gridData: null,
      code: "",
      bpm: 120,
      error: null,
    });
  }, [playbackStep]);

  // Wire tool callbacks so Tambo tools can invoke evaluate/play/bpm
  useEffect(() => {
    wireToolCallbacks(evaluate, play, getBpm, setBpm);
  }, [evaluate, play, getBpm, setBpm]);

  const value: StrudelContextValue = {
    state,
    actions: { evaluate, play, stop, setBpm, reset },
    playbackStep,
  };

  return (
    <StrudelContext.Provider value={value}>{children}</StrudelContext.Provider>
  );
}
