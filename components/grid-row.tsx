import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GridCell } from "./grid-cell";
import type { GridRow as GridRowType } from "../lib/types";

interface GridRowProps {
  row: GridRowType;
  cellSize: number;
}

function GridRowInner({ row, cellSize }: GridRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <Text style={styles.labelText} numberOfLines={1}>
          {row.label}
        </Text>
      </View>
      <View style={styles.cells}>
        {row.cells.map((cell, i) => (
          <GridCell
            key={i}
            active={cell.active}
            instrument={row.instrument}
            size={cellSize}
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
    marginBottom: 2,
  },
  label: {
    width: 44,
    paddingRight: 4,
  },
  labelText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "right",
  },
  cells: {
    flexDirection: "row",
  },
});
