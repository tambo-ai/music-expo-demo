import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { INSTRUMENT_COLORS } from "../lib/types";

const CELL_HEIGHT = 21;

interface GridCellProps {
  active: boolean;
  instrument: string;
  size: number;
  onPress?: () => void;
}

function GridCellInner({ active, instrument, onPress }: GridCellProps) {
  const color = INSTRUMENT_COLORS[instrument] ?? "#6C63FF";

  if (active) {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.cell,
          { backgroundColor: color },
        ]}
      />
    );
  }

  // Inactive: dual neumorphic shadow (dark outer wraps light inner)
  return (
    <Pressable onPress={onPress} style={[styles.cell, styles.inactiveDark]}>
      <View style={styles.inactiveLight} />
    </Pressable>
  );
}

export const GridCell = React.memo(GridCellInner, (prev, next) => {
  return (
    prev.active === next.active &&
    prev.instrument === next.instrument &&
    prev.size === next.size &&
    prev.onPress === next.onPress
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
