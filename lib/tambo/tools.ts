import { z } from "zod";
import { defineTool } from "@tambo-ai/react";

// These will be wired to StrudelProvider actions in Step 8.
// For now, store callbacks that get set by the provider.
let evaluateCallback: ((code: string) => { success: boolean; error?: string }) | null = null;
let playCallback: (() => void) | null = null;

export function wireToolCallbacks(
  evaluate: (code: string) => { success: boolean; error?: string },
  play: () => void,
) {
  evaluateCallback = evaluate;
  playCallback = play;
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

export const tools = [updatePattern];
