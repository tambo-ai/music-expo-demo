import React from "react";
import { View, StyleSheet } from "react-native";
import { INSTRUMENT_COLORS } from "../lib/types";

interface GridCellProps {
  active: boolean;
  instrument: string;
  size: number;
}

function GridCellInner({ active, instrument, size }: GridCellProps) {
  const color = INSTRUMENT_COLORS[instrument] ?? "#4299e1";

  return (
    <View
      style={[
        styles.cell,
        { width: size, height: size },
        active ? { backgroundColor: color } : styles.inactive,
      ]}
    />
  );
}

export const GridCell = React.memo(GridCellInner, (prev, next) => {
  return (
    prev.active === next.active &&
    prev.instrument === next.instrument &&
    prev.size === next.size
  );
});

const styles = StyleSheet.create({
  cell: {
    borderRadius: 3,
    margin: 1,
  },
  inactive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
