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

/** Instrument color mapping for the grid UI — from Paper design */
export const INSTRUMENT_COLORS: Record<string, string> = {
  bd: "#6C63FF",    // purple — kick
  sd: "#FF6B6B",    // coral red — snare
  hh: "#F6AD55",    // orange — hihat
  oh: "#F6C542",    // yellow-orange — open hihat
  cp: "#9B8AFF",    // light purple — clap
  rim: "#F08B8B",   // light coral — rimshot
  tom: "#E85B5B",   // red — tom
  sine: "#4A9EE8",  // blue — sine
  triangle: "#48BB78", // green — bass
  square: "#E86BA6",   // pink — square
  sawtooth: "#6B7BEA",  // indigo — sawtooth
};

/** Display labels for instruments */
export const INSTRUMENT_LABELS: Record<string, string> = {
  bd: "KCK",
  sd: "SNR",
  hh: "HI",
  oh: "OH",
  cp: "CLP",
  rim: "RIM",
  tom: "TOM",
  sine: "SIN",
  triangle: "BAS",
  square: "SQR",
  sawtooth: "SAW",
};
