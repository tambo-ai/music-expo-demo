import type { GridData } from "../types";

/**
 * Convert GridData back into a Strudel mini-notation string.
 * Each row becomes one comma-separated layer, e.g. "bd ~ bd ~, hh ~ hh ~".
 */
export function gridToCode(grid: GridData): string {
  const layers: string[] = [];

  for (const row of grid.rows) {
    // Each cell becomes one top-level token so that Strudel divides the cycle
    // evenly across all steps.  Compression (e.g. "~*4") would reduce the
    // number of top-level tokens, shifting event positions within the cycle.
    const tokens: string[] = row.cells.map((cell) =>
      cell.active ? row.instrument : "~",
    );

    // Skip rows that are entirely rests
    if (row.cells.every((c) => !c.active)) continue;

    layers.push(tokens.join(" "));
  }

  return layers.join(", ");
}
