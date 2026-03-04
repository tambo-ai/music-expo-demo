/** A single cell in the sequencer grid */
export interface GridCell {
  /** Whether this step is active (has a hit) */
  active: boolean;
  /** Velocity 0–1 (for future use; default 1) */
  velocity: number;
}

/** One row of the grid (one instrument track) */
export interface GridRow {
  /** Instrument/sound name (e.g. "bd", "sd", "hh") */
  instrument: string;
  /** Display label for UI */
  label: string;
  /** Steps in this row */
  cells: GridCell[];
}

/** Full grid data for the sequencer UI */
export interface GridData {
  /** Number of steps (columns) */
  steps: number;
  /** Rows, one per instrument */
  rows: GridRow[];
}

/** Instrument color mapping for the grid UI */
export const INSTRUMENT_COLORS: Record<string, string> = {
  bd: "#e53e3e",    // deep red — kick
  sd: "#ed8936",    // orange — snare
  hh: "#ecc94b",    // yellow — hihat
  oh: "#f6e05e",    // light yellow — open hihat
  cp: "#9f7aea",    // purple — clap
  rim: "#fc8181",   // light red — rimshot
  tom: "#f56565",   // red — tom
  sine: "#4299e1",  // blue — sine
  triangle: "#48bb78", // green — triangle
  square: "#ed64a6",   // pink — square
  sawtooth: "#667eea",  // indigo — sawtooth
};

/** Display labels for instruments */
export const INSTRUMENT_LABELS: Record<string, string> = {
  bd: "Kick",
  sd: "Snare",
  hh: "HiHat",
  oh: "Open HH",
  cp: "Clap",
  rim: "Rim",
  tom: "Tom",
  sine: "Sine",
  triangle: "Tri",
  square: "Square",
  sawtooth: "Saw",
};
