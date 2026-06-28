import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E11" />

      {/* Glow decorativo de fundo */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.content}>
        {/* Logo / marca */}
        <View style={styles.brandRow}>
          <Ionicons name="disc-outline" size={28} color="#34D399" />
          <Text style={styles.brandText}>
            TrackList<Text style={styles.brandAccent}>D</Text>
          </Text>
        </View>

        {/* Bloco central */}
        <View style={styles.hero}>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={18}
                color="#F5B544"
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>

          <Text style={styles.title}>
            Avalie. Compartilhe.{"\n"}
            <Text style={styles.titleAccent}>Descubra música.</Text>
          </Text>

          <Text style={styles.subtitle}>
            O lugar onde suas faixas favoritas ganham nota, opinião e uma
            comunidade que entende de música tanto quanto você.
          </Text>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewCover} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTrack}>Bohemian Rhapsody</Text>
            <Text style={styles.previewArtist}>Queen</Text>
            <View style={styles.previewStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={12} color="#F5B544" />
              ))}
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.ctaText}>Aprofunde na música</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#0B0E11"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          <Text style={styles.ctaFootnote}>
            Entre com sua conta Google para começar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E11",
  },
  glowTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#34D39922",
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#34D39915",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  brandAccent: {
    color: "#34D399",
  },
  hero: {
    alignItems: "center",
    marginTop: 36,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 38,
  },
  titleAccent: {
    color: "#34D399",
  },
  subtitle: {
    fontSize: 15,
    color: "#8A8A8F",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 16,
    maxWidth: width * 0.85,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151A1F",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#1F242A",
    padding: 14,
    marginTop: 8,
  },
  previewCover: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#34D39933",
  },
  previewInfo: {
    marginLeft: 14,
    flex: 1,
  },
  previewTrack: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  previewArtist: {
    color: "#8A8A8F",
    fontSize: 13,
    marginTop: 2,
  },
  previewStars: {
    flexDirection: "row",
    marginTop: 6,
  },
  ctaWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34D399",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    shadowColor: "#34D399",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaText: {
    color: "#0B0E11",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaFootnote: {
    color: "#5C6066",
    fontSize: 12,
    marginTop: 14,
  },
});
