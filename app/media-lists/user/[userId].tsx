// Tela: Perfil e Listas do Usuário — Consome /api/users/me e /api/mediaList/user/{userId}
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, router, Href } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { UserPerfilResponseDTO } from "@/src/types/user";
import { MediaListResponseDto, MediaListOwnerResponseDto } from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type TabOption = "Todas" | "Favoritas";

export default function UserProfileListsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // States
  const [profile, setProfile] = useState<UserPerfilResponseDTO | null>(null);
  const [mediaLists, setMediaLists] = useState<(MediaListResponseDto | MediaListOwnerResponseDto)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>("Todas");

  // Theme configuration
  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    avatarBg: isDark ? "#334155" : "#E2E8F0",
    pillActiveBg: isDark ? "#38BDF8" : "#0A7EA4",
    pillInactiveBg: isDark ? "#1D1F22" : "#E4E7EB",
    cardListBg: "#151719", // Fundo escuro cobrindo o card de lista
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let targetIdNum: number;
      let userProfile: UserPerfilResponseDTO;

      if (userId === "me") {
        const profileRes = await apiClient.get<UserPerfilResponseDTO>("/api/users/me");
        userProfile = profileRes.data;
        targetIdNum = profileRes.data.id;
      } else {
        const profileRes = await apiClient.get<UserPerfilResponseDTO>(`/api/users/${userId}`);
        userProfile = profileRes.data;
        targetIdNum = Number(userId);
      }

      setProfile(userProfile);

      const listsRes = await apiClient.get<(MediaListResponseDto | MediaListOwnerResponseDto)[]>(
        `/api/mediaList/user/${targetIdNum}`
      );
      setMediaLists(listsRes.data);
    } catch (err) {
      setError(err as NormalizedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const getListData = (list: MediaListResponseDto | MediaListOwnerResponseDto): MediaListResponseDto => {
    return "publicData" in list ? list.publicData : list;
  };

  const getFilteredLists = () => {
    if (activeTab === "Favoritas") {
      return mediaLists.filter((list) => {
        const data = getListData(list);
        return data.isFavorite;
      });
    }
    return mediaLists;
  };

  const renderProfileHeader = () => {
    if (!profile) return null;
    return (
      <View style={[styles.profileCard, { backgroundColor: themeStyles.cardBackground, borderColor: themeStyles.border }]}>
        <View style={styles.profileMain}>
          <View style={[styles.avatar, { backgroundColor: themeStyles.avatarBg }]}>
            <Text style={[styles.avatarText, { color: themeStyles.textColor }]}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: themeStyles.textColor }]}>
              {profile.name}
            </Text>
            {/* DEBITO TECNICO: Backend não retorna quantidade de seguidores e total de listas. Mockado conforme protótipo. */}
            <Text style={[styles.profileStats, { color: themeStyles.subText }]}>
              8 listas • 342 seguidores
            </Text>
          </View>

          <Pressable
            onPress={() => {
              // FUTURA INTEGRAÇÃO: Navegar para a tela de edição de perfil.
              Alert.alert("Editar Perfil", "Navegação para edição de perfil (FUTURO).");
            }}
            style={({ pressed }) => [
              styles.editProfileButton,
              { borderColor: themeStyles.border },
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="edit" size={20} color={themeStyles.textColor} />
          </Pressable>
        </View>

        {profile.bio ? (
          <Text style={[styles.bioText, { color: themeStyles.subText }]}>
            {profile.bio}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(["Todas", "Favoritas"] as TabOption[]).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabPill,
              {
                backgroundColor: isActive ? themeStyles.pillActiveBg : themeStyles.pillInactiveBg,
              },
            ]}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: isActive ? "#FFFFFF" : themeStyles.textColor },
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderMediaListCard = ({ item }: { item: MediaListResponseDto | MediaListOwnerResponseDto }) => {
    const listId = 'publicData' in item ? item.publicData.id : item.id;
    const data = getListData(item);
    const mediaCount = data.medias ? data.medias.length : 0;
    const mediaTypeLabel = data.typeOfList === "ALBUM"
      ? mediaCount === 1 ? "álbum" : "álbuns"
      : mediaCount === 1 ? "música" : "músicas";

    return (
      <Pressable
        onPress={() => router.push(`/media-lists/${listId}` as Href)}
        style={({ pressed }) => [
          styles.mediaListCard,
          { backgroundColor: themeStyles.cardListBg },
          pressed && styles.pressed,
        ]}
      >
        {/* DEBITO TECNICO: Capas de mídias ausentes no backend. Usando fundo escuro. */}
        
        {/* Botão de 3 pontinhos */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert("Opções da Lista", `Configurações adicionais para a lista "${data.listName}" (FUTURO).`);
          }}
          style={styles.moreButton}
        >
          <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {data.listName}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.authorRow}>
              <MaterialIcons name="account-circle" size={16} color="#FFFFFF" style={styles.authorIcon} />
              <Text style={styles.authorText}>
                Por {data.authorName || "Usuário"}
              </Text>
            </View>
            <Text style={styles.countText}>
              {mediaCount} {mediaTypeLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="library-music" size={48} color={themeStyles.subText} style={styles.emptyIcon} />
      <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
        Nenhuma lista de mídias encontrada nesta aba.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "Perfil",
          headerStyle: { backgroundColor: themeStyles.cardBackground },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeStyles.tintColor} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <View style={[styles.errorCard, { backgroundColor: themeStyles.errorBg, borderColor: themeStyles.errorText }]}>
            <MaterialIcons name="error-outline" size={40} color={themeStyles.errorText} />
            <Text style={[styles.errorTitle, { color: themeStyles.errorText }]}>
              Erro de Conexão
            </Text>
            <Text style={[styles.errorBody, { color: themeStyles.errorText }]}>
              {error.message || "Erro ao carregar o perfil do usuário."}
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: themeStyles.tintColor }]}
              onPress={fetchData}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={getFilteredLists()}
          keyExtractor={(item, index) => {
            const data = getListData(item);
            return String(data.id ?? index);
          }}
          renderItem={renderMediaListCard}
          ListHeaderComponent={
            <>
              {renderProfileHeader()}
              {renderTabs()}
            </>
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
  },
  profileStats: {
    fontSize: 13,
    fontWeight: "500",
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: "700",
  },
  mediaListCard: {
    height: 160,
    borderRadius: 16,
    padding: 20,
    justifyContent: "flex-end",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  moreButton: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 6,
    zIndex: 1,
  },
  cardContent: {
    gap: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorIcon: {
    opacity: 0.8,
  },
  authorText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.9,
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.85,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    maxWidth: 340,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  errorBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
