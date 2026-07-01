import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface BackButtonProps {
  fallbackHref?: Href;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({
  fallbackHref = "/feed/global" as Href,
  color = "#ffffff",
  style,
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={handlePress}>
      <Ionicons name="chevron-back" size={28} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 16,
    marginBottom: 8,
    zIndex: 10,
    alignSelf: "flex-start",
  },
});
