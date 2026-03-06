import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useTamboThreadInput } from "@tambo-ai/react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export function InputBar() {
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const [isListening, setIsListening] = useState(false);
  const voiceSessionRef = useRef(false);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    setValue(transcript);
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

    const { granted } =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) return;

    voiceSessionRef.current = true;
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
    });
    setIsListening(true);
  }, [isListening]);

  async function handleSend() {
    if (!value.trim()) return;
    await submit();
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <BottomSheetTextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="Describe a beat..."
          placeholderTextColor="#666"
          multiline
          maxLength={2000}
          editable={!isPending}
        />
        <Pressable
          onPress={handleMicPress}
          disabled={isPending}
          style={[
            styles.micButton,
            isListening && styles.micButtonActive,
            isPending && styles.sendButtonDisabled,
          ]}
        >
          <Text style={styles.micIcon}>{isListening ? "⏹" : "🎤"}</Text>
        </Pressable>
        <Pressable
          onPress={handleSend}
          disabled={isPending || !value.trim()}
          style={[
            styles.sendButton,
            (isPending || !value.trim()) && styles.sendButtonDisabled,
          ]}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendIcon}>↑</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#fff",
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: "#dc2626",
  },
  micIcon: {
    fontSize: 18,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  sendIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
