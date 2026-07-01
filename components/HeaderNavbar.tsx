import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { getMyProfile } from "../src/service/userApi";
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

const genericProfilePic =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function HeaderNavbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // 1. Se não tiver usuário logado (Implementação do outro dev + nossa)
      if (!user) {
        setIsLoggedIn(false);
        setUserPhoto(null);
        setIsAdmin(false);
        return; // Para a execução por aqui
      }

      // 2. Se tiver usuário logado
      setIsLoggedIn(true);
      try {
        // Faz a chamada na API UMA única vez
        const profile = await getMyProfile();

        // Código do outro dev: pega a foto vinda do backend
        setUserPhoto(profile.profilePic || null);

        // O NOSSO código: valida a role do perfil
        setIsAdmin(profile.role === "ADMIN");

      } catch (err) {
        console.error("Erro ao buscar perfil no Header:", err);
        setUserPhoto(null);
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, []);

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
        {isLoggedIn ? (
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
          >
            <Image
              source={{ uri: userPhoto ?? genericProfilePic }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.dotIndicator} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.7}
            onPress={() => router.push("/login" as Href)}
          >
            <Ionicons name="log-in-outline" size={16} color="#1DB954" />
            <Text style={styles.loginButtonText}>Fazer login</Text>
          </TouchableOpacity>
        )}

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

            {isAdmin && (
              <>
                <View style={styles.separator} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/admin/reports/pending" as Href);
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color="#1DB954" />
                  <Text style={styles.menuText}>Painel Admin</Text>
                </TouchableOpacity>
              </>
            )}

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

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F24",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2C353F",
  },

  loginButtonText: {
    color: "#1DB954",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
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
