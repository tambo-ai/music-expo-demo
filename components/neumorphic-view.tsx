import React from "react";
import {
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from "react-native";

interface NeumorphicViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** When true, renders an inset/pressed-in container */
  inset?: boolean;
  /** Override border radius */
  radius?: number;
  /** Shadow distance (default 6 for raised, 4 for inset) */
  distance?: number;
}

const BG = "#E0E5EC";
const INSET_BG = "#D8DDE6";
const LIGHT = "#FFFFFF";
const DARK = "#BABECC";

// Approximate a gradient with stacked semi-transparent strips
function GradientEdge({
  side,
  spread,
  color,
  steps = 4,
}: {
  side: "top" | "left" | "bottom" | "right";
  spread: number;
  color: string;
  steps?: number;
}) {
  const isHorizontal = side === "left" || side === "right";
  const stripSize = spread / steps;

  return (
    <>
      {Array.from({ length: steps }, (_, i) => {
        const opacity = (1 - i / steps) * 0.4;
        const pos = i * stripSize;
        const style: ViewStyle = {
          position: "absolute",
          backgroundColor: color,
          opacity,
          ...(side === "top" && { top: pos, left: 0, right: 0, height: stripSize }),
          ...(side === "bottom" && { bottom: pos, left: 0, right: 0, height: stripSize }),
          ...(side === "left" && { left: pos, top: 0, bottom: 0, width: stripSize }),
          ...(side === "right" && { right: pos, top: 0, bottom: 0, width: stripSize }),
        };
        return <View key={`${side}-${i}`} style={style} pointerEvents="none" />;
      })}
    </>
  );
}

export function NeumorphicView({
  style,
  children,
  inset = false,
  radius,
  distance,
}: NeumorphicViewProps) {
  if (inset) {
    const r = radius ?? 18;
    const d = distance ?? 4;
    const spread = d * 3;
    return (
      <View style={[{ borderRadius: r, overflow: "hidden", backgroundColor: INSET_BG }, style]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <GradientEdge side="top" spread={spread} color={DARK} />
          <GradientEdge side="left" spread={spread} color={DARK} />
          <GradientEdge side="bottom" spread={spread} color={LIGHT} />
          <GradientEdge side="right" spread={spread} color={LIGHT} />
        </View>
        {children}
      </View>
    );
  }

  const r = radius ?? 20;
  const d = distance ?? 6;
  const blur = d * 2;
  return (
    <View
      style={[
        {
          shadowColor: DARK,
          shadowOffset: { width: d, height: d },
          shadowOpacity: 1,
          shadowRadius: blur,
          backgroundColor: BG,
          borderRadius: r,
        },
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: r,
            shadowColor: LIGHT,
            shadowOffset: { width: -d, height: -d },
            shadowOpacity: 1,
            shadowRadius: blur,
            backgroundColor: BG,
          },
        ]}
      />
      {children}
    </View>
  );
}
