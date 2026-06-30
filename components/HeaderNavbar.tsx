import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../src/service/firebase";

const logoImg = require("../assets/images/logo.png");

export default function HeaderNavbar() {
  const router = useRouter();

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.photoURL && user.photoURL.trim() !== "") {
        setUserPhoto(user.photoURL);
      } else {
        setUserPhoto(null);
      }
    });

    return unsubscribe;
  }, []);

  const defaultAvatar =
    "https://vivaacidadenews.com.br/wp-content/uploads/2026/01/SAMUEL-12-media-scaled-e1769187444520-1200x650.jpg";

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setMenuVisible(false);
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <View style={styles.navbarContainer}>
        {/* Perfil */}
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => setMenuVisible(true)}
        >
          <Image
            source={{ uri: userPhoto ?? defaultAvatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.dotIndicator} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={logoImg}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>
            Track<Text style={{ color: "#1DB954" }}>List</Text>D
          </Text>
        </View>

        {/* Ações */}
        <View style={styles.actionsContainer}>
          {/* NOVO: Botão Criar Lista */}
          <TouchableOpacity
            style={styles.createListButton}
            onPress={() => router.push("/media-lists/create" as Href)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color="#1DB954" />
            <Text style={styles.createListText}>Criar Lista</Text>
          </TouchableOpacity>

          {/* Botão de busca (Lupa) */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/search" as Href)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/faq")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MENU */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/profile/me" as Href);
              }}
            >
              <Ionicons name="person-outline" size={20} color="#FFFFFF" />
              <Text style={styles.menuText}>Meu Perfil</Text>
            </TouchableOpacity>

            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/faq");
              }}
            >
              <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.menuText}>FAQ / Ajuda</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#E0245E" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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

  // Estilos do novo botão "Criar Lista"
  createListButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F24",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2C353F",
  },

  createListText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  iconButton: {
    marginLeft: 14,
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

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  menuContainer: {
    marginTop: 70,
    marginLeft: 12,
    width: 200,
    backgroundColor: "#1A1F24",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2C353F",
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  menuText: {
    color: "#FFFFFF",
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },

  logoutText: {
    color: "#E0245E",
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },

  separator: {
    height: 1,
    backgroundColor: "#2C353F",
  },
});
