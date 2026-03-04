import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useStrudel } from "../lib/providers/strudel-provider";
import { InspectModal } from "./inspect-modal";

export function TransportBar() {
  const { state, actions } = useStrudel();
  const { isPlaying, bpm, code, error } = state;
  const [showInspect, setShowInspect] = useState(false);

  const handlePlayStop = () => {
    if (isPlaying) {
      actions.stop();
    } else {
      actions.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={handlePlayStop}
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          disabled={!code}
        >
          <Text style={styles.playIcon}>{isPlaying ? "■" : "▶"}</Text>
        </Pressable>

        <Text style={styles.bpm}>{bpm} BPM</Text>

        <View style={styles.spacer} />

        {code ? (
          <Pressable
            onPress={() => setShowInspect(true)}
            style={styles.inspectButton}
          >
            <Text style={styles.inspectText}>Inspect</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error} numberOfLines={2}>
          {error}
        </Text>
      ) : null}

      <InspectModal
        visible={showInspect}
        code={code}
        onClose={() => setShowInspect(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonActive: {
    backgroundColor: "#e53e3e",
  },
  playIcon: {
    color: "#fff",
    fontSize: 16,
  },
  bpm: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  spacer: {
    flex: 1,
  },
  inspectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  inspectText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    color: "#fc8181",
    fontSize: 12,
    marginTop: 4,
  },
});
