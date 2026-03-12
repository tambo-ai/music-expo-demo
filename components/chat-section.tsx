import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { NeumorphicView } from "./neumorphic-view";
import { ChatMode } from "./chat-mode";
import { VoiceMode } from "./voice-mode";

const TRANSITION_DURATION = 300;

export function ChatSection() {
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progress = useSharedValue(1); // 0 = chat, 1 = voice

  const onTransitionDone = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const toggleMode = useCallback(() => {
    const next = !isVoiceMode;
    setIsTransitioning(true);
    setIsVoiceMode(next);
    progress.value = withTiming(
      next ? 1 : 0,
      { duration: TRANSITION_DURATION, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onTransitionDone)();
      },
    );
  }, [isVoiceMode, progress, onTransitionDone]);

  const chatStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const voiceStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const showChat = !isVoiceMode || isTransitioning;
  const showVoice = isVoiceMode || isTransitioning;

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

      {/* Crossfade container — only mount both during transition */}
      <View style={styles.contentArea}>
        {showChat && (
          <Animated.View style={[styles.face, isVoiceMode ? styles.overlayFace : undefined, chatStyle]}>
            <ChatMode />
          </Animated.View>
        )}
        {showVoice && (
          <Animated.View style={[styles.face, !isVoiceMode ? styles.overlayFace : undefined, voiceStyle]}>
            <VoiceMode />
          </Animated.View>
        )}
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
  contentArea: {
    flex: 1,
  },
  face: {
    flex: 1,
  },
  overlayFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
