import { AntDesign } from "@expo/vector-icons"; // Importando os ícones do Expo
import * as Google from "expo-auth-session/providers/google";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import React, { useEffect } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../src/service/firebase";

WebBrowser.maybeCompleteAuthSession();
const logoImg = require("../assets/images/logo_no_bg.png");
export default function Login() {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    responseType: "id_token",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/feed/me");
      }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const handleLogin = async () => {
      if (response?.type === "success") {
        const idToken =
          response.params?.id_token ?? response.authentication?.idToken;

        if (!idToken) {
          console.error(
            "ID token não encontrado na resposta do Google:",
            response,
          );
          return;
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        console.log("Usuário logado:", auth.currentUser);
        router.replace("/feed/me");
      } else if (response?.type === "error") {
        console.error("Erro na autenticação com Google:", response.error);
      }
    };

    handleLogin();
  }, [response, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1716" />

      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Image source={logoImg} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>TrackListD</Text>
        <Text style={styles.subtitle}>A sua rede social para música</Text>
      </View>
      {/* --- ÁREA DOS BOTÕES --- */}
      <View style={styles.buttonContainer}>
        {/* Card Informativo Superior */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <AntDesign name="message1" size={18} color="#52b788" />
          </View>
          <Text style={styles.infoText}>
            Avalie seus álbuns e músicas favoritos.
          </Text>
        </View>

        {/* Botão Entrar com Google */}
        <TouchableOpacity
          style={[styles.googleButton, !request && { opacity: 0.6 }]}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <AntDesign
            name="google"
            size={20}
            color="#EA4335"
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Entrar com Google</Text>
        </TouchableOpacity>

        {/* Botão Explorar sem conta */}
        <Link href="/feed/global" asChild>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explorar sem conta</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// --- ESTILIZAÇÃO (CSS-in-JS) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1d1a", // Tom verde escuro de fundo
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#132924",
    borderWidth: 3,
    borderColor: "#00f5d4", // Borda neon circular do gradiente
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#b3c6c2",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 250,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 16, // Cria o espaçamento vertical entre os botões
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#132521",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a322d",
    marginBottom: 8,
  },
  infoIconBox: {
    backgroundColor: "#193731",
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  infoText: {
    color: "#7e9590",
    fontSize: 14,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  exploreButton: {
    backgroundColor: "#172d29",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#203e39",
  },
  exploreButtonText: {
    color: "#9cb1ad",
    fontSize: 16,
    fontWeight: "600",
  },
});
