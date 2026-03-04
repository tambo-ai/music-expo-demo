import type { StrudelPattern } from "./engine";
import type { GridData, GridRow, GridCell } from "../types";
import { INSTRUMENT_LABELS } from "../types";

/**
 * Convert a Strudel pattern into GridData for the sequencer UI.
 * Queries one cycle and quantizes events to a step grid.
 */
export function patternToGrid(
  pattern: StrudelPattern,
  steps: number = 16,
): GridData {
  const haps = pattern.queryArc(0, 1);

  // Group events by instrument
  const instrumentMap = new Map<string, boolean[]>();

  for (const hap of haps) {
    if (!hap.hasOnset()) continue;

    const value = hap.value as Record<string, unknown>;
    const sound = (value.s as string) ?? "sine";

    if (!instrumentMap.has(sound)) {
      instrumentMap.set(sound, new Array(steps).fill(false));
    }

    const onset = hap.whole?.begin ?? hap.part.begin;
    const onsetNumber = typeof onset === "number" ? onset : Number(onset);
    const step = Math.round(onsetNumber * steps) % steps;
    instrumentMap.get(sound)![step] = true;
  }

  // Build rows in a stable order (drums first, then oscillators)
  const drumOrder = ["bd", "sd", "hh", "oh", "cp", "rim", "tom"];
  const oscOrder = ["sine", "triangle", "square", "sawtooth"];
  const allOrder = [...drumOrder, ...oscOrder];

  const rows: GridRow[] = [];

  for (const inst of allOrder) {
    const active = instrumentMap.get(inst);
    if (!active) continue;

    rows.push({
      instrument: inst,
      label: INSTRUMENT_LABELS[inst] ?? inst,
      cells: active.map(
        (a): GridCell => ({
          active: a,
          velocity: 1,
        }),
      ),
    });
  }

  // Any instruments not in our predefined order
  for (const [inst, active] of instrumentMap) {
    if (allOrder.includes(inst)) continue;
    rows.push({
      instrument: inst,
      label: INSTRUMENT_LABELS[inst] ?? inst,
      cells: active.map(
        (a): GridCell => ({
          active: a,
          velocity: 1,
        }),
      ),
    });
  }

  return { steps, rows };
}
