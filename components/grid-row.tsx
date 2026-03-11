import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GridCell } from "./grid-cell";
import { INSTRUMENT_COLORS } from "../lib/types";
import type { GridRow as GridRowType } from "../lib/types";

interface GridRowProps {
  row: GridRowType;
  cellSize: number;
  onToggleCell?: (instrument: string, step: number) => void;
}

function GridRowInner({ row, cellSize, onToggleCell }: GridRowProps) {
  const labelColor = INSTRUMENT_COLORS[row.instrument] ?? "#8A95A5";

  const makeHandler = useCallback(
    (step: number) => () => onToggleCell?.(row.instrument, step),
    [onToggleCell, row.instrument],
  );

  return (
    <View style={styles.row}>
      <Text style={[styles.labelText, { color: labelColor }]} numberOfLines={1}>
        {row.label}
      </Text>
      <View style={styles.cells}>
        {row.cells.map((cell, i) => (
          <GridCell
            key={i}
            active={cell.active}
            instrument={row.instrument}
            size={cellSize}
            onPress={makeHandler(i)}
          />
        ))}
      </View>
    </View>
  );
}

export const GridRow = React.memo(GridRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelText: {
    fontSize: 9,
    fontWeight: "500",
    width: 30,
    letterSpacing: 0.45,
    fontFamily: "GeistMono_500Medium",
  },
  cells: {
    flexDirection: "row",
    flex: 1,
    gap: 4,
  },
});
