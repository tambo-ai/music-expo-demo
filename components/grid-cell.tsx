import React from "react";
import { View, StyleSheet } from "react-native";
import { INSTRUMENT_COLORS } from "../lib/types";

const CELL_HEIGHT = 21;

interface GridCellProps {
  active: boolean;
  instrument: string;
  size: number;
}

function GridCellInner({ active, instrument }: GridCellProps) {
  const color = INSTRUMENT_COLORS[instrument] ?? "#6C63FF";

  if (active) {
    return (
      <View
        style={[
          styles.cell,
          { backgroundColor: color },
        ]}
      />
    );
  }

  // Inactive: dual neumorphic shadow (dark outer wraps light inner)
  return (
    <View style={[styles.cell, styles.inactiveDark]}>
      <View style={styles.inactiveLight} />
    </View>
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
    flex: 1,
    height: CELL_HEIGHT,
    borderRadius: 6,
  },
  inactiveDark: {
    backgroundColor: "#E0E5EC",
    shadowColor: "#BABECC",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  inactiveLight: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: "#E0E5EC",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
