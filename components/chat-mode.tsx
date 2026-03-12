import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

function MessageItem({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <View style={styles.messageRow}>
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.aiAvatar]}>
        <Ionicons name={isUser ? "headset" : "sparkles"} size={12} color="#FFFFFF" />
      </View>
      <View style={styles.messageContent}>
        <Text style={[styles.messageLabel, isUser ? styles.userLabel : styles.aiLabel]}>
          {isUser ? "You" : "Synthia"}
        </Text>
        <Text style={styles.messageText}>{content}</Text>
      </View>
    </View>
  );
}

function GeneratingIndicator() {
  return (
    <View style={styles.messageRow}>
      <View style={[styles.avatar, styles.aiAvatar]}>
        <ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />
      </View>
      <View style={styles.messageContent}>
        <Text style={[styles.messageLabel, styles.aiLabel]}>Synthia</Text>
        <Text style={[styles.messageText, styles.generatingText]}>generating...</Text>
      </View>
    </View>
  );
}

export function ChatMode() {
  const { messages } = useTambo();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(36);
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

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const displayMessages = useMemo(() => {
    const filtered = messages
      .filter((m: TamboThreadMessage) => m.role === "user" || m.role === "assistant")
      .filter((m: TamboThreadMessage) => getTextContent(m).length > 0);

    return [...filtered].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      if (a.role === "user" && b.role === "assistant") return -1;
      if (a.role === "assistant" && b.role === "user") return 1;
      return 0;
    });
  }, [messages]);

  async function handleSend() {
    if (!value.trim()) return;
    await submit();
  }

  const isKeyboardVisible = keyboardHeight > 0;

  return (
    <View style={styles.container}>
      <NeumorphicView inset radius={22} distance={4} style={styles.cardOuter}>
        <FlatList
          data={displayMessages}
          keyExtractor={(item: TamboThreadMessage, index: number) => item.id ?? `msg-${index}`}
          renderItem={({ item }: { item: TamboThreadMessage }) => (
            <MessageItem
              role={item.role as "user" | "assistant"}
              content={getTextContent(item)}
            />
          )}
          ListFooterComponent={isPending ? <GeneratingIndicator /> : null}
          ref={listRef}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </NeumorphicView>

      <View
        style={
          isKeyboardVisible
            ? [styles.floatingInput, { bottom: keyboardHeight }]
            : [styles.inputRow, { paddingBottom: Math.max(insets.bottom, 10) }]
        }
      >
        <View style={isKeyboardVisible ? styles.floatingInputInner : styles.inputRowInner}>
          <NeumorphicView inset radius={18} distance={3} style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { height: Math.min(inputHeight, 80) }]}
              value={value}
              onChangeText={setValue}
              placeholder="Ask Synthia..."
              placeholderTextColor="#8A95A5"
              multiline
              maxLength={2000}
              editable={!isPending}
              onContentSizeChange={(e) => {
                setInputHeight(Math.max(36, e.nativeEvent.contentSize.height));
              }}
            />
          </NeumorphicView>
          <Pressable
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleMicPress}
            disabled={isPending}
          >
            <Ionicons name={isListening ? "stop" : "mic"} size={18} color="#FFFFFF" />
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
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardOuter: {
    flex: 1,
    marginHorizontal: 20,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatar: {
    backgroundColor: "#6C63FF",
  },
  userAvatar: {
    backgroundColor: "#8A95A5",
  },
  messageContent: {
    flex: 1,
    gap: 2,
  },
  messageLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  aiLabel: {
    color: "#6C63FF",
  },
  userLabel: {
    color: "#8A95A5",
  },
  messageText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#4A5568",
  },
  generatingText: {
    color: "#8A95A5",
    fontStyle: "italic",
  },
  loadingSpinner: {
    transform: [{ scale: 0.6 }],
  },
  inputRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 60,
  },
  inputRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 13,
    color: "#3A4150",
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButtonActive: {
    backgroundColor: "#dc2626",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#B0B5C0",
  },
  floatingInput: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#E0E5EC",
    borderTopWidth: 1,
    borderTopColor: "#D0D5DC",
    paddingTop: 8,
    paddingBottom: 8,
  },
  floatingInputInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
});
