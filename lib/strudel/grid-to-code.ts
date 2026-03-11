import type { GridData } from "../types";

/**
 * Convert GridData back into a Strudel mini-notation string.
 * Each row becomes one comma-separated layer, e.g. "bd ~ bd ~, hh*8".
 *
 * Applies simple compression: consecutive repeated sounds become sound*N.
 */
export function gridToCode(grid: GridData): string {
  const layers: string[] = [];

  for (const row of grid.rows) {
    const tokens: string[] = row.cells.map((cell) =>
      cell.active ? row.instrument : "~",
    );

    // Compress runs of the same token (e.g. "hh hh hh hh" → "hh*4")
    const compressed: string[] = [];
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      let count = 1;
      while (i + count < tokens.length && tokens[i + count] === token) {
        count++;
      }
      compressed.push(count > 1 ? `${token}*${count}` : token);
      i += count;
    }

    // Skip rows that are entirely rests
    if (row.cells.every((c) => !c.active)) continue;

    layers.push(compressed.join(" "));
  }

  return layers.join(", ");
}
