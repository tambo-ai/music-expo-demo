import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useStrudel } from "../lib/providers/strudel-provider";
import { GridRow } from "./grid-row";

const LABEL_WIDTH = 44;
const GRID_H_PADDING = 12;
const CELL_GAP = 2; // 1px margin on each side

export function SequencerGrid() {
  const { state, playbackStep } = useStrudel();
  const { gridData, isPlaying } = state;
  const { width: screenWidth } = useWindowDimensions();

  const steps = gridData?.steps ?? 16;
  const availableWidth = screenWidth - GRID_H_PADDING * 2 - LABEL_WIDTH;
  const cellSize = Math.floor(availableWidth / steps) - CELL_GAP;

  const cursorX = useDerivedValue(() => {
    return LABEL_WIDTH + playbackStep.value * (cellSize + CELL_GAP);
  });

  const rowHeight = cellSize + CELL_GAP + 2; // cell + margin + row marginBottom
  const gridHeight = gridData ? gridData.rows.length * rowHeight : 0;

  const cursorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cursorX.value }],
    opacity: isPlaying ? 1 : 0,
  }));

  if (!gridData || gridData.rows.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Say something to get started!</Text>
        <Text style={styles.emptyHint}>
          Try: "Give me a rock beat"
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        {gridData.rows.map((row) => (
          <GridRow key={row.instrument} row={row} cellSize={cellSize} />
        ))}
        {/* Playback cursor overlay — spans only the grid rows */}
        <Animated.View
          style={[styles.cursor, { height: gridHeight }, cursorStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: GRID_H_PADDING,
    paddingVertical: 16,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyHint: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  cursor: {
    position: "absolute",
    top: 0,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 1,
  },
});
