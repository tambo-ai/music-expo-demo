import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";

interface InspectModalProps {
  visible: boolean;
  code: string;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function InspectModal({ visible, code, onClose }: InspectModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isVisible = useRef(false);

  useEffect(() => {
    if (visible) {
      isVisible.current = true;
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible.current) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isVisible.current = false;
      });
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible && !isVisible.current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[styles.panelWrapper, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Strudel Pattern</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.codeContainer}>
            <Text style={styles.code}>{code || "No pattern loaded"}</Text>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  panelWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    backgroundColor: "#E0E5EC",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#3A4150",
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "600",
  },
  codeContainer: {
    backgroundColor: "#D5DAE2",
    borderRadius: 12,
    padding: 12,
  },
  code: {
    color: "#6C63FF",
    fontSize: 13,
    fontFamily: "JetBrains Mono",
    lineHeight: 20,
  },
});
