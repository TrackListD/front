import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { initAuthListener } from "../src/auth/authState";

initAuthListener();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="profile" />
        <Stack.Screen 
          name="reportModal" 
          options={{ 
            presentation: "modal", 
            headerShown: true, 
            title: "Denúncia",
            headerStyle: { 
              backgroundColor: colorScheme === "dark" ? "#121212" : "#fff" 
            },
            headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
