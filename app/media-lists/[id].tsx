// Tela: Detalhe da Lista de Mídias — exibe a lista condicionalmente (Visão do Dono vs Visão Pública) via GET /api/mediaList/{id}
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
import { MediaListResponseDto, MediaListOwnerResponseDto } from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import EditMediaListNameModal from "@/src/components/EditMediaListNameModal";
import EditMediaListPrivacyModal from "@/src/components/EditMediaListPrivacyModal";
import AddMediaModal from "@/src/components/AddMediaModal";

export default function MediaListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [mediaList, setMediaList] = useState<MediaListResponseDto | MediaListOwnerResponseDto | null>(null);

  // Modals visibility states
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [isAddMediaModalVisible, setAddMediaModalVisible] = useState(false);

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
    starColor: "#FFC107",
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
        const isPrevOwner = "publicData" in prev;
        if (isPrevOwner) {
          const ownerPrev = prev as MediaListOwnerResponseDto;
          return {
            ...ownerPrev,
            publicData: {
              ...ownerPrev.publicData,
              isFavorite: !isFav,
            },
          };
        } else {
          const publicPrev = prev as MediaListResponseDto;
          return {
            ...publicPrev,
            isFavorite: !isFav,
          };
        }
      });
    } catch (err) {
      const normalized = err as NormalizedError;
      Alert.alert("Erro", normalized.message || "Não foi possível atualizar o favorito.");
    }
  };

  const handleDeleteList = () => {
    Alert.alert(
      "Excluir Lista",
      "Tem certeza que deseja excluir esta lista permanentemente? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/api/mediaList/${id}`);
              router.replace("/media-lists/user/me" as Href);
            } catch (err) {
              const normalized = err as NormalizedError;
              Alert.alert("Erro", normalized.message || "Não foi possível excluir a lista.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMedia = async (mediaId: string) => {
    if (!id) return;
    try {
      const response = await apiClient.delete<MediaListOwnerResponseDto>(
        `/api/mediaList/${id}/medias/${mediaId}`
      );
      setMediaList(response.data);
    } catch (err) {
      const normalized = err as NormalizedError;
      Alert.alert("Erro", normalized.message || "Não foi possível remover a mídia da lista.");
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
              {is404 ? "Lista não encontrada" : "Erro de Conexão"}
            </Text>
            <Text style={[styles.errorBody, { color: themeStyles.errorText }]}>
              {is404 ? "A lista de mídias solicitada não pôde ser encontrada no servidor." : (error?.message || "Ocorreu um erro ao carregar os detalhes da lista.")}
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

  // Type Guard
  const isOwner = mediaList && "publicData" in mediaList;
  const publicData = isOwner
    ? (mediaList as MediaListOwnerResponseDto).publicData
    : (mediaList as MediaListResponseDto);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: themeStyles.cardBackground },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
          headerRight: () =>
            isOwner ? (
              <Pressable
                onPress={() =>
                  Alert.alert("Opções da Lista", "O que deseja fazer?", [
                    { text: "Editar Nome", onPress: () => setNameModalVisible(true) },
                    { text: "Editar Privacidade", onPress: () => setPrivacyModalVisible(true) },
                    { text: "Excluir Lista", style: "destructive", onPress: handleDeleteList },
                    { text: "Cancelar", style: "cancel" },
                  ])
                }
                style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
              >
                <MaterialIcons name="more-vert" size={24} color={themeStyles.textColor} />
              </Pressable>
            ) : null,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Capa da Lista */}
        {/* DEBITO TECNICO: Backend não retorna capa da lista. Usando placeholder. */}
        <View style={[styles.coverContainer, { backgroundColor: isDark ? "#2A2D31" : "#E2E8F0" }]}>
          <MaterialIcons
            name={publicData.typeOfList === "ALBUM" ? "album" : "library-music"}
            size={64}
            color={themeStyles.subText}
          />
        </View>

        {/* Título e Autor da Lista */}
        <View style={styles.metaContainer}>
          <Text style={[styles.listName, { color: themeStyles.textColor }]}>
            {publicData.listName}
          </Text>

          <View style={styles.authorRow}>
            <MaterialIcons name="account-circle" size={20} color={themeStyles.subText} />
            <Text style={[styles.authorName, { color: themeStyles.textColor }]}>
              {publicData.authorName || `Usuário #${publicData.idAuthor}`}
            </Text>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsRow}>
            {/* DEBITO TECNICO: Duração total ausente */}
            <Text style={[styles.statsText, { color: themeStyles.subText }]}>
              2h 14min
            </Text>
            <Text style={[styles.statsDot, { color: themeStyles.subText }]}>•</Text>
            <Text style={[styles.statsText, { color: themeStyles.subText }]}>
              {publicData.mediaIds ? publicData.mediaIds.length : 0}{" "}
              {publicData.typeOfList === "ALBUM"
                ? publicData.mediaIds.length === 1 ? "álbum" : "álbuns"
                : publicData.mediaIds.length === 1 ? "música" : "músicas"}
            </Text>
          </View>
        </View>

        {/* Barra de Ações (Action Bar) */}
        <View style={styles.actionBar}>
          <View style={styles.actionBarLeft}>
            {isOwner && (
              <Pressable
                onPress={() => setAddMediaModalVisible(true)}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: "#10B981" },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
              </Pressable>
            )}

            <Pressable onPress={handleToggleFavorite} style={styles.actionButton}>
              <MaterialIcons
                name={publicData.isFavorite ? "favorite" : "favorite-border"}
                size={28}
                color={publicData.isFavorite ? "#EF4444" : themeStyles.subText}
              />
            </Pressable>

            {/* DEBITO TECNICO: Sem funcionalidade de compartilhamento no backend. */}
            <Pressable
              onPress={() => Alert.alert("Compartilhar", "Sem funcionalidade de compartilhamento no backend.")}
              style={styles.actionButton}
            >
              <MaterialIcons name="share" size={24} color={themeStyles.subText} />
            </Pressable>
          </View>
        </View>

        {/* Lista de Mídias */}
        <View style={[styles.card, { backgroundColor: themeStyles.cardBackground, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: themeStyles.textColor }]}>
            Conteúdo da Lista
          </Text>

          {!publicData.mediaIds || publicData.mediaIds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="library-music" size={40} color={themeStyles.subText} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
                Nenhuma mídia adicionada a esta lista.
              </Text>
            </View>
          ) : (
            <View style={styles.mediaList}>
              {/* DEBITO TECNICO: Renderizando IDs diretos. Mídia real bloqueada pela entrega da sprint de Mídia. */}
              {publicData.mediaIds.map((mediaId) => (
                <View key={mediaId} style={[styles.mediaCard, { borderColor: themeStyles.border }]}>
                  <View style={[styles.mediaIconBg, { backgroundColor: themeStyles.badgeBg }]}>
                    <MaterialIcons
                      name={publicData.typeOfList === "ALBUM" ? "album" : "music-note"}
                      size={20}
                      color={themeStyles.tintColor}
                    />
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text style={[styles.mediaTitle, { color: themeStyles.textColor }]} numberOfLines={1}>
                      Mídia ID: {mediaId}
                    </Text>
                    <Text style={[styles.mediaSubtitle, { color: themeStyles.subText }]}>
                      Artista Bloqueado
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (isOwner) {
                        Alert.alert("Opções da Mídia", "O que deseja fazer?", [
                          {
                            text: "Remover da Lista",
                            style: "destructive",
                            onPress: () => handleRemoveMedia(mediaId),
                          },
                          { text: "Cancelar", style: "cancel" },
                        ]);
                      } else {
                        Alert.alert("Opções da Mídia", "Sem opções adicionais disponíveis.");
                      }
                    }}
                    style={styles.moreButton}
                  >
                    <MaterialIcons name="more-vert" size={20} color={themeStyles.subText} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {isOwner && mediaList && (
        <>
          <EditMediaListNameModal
            visible={isNameModalVisible}
            currentName={publicData.listName}
            listId={Number(id)}
            onClose={() => setNameModalVisible(false)}
            onSuccess={setMediaList}
          />
          <EditMediaListPrivacyModal
            visible={isPrivacyModalVisible}
            currentPrivacy={"whoCanSee" in mediaList ? (mediaList as MediaListOwnerResponseDto).whoCanSee : "PUBLIC"}
            listId={Number(id)}
            onClose={() => setPrivacyModalVisible(false)}
            onSuccess={setMediaList}
          />
          <AddMediaModal
            visible={isAddMediaModalVisible}
            listId={Number(id)}
            typeOfList={publicData.typeOfList}
            onClose={() => setAddMediaModalVisible(false)}
            onSuccess={setMediaList}
          />
        </>
      )}
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
  coverContainer: {
    width: 160,
    height: 160,
    borderRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  metaContainer: {
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  listName: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsDot: {
    fontSize: 13,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  actionBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    padding: 6,
  },
  headerButton: {
    padding: 6,
  },
  pressed: {
    opacity: 0.7,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
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
  moreButton: {
    padding: 4,
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
