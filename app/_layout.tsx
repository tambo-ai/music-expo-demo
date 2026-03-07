import "../lib/polyfills";
import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamboProvider } from "@tambo-ai/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { useFonts } from "@expo-google-fonts/geist-mono/useFonts";
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono/400Regular";
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { GeistMono_700Bold } from "@expo-google-fonts/geist-mono/700Bold";
import { StrudelProvider } from "../lib/providers/strudel-provider";
import { tools } from "../lib/tambo/tools";
import { components } from "../lib/tambo/components";
import { initialMessages } from "../lib/tambo/system-prompt";

const TAMBO_API_KEY = process.env.EXPO_PUBLIC_TAMBO_API_KEY ?? "";
const USER_KEY_STORAGE = "music-companion-user-key";

export default function RootLayout() {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_700Bold,
  });

  useEffect(() => {
    async function getOrCreateUserKey() {
      let key = await AsyncStorage.getItem(USER_KEY_STORAGE);
      if (!key) {
        key = randomUUID();
        await AsyncStorage.setItem(USER_KEY_STORAGE, key);
      }
      setUserKey(key);
    }
    void getOrCreateUserKey();
  }, []);

  if (!userKey || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamboProvider
        apiKey={TAMBO_API_KEY}
        userKey={userKey}
        tools={tools}
        components={components}
        initialMessages={initialMessages}
      >
        <StrudelProvider>
          <Slot />
        </StrudelProvider>
      </TamboProvider>
    </GestureHandlerRootView>
  );
}
