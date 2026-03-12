import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { NeumorphicView } from "./neumorphic-view";
import { ChatMode } from "./chat-mode";
import { VoiceMode } from "./voice-mode";

const FLIP_DURATION = 500;

export function ChatSection() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const flipProgress = useSharedValue(0); // 0 = chat, 1 = voice

  const toggleMode = useCallback(() => {
    const next = !isVoiceMode;
    setIsVoiceMode(next);
    flipProgress.value = withTiming(next ? 1 : 0, {
      duration: FLIP_DURATION,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isVoiceMode, flipProgress]);

  // Chat side: visible when progress 0→0.5, hidden at 0.5→1
  const chatStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 0.5, 1], [0, 90, 90]);
    const opacity = flipProgress.value <= 0.5 ? 1 : 0;
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: "hidden" as const,
    };
  });

  // Voice side: hidden at 0→0.5, visible when progress 0.5→1
  const voiceStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 0.5, 1], [-90, -90, 0]);
    const opacity = flipProgress.value > 0.5 ? 1 : 0;
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: "hidden" as const,
    };
  });

  return (
    <View style={styles.container}>
      {/* Header with toggle */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerDot} />
          <Text style={styles.headerTitle}>
            {isVoiceMode ? "Voice Mode" : "AI Assistant"}
          </Text>
        </View>
        <NeumorphicView
          radius={10}
          distance={3}
          inset={isVoiceMode}
        >
          <Pressable onPress={toggleMode} style={styles.toggleButton}>
            <Ionicons
              name={isVoiceMode ? "chatbubbles" : "mic"}
              size={14}
              color={isVoiceMode ? "#6C63FF" : "#4A5568"}
            />
          </Pressable>
        </NeumorphicView>
      </View>

      {/* Flip container */}
      <View style={styles.flipContainer}>
        <Animated.View style={[styles.face, chatStyle]}>
          <ChatMode />
        </Animated.View>
        <Animated.View style={[styles.face, styles.backFace, voiceStyle]}>
          <VoiceMode />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3A4150",
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flipContainer: {
    flex: 1,
  },
  face: {
    flex: 1,
  },
  backFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
