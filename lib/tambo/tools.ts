import { z } from "zod";
import { defineTool } from "@tambo-ai/react";

let evaluateCallback: ((code: string) => { success: boolean; error?: string }) | null = null;
let playCallback: (() => void) | null = null;
let getBpmCallback: (() => number) | null = null;
let setBpmCallback: ((bpm: number) => void) | null = null;

export function wireToolCallbacks(
  evaluate: (code: string) => { success: boolean; error?: string },
  play: () => void,
  getBpm: () => number,
  setBpm: (bpm: number) => void,
) {
  evaluateCallback = evaluate;
  playCallback = play;
  getBpmCallback = getBpm;
  setBpmCallback = setBpm;
}

export const updatePattern = defineTool({
  name: "update_pattern",
  description:
    "Update the musical pattern using Strudel mini-notation. This evaluates the pattern and starts playback. Always output the COMPLETE pattern including all tracks.",
  inputSchema: z.object({
    code: z
      .string()
      .describe(
        "Mini-notation pattern string, e.g. 'bd sd, hh*8' for kick/snare with eighth-note hihats",
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  tool: async ({ code }) => {
    if (!evaluateCallback) {
      return { success: false, error: "Audio engine not initialized" };
    }

    const result = evaluateCallback(code);
    if (result.success && playCallback) {
      playCallback();
    }
    return result;
  },
});

export const getBpm = defineTool({
  name: "get_bpm",
  description:
    "Get the current tempo/BPM (beats per minute) of the playing pattern. Use this to check the current speed, rhythm pace, or tempo before adjusting it.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    bpm: z.number(),
  }),
  tool: async () => {
    if (!getBpmCallback) {
      return { bpm: 120 };
    }
    return { bpm: getBpmCallback() };
  },
});

export const setBpm = defineTool({
  name: "set_bpm",
  description:
    "Set the tempo/BPM (beats per minute) to control how fast or slow the pattern plays. Use this to change the speed, rhythm pace, or tempo. Valid range is 40-240. Common tempos: 70-90 hip-hop, 120-130 house, 140-170 drum & bass.",
  inputSchema: z.object({
    bpm: z
      .number()
      .min(40)
      .max(240)
      .describe("Beats per minute, between 40 and 240"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    bpm: z.number(),
  }),
  tool: async ({ bpm }) => {
    if (!setBpmCallback) {
      return { success: false, bpm: 120 };
    }
    const clamped = Math.max(40, Math.min(240, Math.round(bpm)));
    setBpmCallback(clamped);
    return { success: true, bpm: clamped };
  },
});

export const tools = [updatePattern, getBpm, setBpm];
