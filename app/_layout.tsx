import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import "react-native-reanimated";
import { auth } from "../firebaseConfig";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false); //default auth=false so logout state
  const [user, setUser] = useState<any>(null);

  // Listen for login / logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      setTimeout(() => {
        if (currentUser) {
          router.replace("/(tabs)/discover");
        } else {
          router.replace("/login");
        }
      }, 50); //time for timeOut to give the system time to figure out 
    });

    return unsubscribe;
  }, []);

  // Avoid flicker: wait until Firebase finishes checking
  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#B48CF0" />
        <Text style={{ marginTop: 10 }}>Checking login...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: false,
        }}>
        {/* Public screens */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Protected tab area */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
