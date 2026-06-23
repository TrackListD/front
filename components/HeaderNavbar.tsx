import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../src/service/firebase";

// 1. Imagem local deve ser importada usando o require DIRETAMENTE ou aqui em cima:
const logoImg = require("../assets/images/logo.png");

export default function HeaderNavbar() {
  const router = useRouter();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Monitora o estado da autenticação com checagem rigorosa de dados
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.photoURL && user.photoURL.trim() !== "") {
        setUserPhoto(user.photoURL);
      } else {
        // Se o cache limpou ou o usuário não tem foto no Google, garante o fallback do avatar padrão
        setUserPhoto(null);
      }
    });

    return unsubscribe;
  }, []);

  // Foto de fallback bem estilosa caso ele não tenha foto de perfil configurada ou após o cache resetar
  const defaultAvatar =
    "https://vivaacidadenews.com.br/wp-content/uploads/2026/01/SAMUEL-12-media-scaled-e1769187444520-1200x650.jpg";

  return (
    <View style={styles.navbarContainer}>
      {/* Lado Esquerdo: Perfil do Usuário */}
      <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
        <Image
          source={{ uri: userPhoto ? userPhoto : defaultAvatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.dotIndicator} />
      </TouchableOpacity>

      {/* Centro: Logo corrigida */}
      <View style={styles.logoContainer}>
        <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.logoText}>
          Track<Text style={{ color: "#1DB954" }}>List</Text>D
        </Text>
      </View>

      {/* Lado Direito: Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          <View style={styles.badgeNotification} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    height: 64,
    backgroundColor: "#12161A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 0.8,
    borderBottomColor: "#1F242A",
    paddingTop: 4,
  },
  profileButton: {
    position: "relative",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2C353F",
    borderWidth: 1.5,
    borderColor: "#1DB954",
  },
  dotIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1DB954",
    borderWidth: 1.5,
    borderColor: "#12161A",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
    position: "relative",
    padding: 4,
  },
  badgeNotification: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#E0245E",
  },
});
