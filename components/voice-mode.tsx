import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useTambo, useTamboThreadInput } from "@tambo-ai/react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import type { TamboThreadMessage } from "@tambo-ai/react";
import { NeumorphicView } from "./neumorphic-view";

function getTextContent(message: TamboThreadMessage): string {
  if (!Array.isArray(message.content)) return "";
  return message.content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function getLastAssistantText(messages: TamboThreadMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      const text = getTextContent(messages[i]);
      if (text) return text;
    }
  }
  return "";
}

const FADE_DURATION = 400;
const USER_FADE_DELAY = 3000;

export function VoiceMode() {
  const insets = useSafeAreaInsets();
  const { messages } = useTambo();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const [isListening, setIsListening] = useState(false);
  const voiceSessionRef = useRef(false);

  // Track displayed text separately so we can control fade timing
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const userOpacity = useSharedValue(0);
  const aiOpacity = useSharedValue(0);
  const prevAiTextRef = useRef("");

  // Watch for new AI responses
  const lastAiText = getLastAssistantText(messages);

  useEffect(() => {
    if (lastAiText && lastAiText !== prevAiTextRef.current && !isPending) {
      prevAiTextRef.current = lastAiText;
      setAiText(lastAiText);
      aiOpacity.value = withTiming(1, { duration: FADE_DURATION });

      // Fade out user text 3s after AI finishes
      userOpacity.value = withDelay(
        USER_FADE_DELAY,
        withTiming(0, { duration: FADE_DURATION }),
      );
    }
  }, [lastAiText, isPending, aiOpacity, userOpacity]);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    setValue(transcript);
    setUserText(transcript);
    if (event.isFinal && transcript.trim() && voiceSessionRef.current) {
      voiceSessionRef.current = false;
      submit();
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    voiceSessionRef.current = false;
  });

  useSpeechRecognitionEvent("error", () => {
    setIsListening(false);
  });

  const handleMicPress = useCallback(async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    // Fade out AI response when starting a new session
    aiOpacity.value = withTiming(0, { duration: FADE_DURATION });
    // Also fade out user text if still visible
    userOpacity.value = withTiming(0, { duration: FADE_DURATION });

    const { granted } =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) return;

    // Reset text and show user text area
    setUserText("");
    prevAiTextRef.current = "";
    userOpacity.value = withTiming(1, { duration: FADE_DURATION });

    voiceSessionRef.current = true;
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
    });
    setIsListening(true);
  }, [isListening, aiOpacity, userOpacity]);

  const userAnimStyle = useAnimatedStyle(() => ({
    opacity: userOpacity.value,
  }));

  const aiAnimStyle = useAnimatedStyle(() => ({
    opacity: aiOpacity.value,
  }));

  return (
    <NeumorphicView inset radius={22} distance={4} style={styles.card}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* User transcript - above mic */}
        <Animated.View style={[styles.textArea, styles.userArea, userAnimStyle]}>
          <Text style={styles.userText}>
            {userText || (isListening ? "Listening..." : "")}
          </Text>
        </Animated.View>

        {/* Mic button - centered */}
        <NeumorphicView
          radius={40}
          distance={6}
          style={isListening ? styles.micOuter_active : styles.micOuter}
        >
          <Pressable
            onPress={handleMicPress}
            disabled={isPending}
            style={[styles.micButton, isListening && styles.micButtonActive]}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isListening ? "stop" : "mic"}
                size={32}
                color="#FFFFFF"
              />
            )}
          </Pressable>
        </NeumorphicView>

        {/* AI response - below mic */}
        <Animated.View style={[styles.textArea, styles.aiArea, aiAnimStyle]}>
          <Text style={styles.aiText}>{aiText}</Text>
        </Animated.View>
      </View>
    </NeumorphicView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  textArea: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  userArea: {
    marginBottom: 28,
    minHeight: 40,
    justifyContent: "flex-end",
  },
  aiArea: {
    marginTop: 28,
    minHeight: 40,
    justifyContent: "flex-start",
  },
  userText: {
    fontSize: 15,
    color: "#8A95A5",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "GeistMono_400Regular",
    fontStyle: "italic",
  },
  aiText: {
    fontSize: 15,
    color: "#3A4150",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "GeistMono_400Regular",
  },
  micOuter: {
    backgroundColor: "#6C63FF",
  },
  micOuter_active: {
    backgroundColor: "#dc2626",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: "#dc2626",
  },
});
