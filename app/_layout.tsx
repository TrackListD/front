// Layout raiz — define a pilha de navegação principal do app e o tema global.

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initAuthListener } from "../src/auth/authState";

initAuthListener();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Telas base */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />

        {/* Rotas de Avaliações */}
        <Stack.Screen name="ratings/create" />
        <Stack.Screen name="ratings/[id]" />
        <Stack.Screen name="ratings/user/[userId]" />

        {/* Telas principais */}
        <Stack.Screen name="feed" />
        <Stack.Screen name="profile" />

        {/* Modal de denúncia */}
        <Stack.Screen
          name="reportModal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Denúncia",
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
            },
            headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          }}
        />
        <Stack.Screen name="faq" options={{ title: "FAQ" }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}