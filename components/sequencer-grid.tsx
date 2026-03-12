import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useStrudel } from "../lib/providers/strudel-provider";
import { GridRow } from "./grid-row";
import { NeumorphicView } from "./neumorphic-view";

const LABEL_WIDTH = 30;
const LABEL_GAP = 8;
const GRID_PADDING = 14;
const CELL_GAP = 4;

export function SequencerGrid() {
  const { state, actions, playbackStep } = useStrudel();
  const { gridData, isPlaying } = state;
  const { width: screenWidth } = useWindowDimensions();

  const steps = gridData?.steps ?? 16;
  const containerWidth = screenWidth - 40; // 20px padding each side
  // Match the flexbox layout: cells container = total - padding - label - label gap
  const cellsWidth = containerWidth - GRID_PADDING * 2 - LABEL_WIDTH - LABEL_GAP;
  // Each cell via flex: 1 gets (cellsWidth - totalGaps) / steps
  const cellWidth = (cellsWidth - (steps - 1) * CELL_GAP) / steps;
  const cellStride = cellWidth + CELL_GAP;

  // Cursor should land at the center of each cell
  const cursorOffset = GRID_PADDING + LABEL_WIDTH + LABEL_GAP;
  const cursorX = useDerivedValue(() => {
    return cursorOffset + playbackStep.value * cellStride + cellWidth / 2;
  });

  const rowHeight = 21 + 6; // cell height + gap
  const gridHeight = gridData ? gridData.rows.length * rowHeight : 0;

  const cursorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cursorX.value }],
    opacity: isPlaying ? 1 : 0,
  }));

  if (!gridData || gridData.rows.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Say something to get started!</Text>
        <Text style={styles.emptyHint}>Try: "Give me a rock beat"</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Step Sequencer</Text>
        <Text style={styles.headerMeta}>
          {steps} STEPS · 4/4
        </Text>
      </View>
      <NeumorphicView inset radius={18} distance={4}>
        <View style={styles.gridInner}>
          {gridData.rows.map((row) => (
            <GridRow key={row.instrument} row={row} cellSize={cellWidth} onToggleCell={actions.toggleCell} />
          ))}
          <Animated.View
            style={[styles.cursor, { height: gridHeight }, cursorStyle]}
          />
        </View>
      </NeumorphicView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3A4150",
    fontFamily: "GeistMono_500Medium",
  },
  headerMeta: {
    fontSize: 10,
    color: "#8A95A5",
    letterSpacing: 0.5,
    fontFamily: "GeistMono_400Regular",
  },
  gridInner: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 6,
  },
  empty: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#8A95A5",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyHint: {
    color: "#AAAFB8",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  cursor: {
    position: "absolute",
    top: 14,
    width: 2,
    backgroundColor: "rgba(108, 99, 255, 0.5)",
    borderRadius: 1,
  },
});
