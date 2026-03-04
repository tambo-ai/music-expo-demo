import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useStrudel } from "../lib/providers/strudel-provider";
import { GridRow } from "./grid-row";

const CELL_SIZE = 22; // 20 + 2*margin
const LABEL_WIDTH = 48;

export function SequencerGrid() {
  const { state, playbackStep } = useStrudel();
  const { gridData, isPlaying } = state;

  const cursorX = useDerivedValue(() => {
    return LABEL_WIDTH + playbackStep.value * CELL_SIZE;
  });

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View>
          {gridData.rows.map((row) => (
            <GridRow key={row.instrument} row={row} />
          ))}
          {/* Playback cursor overlay */}
          <Animated.View style={[styles.cursor, cursorStyle]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  scroll: {
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
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 1,
  },
});
