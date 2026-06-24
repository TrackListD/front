// Tela: Detalhe de Lista de Mídias — exibe a playlist de músicas ou álbuns com distinção de visualização Dono vs. Público
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, router, Href } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { MediaListResponseDto, MediaListOwnerResponseDto, Privacy } from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function MediaListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [mediaList, setMediaList] = useState<MediaListResponseDto | MediaListOwnerResponseDto | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<MediaListResponseDto | MediaListOwnerResponseDto>("/api/mediaList/" + id);
      setMediaList(response.data);
    } catch (err) {
      setError(err as NormalizedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Color theme configurations
  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    badgeBg: isDark ? "#2A2D31" : "#F1F3F5",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
    avatarBg: isDark ? "#334155" : "#E2E8F0",
    starColor: "#FFC107",
  };

  const translatePrivacy = (privacy: Privacy): { label: string; icon: "public" | "people" | "lock" } => {
    switch (privacy) {
      case "PUBLIC":
        return { label: "Público", icon: "public" };
      case "JUST_FOLLOWERS":
        return { label: "Seguidores", icon: "people" };
      case "PRIVATE":
        return { label: "Privado", icon: "lock" };
      default:
        return { label: privacy, icon: "public" };
    }
  };

  const handleToggleFavorite = async () => {
    if (!mediaList || !id) return;
    const isFav = publicData.isFavorite;

    try {
      if (isFav) {
        await apiClient.delete(`/api/mediaList/${id}/favorite`);
      } else {
        await apiClient.post(`/api/mediaList/${id}/favorite`);
      }

      setMediaList((prev) => {
        if (!prev) return null;
        if ("publicData" in prev) {
          return {
            ...prev,
            publicData: {
              ...prev.publicData,
              isFavorite: !isFav,
            },
          };
        } else {
          return {
            ...prev,
            isFavorite: !isFav,
          };
        }
      });
    } catch (err) {
      const normalized = err as NormalizedError;
      Alert.alert("Erro", normalized.message || "Não foi possível atualizar o favorito.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
        <Stack.Screen options={{ title: "Carregando..." }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeStyles.tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !mediaList) {
    const is404 = error?.status === 404;
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
        <Stack.Screen options={{ title: "Erro" }} />
        <View style={styles.centerContainer}>
          <View style={[styles.errorCard, { backgroundColor: themeStyles.errorBg, borderColor: themeStyles.errorText }]}>
            <MaterialIcons name="error-outline" size={44} color={themeStyles.errorText} />
            <Text style={[styles.errorTitle, { color: themeStyles.errorText }]}>
              {is404 ? "Lista Não Encontrada" : "Erro de Conexão"}
            </Text>
            <Text style={[styles.errorBody, { color: themeStyles.errorText }]}>
              {error?.message || "Ocorreu um erro ao carregar os detalhes da lista."}
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: themeStyles.tintColor }]}
              onPress={fetchDetail}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Type Discrimination logic for Owner vs Public responses
  const isOwner = "publicData" in mediaList;
  const publicData = isOwner
    ? (mediaList as MediaListOwnerResponseDto).publicData
    : (mediaList as MediaListResponseDto);
  const privacyVal = isOwner ? (mediaList as MediaListOwnerResponseDto).whoCanSee : "PUBLIC";

  // FUTURA INTEGRAÇÃO: O backend retorna apenas os IDs do Spotify (mediaIds).
  // Substituir pela busca rica de metadados de cada mídia (capa, título, artista)
  // via integração Spotify API ou banco local.
  const displayMedias = publicData.mediaIds && publicData.mediaIds.length > 0
    ? publicData.mediaIds.map((spotifyId, index) => ({
        id: spotifyId,
        title: `Mídia ${index + 1}`,
        subtitle: `ID Spotify: ${spotifyId}`,
      }))
    : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "Detalhe da Lista",
          headerStyle: { backgroundColor: themeStyles.cardBackground },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner/Cabeçalho da Lista */}
        <View style={[styles.card, { backgroundColor: themeStyles.cardBackground }]}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <View style={[styles.typeBadge, { backgroundColor: themeStyles.badgeBg }]}>
                <MaterialIcons
                  name={publicData.typeOfList === "ALBUM" ? "album" : "music-note"}
                  size={16}
                  color={themeStyles.tintColor}
                />
                <Text style={[styles.typeText, { color: themeStyles.tintColor }]}>
                  {publicData.typeOfList === "ALBUM" ? "Álbum" : "Música"}
                </Text>
              </View>
              <Text style={[styles.listName, { color: themeStyles.textColor }]}>
                {publicData.listName}
              </Text>
            </View>

            {/* Favoritar */}
            <Pressable onPress={handleToggleFavorite} style={styles.favButton}>
              <MaterialIcons
                name={publicData.isFavorite ? "star" : "star-border"}
                size={28}
                color={publicData.isFavorite ? themeStyles.starColor : themeStyles.subText}
              />
            </Pressable>
          </View>

          {/* Autor */}
          <View style={styles.authorSection}>
            <View style={[styles.avatar, { backgroundColor: themeStyles.avatarBg }]}>
              <Text style={[styles.avatarText, { color: themeStyles.textColor }]}>
                {publicData.authorName ? publicData.authorName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View>
              <Text style={[styles.authorLabel, { color: themeStyles.subText }]}>Criada por</Text>
              <Text style={[styles.authorName, { color: themeStyles.textColor }]}>
                {publicData.authorName || `Usuário #${publicData.idAuthor}`}
              </Text>
            </View>
          </View>

          {/* Se for dono: Exibe a privacidade */}
          {isOwner && (
            <View style={styles.privacySection}>
              <Text style={[styles.sectionLabel, { color: themeStyles.subText }]}>Privacidade da Lista</Text>
              <View style={[styles.privacyBadge, { backgroundColor: themeStyles.badgeBg }]}>
                <MaterialIcons
                  name={translatePrivacy(privacyVal).icon}
                  size={16}
                  color={themeStyles.textColor}
                />
                <Text style={[styles.privacyText, { color: themeStyles.textColor }]}>
                  {translatePrivacy(privacyVal).label}
                </Text>
              </View>
            </View>
          )}

          {/* FUTURA INTEGRAÇÃO: Exibir a descrição da lista quando implementada no backend. */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionLabel, { color: themeStyles.subText }]}>Descrição</Text>
            <Text style={[styles.descriptionText, { color: themeStyles.textColor }]}>
              // FUTURA INTEGRAÇÃO: Campo 'description' não implementado na API.
              {"\n"}Esta lista agrupa mídias selecionadas pelo autor.
            </Text>
          </View>

          {/* FUTURA INTEGRAÇÃO: Exibir tags da lista quando suportado. */}
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionLabel, { color: themeStyles.subText }]}>Tags</Text>
            <View style={styles.tagRow}>
              <View style={[styles.tag, { backgroundColor: themeStyles.badgeBg }]}>
                <Text style={[styles.tagText, { color: themeStyles.subText }]}>
                  #playlist
                </Text>
              </View>
              <View style={[styles.tag, { backgroundColor: themeStyles.badgeBg }]}>
                <Text style={[styles.tagText, { color: themeStyles.subText }]}>
                  #{publicData.typeOfList.toLowerCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lista de Mídias */}
        <View style={[styles.card, { backgroundColor: themeStyles.cardBackground, marginTop: 16 }]}>
          <View style={styles.mediaHeaderRow}>
            <Text style={[styles.sectionTitle, { color: themeStyles.textColor }]}>
              Mídias da Lista ({publicData.mediaIds.length})
            </Text>
          </View>

          {displayMedias.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="library-music" size={40} color={themeStyles.subText} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
                Nenhuma mídia adicionada a esta lista.
              </Text>
            </View>
          ) : (
            <View style={styles.mediaList}>
              {displayMedias.map((media) => (
                <View key={media.id} style={[styles.mediaCard, { borderColor: themeStyles.border }]}>
                  <View style={[styles.mediaIconBg, { backgroundColor: themeStyles.badgeBg }]}>
                    <MaterialIcons
                      name={publicData.typeOfList === "ALBUM" ? "album" : "music-note"}
                      size={20}
                      color={themeStyles.tintColor}
                    />
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text style={[styles.mediaTitle, { color: themeStyles.textColor }]}>
                      {media.title}
                    </Text>
                    <Text style={[styles.mediaSubtitle, { color: themeStyles.subText }]}>
                      {media.subtitle}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  listName: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  favButton: {
    padding: 4,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  authorLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  privacySection: {
    marginTop: 18,
  },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  privacyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionSection: {
    marginTop: 18,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  tagsSection: {
    marginTop: 18,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  mediaHeaderRow: {
    marginBottom: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  mediaList: {
    gap: 12,
  },
  mediaCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  mediaIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaInfo: {
    flex: 1,
    gap: 2,
  },
  mediaTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  mediaSubtitle: {
    fontSize: 12,
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
