import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet";
import { useTambo } from "@tambo-ai/react";
import type { TamboThreadMessage } from "@tambo-ai/react";
import { ChatMessage } from "./chat-message";
import { InputBar } from "./input-bar";

function getTextContent(message: TamboThreadMessage): string {
  if (!Array.isArray(message.content)) return "";
  return message.content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export function ChatDrawer() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [80, "60%"], []);

  const { messages } = useTambo();

  // Show messages newest-first (inverted list), only user/assistant with text
  const displayMessages = useMemo(
    () =>
      messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .filter((m) => getTextContent(m).length > 0)
        .reverse(),
    [messages],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <InputBar />
      </BottomSheetFooter>
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      footerComponent={renderFooter}
    >
      <BottomSheetFlatList
        data={displayMessages}
        keyExtractor={(item) => item.id ?? String(Math.random())}
        renderItem={({ item }) => (
          <ChatMessage
            role={item.role as "user" | "assistant"}
            content={getTextContent(item)}
          />
        )}
        inverted
        contentContainerStyle={styles.listContent}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#16162a",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 36,
  },
  listContent: {
    paddingBottom: 80,
    paddingTop: 8,
  },
});
