import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useStrudel } from "../lib/providers/strudel-provider";
import { NeumorphicView } from "./neumorphic-view";

export function TransportBar() {
  const { state, actions } = useStrudel();
  const { isPlaying, bpm, code, error } = state;

  const handlePlayStop = () => {
    if (isPlaying) {
      actions.stop();
    } else {
      actions.play();
    }
  };

  return (
    <View>
      <NeumorphicView radius={22} distance={6}>
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            <NeumorphicView
              radius={24}
              distance={5}
              inset={isPlaying}
              style={!isPlaying ? styles.playButtonOuter : undefined}
            >
              <Pressable
                onPress={() => { if (!isPlaying && code) actions.play(); }}
                style={[styles.playButton, styles.playButtonBg]}
                disabled={!code}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
              </Pressable>
            </NeumorphicView>

            <NeumorphicView radius={20} distance={5} inset={!isPlaying}>
              <Pressable
                onPress={() => { if (isPlaying) actions.stop(); }}
                style={styles.stopButton}
              >
                <Ionicons name="stop" size={16} color="#4A5568" />
              </Pressable>
            </NeumorphicView>
          </View>

          <View style={styles.bpmGroup}>
            <Text style={styles.bpmValue}>{bpm}</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>

          <View style={styles.rightGroup}>
            <NeumorphicView radius={20} distance={5}>
              <Pressable
                onPress={() => actions.setBpm(Math.max(40, bpm - 5))}
                style={styles.bpmButton}
              >
                <Feather name="minus" size={18} color="#4A5568" />
              </Pressable>
            </NeumorphicView>
            <NeumorphicView radius={20} distance={5}>
              <Pressable
                onPress={() => actions.setBpm(Math.min(240, bpm + 5))}
                style={styles.bpmButton}
              >
                <Feather name="plus" size={18} color="#4A5568" />
              </Pressable>
            </NeumorphicView>
          </View>
        </View>
      </NeumorphicView>

      {error ? (
        <Text style={styles.error} numberOfLines={2}>
          {error}
        </Text>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  playButtonOuter: {
    backgroundColor: "#6C63FF",
  },
  playButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonBg: {
    backgroundColor: "#6C63FF",
    borderRadius: 24,
  },
  playIcon: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  stopButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stopIcon: {
    color: "#4A5568",
    fontSize: 14,
  },
  stopIconDisabled: {
    color: "#8A95A5",
  },
  bpmGroup: {
    alignItems: "center",
    gap: 2,
  },
  bpmValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A4150",
    letterSpacing: -0.48,
    fontFamily: "JetBrains Mono",
  },
  bpmLabel: {
    fontSize: 9,
    color: "#8A95A5",
    letterSpacing: 0.9,
    fontFamily: "JetBrains Mono",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bpmButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  bpmButtonText: {
    color: "#4A5568",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 8,
    marginHorizontal: 4,
  },
});
