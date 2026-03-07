import { useState } from "react";
import { View, Text, Pressable, Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransportBar } from "../components/transport-bar";
import { SequencerGrid } from "../components/sequencer-grid";
import { ChatSection } from "../components/chat-section";
import { InspectModal } from "../components/inspect-modal";
import { NeumorphicView } from "../components/neumorphic-view";
import { useStrudel } from "../lib/providers/strudel-provider";

function HeaderBar({ onInspect }: { onInspect: () => void }) {
  return (
    <NeumorphicView style={styles.header} radius={20} distance={6}>
      <View style={styles.headerInner}>
        <View style={styles.headerLeft}>
          <NeumorphicView radius={12} distance={3} style={styles.logoOuter}>
            <View style={styles.logoIcon}>
              <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
            </View>
          </NeumorphicView>
          <View style={styles.titleGroup}>
            <Text style={styles.appName}>Synthia</Text>
            <Text style={styles.appSubtitle}>AI Sequencer</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <NeumorphicView inset radius={10} distance={3}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>AI On</Text>
            </View>
          </NeumorphicView>
          <NeumorphicView radius={12} distance={4} style={styles.chatButtonOuter}>
            <Pressable style={styles.chatButton} onPress={onInspect}>
              <Ionicons name="code-slash" size={16} color="#FFFFFF" />
            </Pressable>
          </NeumorphicView>
        </View>
      </View>
    </NeumorphicView>
  );
}

export default function HomeScreen() {
  const [showInspect, setShowInspect] = useState(false);
  const { state } = useStrudel();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Pressable style={styles.topContent} onPress={Keyboard.dismiss}>
          <HeaderBar onInspect={() => setShowInspect(true)} />
          <SequencerGrid />
          <TransportBar />
        </Pressable>
      </SafeAreaView>
      <View style={styles.chatWrapper}>
        <ChatSection />
      </View>
      <InspectModal
        visible={showInspect}
        code={state.code}
        onClose={() => setShowInspect(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0E5EC",
  },
  safe: {
    flexShrink: 1,
  },
  topContent: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  chatWrapper: {
    flex: 1,
    paddingTop: 20,
  },
  header: {},
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoOuter: {
    backgroundColor: "#6C63FF",
  },
  logoIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 12,
  },
  titleGroup: {
    gap: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3A4150",
    letterSpacing: -0.34,
    fontFamily: "GeistMono_700Bold",
  },
  appSubtitle: {
    fontSize: 11,
    color: "#8A95A5",
    fontFamily: "GeistMono_400Regular",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#48BB78",
  },
  statusText: {
    fontSize: 9,
    color: "#4A5568",
    fontFamily: "GeistMono_400Regular",
  },
  chatButtonOuter: {
    backgroundColor: "#6C63FF",
  },
  chatButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 12,
  },
});
