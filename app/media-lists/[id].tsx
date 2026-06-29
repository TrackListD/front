// Tela: Detalhe da Lista de Mídias — exibe a lista condicionalmente (Visão do Dono vs Visão Pública) via GET /mediaList/{id}
import { useColorScheme } from "@/hooks/use-color-scheme";
import AddMediaModal from "@/src/components/AddMediaModal";
import EditMediaListNameModal from "@/src/components/EditMediaListNameModal";
import EditMediaListPrivacyModal from "@/src/components/EditMediaListPrivacyModal";
import apiClient, { NormalizedError } from "@/src/service/api";
import {
  MediaListOwnerResponseDto,
  MediaListResponseDto,
} from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MediaListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [mediaList, setMediaList] = useState<
    MediaListResponseDto | MediaListOwnerResponseDto | null
  >(null);

  // Modals visibility states
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [isAddMediaModalVisible, setAddMediaModalVisible] = useState(false);
  const [isListOptionsVisible, setListOptionsVisible] = useState(false);
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<
        MediaListResponseDto | MediaListOwnerResponseDto
      >("/mediaList/" + id);
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
        await apiClient.delete(`/mediaList/${id}/favorite`);
      } else {
        await apiClient.post(`/mediaList/${id}/favorite`);
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
      Alert.alert(
        "Erro",
        normalized.message || "Não foi possível atualizar o favorito.",
      );
    }
  };

  const handleConfirmDeleteList = async () => {
    setDeleteConfirmVisible(false);
    setLoading(true);
    try {
      await apiClient.delete(`/mediaList/${id}`);
      router.replace("/media-lists/user/me" as Href);
    } catch (err) {
      const normalized = err as NormalizedError;
      Alert.alert(
        "Erro",
        normalized.message || "Não foi possível excluir a lista.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    if (!id) return;
    try {
      const response = await apiClient.delete<MediaListOwnerResponseDto>(
        `/mediaList/${id}/medias/${mediaId}`,
      );
      setMediaList(response.data);
    } catch (err) {
      const normalized = err as NormalizedError;
      Alert.alert(
        "Erro",
        normalized.message || "Não foi possível remover a mídia da lista.",
      );
    }
  };

  const handleOpenListOptions = () => {
    setListOptionsVisible(true);
  };

  const handleSelectEditName = () => {
    setListOptionsVisible(false);
    setNameModalVisible(true);
  };

  const handleSelectEditPrivacy = () => {
    setListOptionsVisible(false);
    setPrivacyModalVisible(true);
  };

  const handleSelectDeleteList = () => {
    setListOptionsVisible(false);
    setDeleteConfirmVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: themeStyles.background }]}
      >
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
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: themeStyles.background }]}
      >
        <Stack.Screen options={{ title: "Erro" }} />
        <View style={styles.centerContainer}>
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: themeStyles.errorBg,
                borderColor: themeStyles.errorText,
              },
            ]}
          >
            <MaterialIcons
              name="error-outline"
              size={44}
              color={themeStyles.errorText}
            />
            <Text style={[styles.errorTitle, { color: themeStyles.errorText }]}>
              {is404 ? "Lista não encontrada" : "Erro de Conexão"}
            </Text>
            <Text style={[styles.errorBody, { color: themeStyles.errorText }]}>
              {is404
                ? "A lista de mídias solicitada não pôde ser encontrada no servidor."
                : error?.message ||
                  "Ocorreu um erro ao carregar os detalhes da lista."}
            </Text>
            <Pressable
              style={[
                styles.retryButton,
                { backgroundColor: themeStyles.tintColor },
              ]}
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeStyles.background }]}
    >
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: themeStyles.cardBackground },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Capa da Lista */}
        {/* DEBITO TECNICO: Backend não retorna capa da lista. Usando placeholder. */}
        <View
          style={[
            styles.coverContainer,
            { backgroundColor: isDark ? "#2A2D31" : "#E2E8F0" },
          ]}
        >
          <MaterialIcons
            name={publicData.typeOfList === "ALBUM" ? "album" : "library-music"}
            size={64}
            color={themeStyles.subText}
          />
        </View>

        {/* Título e Autor da Lista */}
        <View style={styles.metaContainer}>
          {/* Linha do título com o menu de opções do dono ao lado */}
          <View style={styles.titleRow}>
            <Text
              style={[styles.listName, { color: themeStyles.textColor }]}
              numberOfLines={2}
            >
              {publicData.listName}
            </Text>

            {isOwner && (
              <Pressable
                onPress={handleOpenListOptions}
                style={({ pressed }) => [
                  styles.optionsButton,
                  { backgroundColor: themeStyles.badgeBg },
                  pressed && styles.pressed,
                ]}
                hitSlop={8}
              >
                <MaterialIcons
                  name="more-vert"
                  size={22}
                  color={themeStyles.textColor}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.authorRow}>
            <MaterialIcons
              name="account-circle"
              size={20}
              color={themeStyles.subText}
            />
            <Text style={[styles.authorName, { color: themeStyles.textColor }]}>
              {publicData.authorName || `Usuário #${publicData.idAuthor}`}
            </Text>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsRow}>
            <Text style={[styles.statsText, { color: themeStyles.subText }]}>
              {publicData.formattedDuration || "0s"}
            </Text>
            <Text style={[styles.statsDot, { color: themeStyles.subText }]}>
              •
            </Text>
            <Text style={[styles.statsText, { color: themeStyles.subText }]}>
              {publicData.medias ? publicData.medias.length : 0}{" "}
              {publicData.typeOfList === "ALBUM"
                ? publicData.medias.length === 1
                  ? "álbum"
                  : "álbuns"
                : publicData.medias.length === 1
                  ? "música"
                  : "músicas"}
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

            <Pressable
              onPress={handleToggleFavorite}
              style={styles.actionButton}
            >
              <MaterialIcons
                name={publicData.isFavorite ? "favorite" : "favorite-border"}
                size={28}
                color={publicData.isFavorite ? "#EF4444" : themeStyles.subText}
              />
            </Pressable>

            {/* DEBITO TECNICO: Sem funcionalidade de compartilhamento no backend. */}
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Compartilhar",
                  "Sem funcionalidade de compartilhamento no backend.",
                )
              }
              style={styles.actionButton}
            >
              <MaterialIcons
                name="share"
                size={24}
                color={themeStyles.subText}
              />
            </Pressable>
          </View>
        </View>

        {/* Lista de Mídias */}
        <View
          style={[
            styles.card,
            { backgroundColor: themeStyles.cardBackground, marginTop: 16 },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeStyles.textColor }]}>
            Conteúdo da Lista
          </Text>

          {!publicData.medias || publicData.medias.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="library-music"
                size={40}
                color={themeStyles.subText}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
                Nenhuma mídia adicionada a esta lista.
              </Text>
            </View>
          ) : (
            <View style={styles.mediaList}>
              {publicData.medias.map((media) => (
                <View
                  key={media.id}
                  style={[
                    styles.mediaCard,
                    { borderColor: themeStyles.border },
                  ]}
                >
                  <View
                    style={[
                      styles.mediaIconBg,
                      { backgroundColor: themeStyles.badgeBg },
                    ]}
                  >
                    {media.coverUrl ? (
                      <Image
                        source={{ uri: media.coverUrl }}
                        style={{ width: 40, height: 40, borderRadius: 8 }}
                      />
                    ) : (
                      <MaterialIcons
                        name={
                          publicData.typeOfList === "ALBUM"
                            ? "album"
                            : "music-note"
                        }
                        size={20}
                        color={themeStyles.tintColor}
                      />
                    )}
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text
                      style={[
                        styles.mediaTitle,
                        { color: themeStyles.textColor },
                      ]}
                      numberOfLines={1}
                    >
                      {media.title}
                    </Text>
                    <Text
                      style={[
                        styles.mediaSubtitle,
                        { color: themeStyles.subText },
                      ]}
                      numberOfLines={1}
                    >
                      {media.artist} • {media.formattedDuration}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (isOwner) {
                        Alert.alert("Opções da Mídia", "O que deseja fazer?", [
                          {
                            text: "Remover da Lista",
                            style: "destructive",
                            onPress: () => handleRemoveMedia(media.id),
                          },
                          { text: "Cancelar", style: "cancel" },
                        ]);
                      } else {
                        Alert.alert(
                          "Opções da Mídia",
                          "Sem opções adicionais disponíveis.",
                        );
                      }
                    }}
                    style={styles.moreButton}
                  >
                    <MaterialIcons
                      name="more-vert"
                      size={20}
                      color={themeStyles.subText}
                    />
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
            currentPrivacy={
              "whoCanSee" in mediaList
                ? (mediaList as MediaListOwnerResponseDto).whoCanSee
                : "PUBLIC"
            }
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

          {/* Menu de opções da lista (editar nome/privacidade/excluir).
              Modal customizado em vez de Alert.alert, pois Alert.alert
              não tem implementação visual no Expo Web. */}
          <Modal
            visible={isListOptionsVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setListOptionsVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setListOptionsVisible(false)}
            >
              <Pressable
                style={[
                  styles.optionsSheet,
                  { backgroundColor: themeStyles.cardBackground },
                ]}
                onPress={(e) => e.stopPropagation()}
              >
                <Text
                  style={[
                    styles.optionsSheetTitle,
                    { color: themeStyles.textColor },
                  ]}
                >
                  Opções da Lista
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.optionsSheetItem,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSelectEditName}
                >
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={themeStyles.textColor}
                  />
                  <Text
                    style={[
                      styles.optionsSheetItemText,
                      { color: themeStyles.textColor },
                    ]}
                  >
                    Editar Nome
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.optionsSheetItem,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSelectEditPrivacy}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={themeStyles.textColor}
                  />
                  <Text
                    style={[
                      styles.optionsSheetItemText,
                      { color: themeStyles.textColor },
                    ]}
                  >
                    Editar Privacidade
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.optionsSheetItem,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSelectDeleteList}
                >
                  <MaterialIcons name="delete" size={20} color="#EF4444" />
                  <Text
                    style={[styles.optionsSheetItemText, { color: "#EF4444" }]}
                  >
                    Excluir Lista
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.optionsSheetCancel,
                    { borderColor: themeStyles.border },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setListOptionsVisible(false)}
                >
                  <Text
                    style={[
                      styles.optionsSheetItemText,
                      { color: themeStyles.subText },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

          {/* Confirmação de exclusão (também não usa Alert.alert) */}
          <Modal
            visible={isDeleteConfirmVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDeleteConfirmVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setDeleteConfirmVisible(false)}
            >
              <Pressable
                style={[
                  styles.confirmCard,
                  { backgroundColor: themeStyles.cardBackground },
                ]}
                onPress={(e) => e.stopPropagation()}
              >
                <Text
                  style={[
                    styles.optionsSheetTitle,
                    { color: themeStyles.textColor },
                  ]}
                >
                  Excluir Lista
                </Text>
                <Text
                  style={[styles.confirmBody, { color: themeStyles.subText }]}
                >
                  Tem certeza que deseja excluir esta lista permanentemente?
                  Esta ação não pode ser desfeita.
                </Text>

                <View style={styles.confirmActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      { backgroundColor: themeStyles.badgeBg },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setDeleteConfirmVisible(false)}
                  >
                    <Text
                      style={{
                        color: themeStyles.textColor,
                        fontWeight: "600",
                      }}
                    >
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      { backgroundColor: "#EF4444" },
                      pressed && styles.pressed,
                    ]}
                    onPress={handleConfirmDeleteList}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Excluir
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  optionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listName: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    flexShrink: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  optionsSheet: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  optionsSheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  optionsSheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionsSheetItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  optionsSheetCancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  confirmBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
