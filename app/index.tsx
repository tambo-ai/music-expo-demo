import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransportBar } from "../components/transport-bar";
import { SequencerGrid } from "../components/sequencer-grid";
import { ChatDrawer } from "../components/chat-drawer";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TransportBar />
        <SequencerGrid />
      </SafeAreaView>
      <ChatDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  safe: {
    flex: 1,
  },
});
