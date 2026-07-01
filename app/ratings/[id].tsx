// Tela: Detalhe de Avaliação — exibe os dados completos de uma avaliação, com variação para dono e público.

import { useColorScheme } from "@/hooks/use-color-scheme";
import EditNoteModal from "@/src/components/EditNoteModal";
import EditPrivacyModal from "@/src/components/EditPrivacyModal";
import EditReviewModal from "@/src/components/EditReviewModal";
import { StarRating } from "@/src/components/StarRating";
import apiClient, { NormalizedError } from "@/src/service/api";
import { toggleLike } from "@/src/service/feedApi";
import { RatingDetailResponse, RatingResponseDto } from "@/src/types/rating";
import { formatDateBR } from "@/src/utils/dateUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RatingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [rating, setRating] = useState<RatingDetailResponse | null>(null);

  // Estados para controle de visibilidade dos modais de edição
  const [showEditReview, setShowEditReview] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  const [showEditPrivacy, setShowEditPrivacy] = useState(false);

  // Estado de curtida sincronizado com o backend
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Função auxiliar para extrair e sincronizar as propriedades de curtida dos DTOs recebidos
  const syncLikeStates = (data: RatingDetailResponse) => {
    const fetchedPublicData =
      (data as any).publicData || (data as any).publicDto || data;

    if (fetchedPublicData) {
      setLikeCount(fetchedPublicData.likeCount ?? 0);
      setLiked(!!fetchedPublicData.likedByMe);
    }
  };

  useEffect(() => {
    const fetchRatingDetail = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<RatingDetailResponse>(
          "/ratings/" + id,
        );
        console.log(
          "CONTEÚDO REAL DA API:",
          JSON.stringify(response.data, null, 2),
        );
        setRating(response.data);
        syncLikeStates(response.data);
      } catch (err) {
        setError(err as NormalizedError);
      } finally {
        setLoading(false);
      }
    };

    fetchRatingDetail();
  }, [id]);

  // Color theme configurations
  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    starColor: "#FFC107",
    badgeBg: isDark ? "#2A2D31" : "#F1F3F5",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorBorder: isDark ? "#5C1E1E" : "#FCA5A5",
    errorText: isDark ? "#F87171" : "#B91C1C",
    avatarBg: isDark ? "#334155" : "#E2E8F0",
    likeColor: "#EF4444",
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Ativa", color: "#10B981" };
      case "SUSPENDED":
        return { label: "Suspensa", color: "#F59E0B" };
      case "BANNED":
        return { label: "Banida", color: "#EF4444" };
      case "HIDDEN":
        return { label: "Oculta", color: "#6B7280" };
      default:
        return { label: status, color: "#6B7280" };
    }
  };

  const translatePrivacy = (
    privacy: string,
  ): { label: string; icon: "public" | "people" | "lock" | "visibility" } => {
    switch (privacy) {
      case "PUBLIC":
        return { label: "Público", icon: "public" };
      case "JUST_FOLLOWERS":
        return { label: "Seguidores", icon: "people" };
      case "PRIVATE":
        return { label: "Privado", icon: "lock" };
      default:
        return { label: privacy, icon: "visibility" };
    }
  };

  // Toggle de curtida (publication like) usando atualização otimista
  const handleToggleLike = async () => {
    if (!id) return;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const result = await toggleLike(Number(id));
      setLiked(result.liked);
      setLikeCount(result.likesCount);
    } catch (err) {
      console.error("Erro ao curtir avaliação:", id, err);
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleUpdateRating = (updatedData: RatingDetailResponse) => {
    setRating(updatedData);
    syncLikeStates(updatedData);
  };

  // 1. Loading State
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

  // 2. Error States
  if (error || !rating) {
    const is404 = error?.status === 404;
    const errorMessage = is404
      ? "Avaliação não encontrada"
      : error?.message ||
        "Ocorreu um erro ao carregar os detalhes da avaliação.";

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
                borderColor: themeStyles.errorBorder,
              },
            ]}
          >
            <MaterialIcons
              name={is404 ? "search-off" : "error-outline"}
              size={48}
              color={themeStyles.errorText}
            />
            <Text style={[styles.errorTitle, { color: themeStyles.errorText }]}>
              {is404 ? "Não Encontrado" : "Erro de Conexão"}
            </Text>
            <Text style={[styles.errorBody, { color: themeStyles.errorText }]}>
              {errorMessage}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Normalizing access (discrimination helper)
  const isOwner = !!rating && ("publicData" in rating || "publicDto" in rating);

  const publicData: RatingResponseDto = rating
    ? (rating as any).publicData || (rating as any).publicDto || rating
    : null;

  if (!publicData || !publicData.targetMedia) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: themeStyles.background }]}
      >
        <Stack.Screen options={{ title: "Carregando Mídia..." }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeStyles.tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  const handleReport = () => {
    router.push({
      pathname: "/reportModal",
      params: {
        ratingId: publicData.id,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeStyles.background }]}
    >
      <Stack.Screen
        options={{
          title: "Detalhe da Avaliação",
          headerStyle: {
            backgroundColor: themeStyles.cardBackground,
          },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Details Card */}
        <View
          style={[styles.card, { backgroundColor: themeStyles.cardBackground }]}
        >
          {/* Header Row: Author Info */}
          <View style={styles.authorHeader}>
            <View style={styles.authorMeta}>
              {publicData.author.profilePic ? (
                <Image
                  source={{ uri: publicData.author.profilePic }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: themeStyles.avatarBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: themeStyles.textColor },
                    ]}
                  >
                    {publicData.author.name
                      ? publicData.author.name.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>
              )}
              <View>
                <Text
                  style={[styles.authorName, { color: themeStyles.textColor }]}
                >
                  {publicData.author.name}
                </Text>
                <Text style={[styles.dateText, { color: themeStyles.subText }]}>
                  Publicado em {formatDateBR(publicData.publicationDate)}
                </Text>
              </View>
            </View>

            {isOwner && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      translateStatus(rating.status).color + "15",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: translateStatus(rating.status).color },
                  ]}
                >
                  {translateStatus(rating.status).label}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View
            style={[styles.divider, { backgroundColor: themeStyles.border }]}
          />

          {/* Target Name (Media title) */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: themeStyles.subText }]}>
              Mídia Avaliada
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              {publicData.targetMedia.coverUrl ? (
                <Image
                  source={{ uri: publicData.targetMedia.coverUrl }}
                  style={{ width: 60, height: 60, borderRadius: 8 }}
                />
              ) : (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    backgroundColor: themeStyles.badgeBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name={
                      publicData.targetMedia.type === "ALBUM"
                        ? "album"
                        : "music-note"
                    }
                    size={28}
                    color={themeStyles.tintColor}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.targetTitle, { color: themeStyles.textColor }]}
                  numberOfLines={2}
                >
                  {publicData.targetMedia.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: themeStyles.subText,
                    marginTop: 2,
                  }}
                >
                  {publicData.targetMedia.artist}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: themeStyles.subText,
                    marginTop: 1,
                  }}
                >
                  Duração: {publicData.targetMedia.formattedDuration}
                </Text>
              </View>
            </View>
          </View>

          {/* Rating note */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: themeStyles.subText }]}>
              Nota
            </Text>
            <View style={styles.ratingRow}>
              <StarRating
                rating={publicData.ratingNote}
                size={28}
                disabled={true}
                filledColor={themeStyles.starColor}
                emptyColor={themeStyles.subText}
              />
              <Text
                style={[
                  styles.ratingValueText,
                  { color: themeStyles.textColor },
                ]}
              >
                {publicData.ratingNote.toFixed(1)} / 5.0
              </Text>

              {isOwner && (
                <Pressable
                  style={({ pressed }) => [
                    styles.editIcon,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setShowEditNote(true)}
                >
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color={themeStyles.tintColor}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Review text */}
          <View style={styles.sectionContainer}>
            <View style={styles.rowJustify}>
              <Text
                style={[styles.sectionLabel, { color: themeStyles.subText }]}
              >
                Resenha
              </Text>

              {isOwner && (
                <Pressable
                  style={({ pressed }) => [
                    styles.editIcon,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setShowEditReview(true)}
                >
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color={themeStyles.tintColor}
                  />
                </Pressable>
              )}
            </View>
            <View
              style={[
                styles.reviewContainer,
                {
                  backgroundColor: isDark ? "#151719" : "#F8F9FA",
                  borderColor: themeStyles.border,
                },
              ]}
            >
              <Text
                style={[styles.reviewText, { color: themeStyles.textColor }]}
              >
                {publicData.review || "Sem opinião escrita para esta mídia."}
              </Text>
            </View>
          </View>

          {/* If Owner: Privacy Info block */}
          {isOwner && (
            <View style={styles.sectionContainer}>
              <Text
                style={[styles.sectionLabel, { color: themeStyles.subText }]}
              >
                Privacidade
              </Text>
              <View style={styles.privacyRow}>
                <View
                  style={[
                    styles.privacyBadge,
                    { backgroundColor: themeStyles.badgeBg },
                  ]}
                >
                  <MaterialIcons
                    name={translatePrivacy(rating.whoCanSee).icon}
                    size={16}
                    color={themeStyles.textColor}
                    style={styles.privacyIcon}
                  />
                  <Text
                    style={[
                      styles.privacyText,
                      { color: themeStyles.textColor },
                    ]}
                  >
                    {translatePrivacy(rating.whoCanSee).label}
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.editIcon,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setShowEditPrivacy(true)}
                >
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color={themeStyles.tintColor}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* Interaction counters (Like / Comments / Report) */}
          <View
            style={[styles.divider, { backgroundColor: themeStyles.border }]}
          />

          <View style={styles.interactionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.interactionItem,
                pressed && styles.pressed,
              ]}
              onPress={handleToggleLike}
              hitSlop={8}
            >
              <MaterialIcons
                name={liked ? "favorite" : "favorite-border"}
                size={20}
                color={liked ? themeStyles.likeColor : themeStyles.subText}
              />
              <Text
                style={[
                  styles.interactionText,
                  {
                    color: liked
                      ? themeStyles.likeColor
                      : themeStyles.textColor,
                  },
                ]}
              >
                {likeCount} {likeCount === 1 ? "Curtida" : "Curtidas"}
              </Text>
            </Pressable>

            <View style={styles.interactionItem}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={20}
                color={themeStyles.subText}
              />
              <Text
                style={[
                  styles.interactionText,
                  { color: themeStyles.textColor },
                ]}
              >
                {publicData.commentCount}{" "}
                {publicData.commentCount === 1 ? "Comentário" : "Comentários"}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.interactionItem,
                pressed && styles.pressed,
              ]}
              onPress={handleReport}
              hitSlop={8}
            >
              <MaterialIcons
                name="flag"
                size={20}
                color={themeStyles.subText}
              />
              <Text
                style={[
                  styles.interactionText,
                  { color: themeStyles.textColor },
                ]}
              >
                Denunciar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Comments placeholder card */}
        <View
          style={[
            styles.card,
            { backgroundColor: themeStyles.cardBackground, marginTop: 16 },
          ]}
        >
          <Text
            style={[styles.commentsTitle, { color: themeStyles.textColor }]}
          >
            Comentários
          </Text>

          <Pressable
            onPress={() => {
              router.push(`/comments/post/${publicData.id}` as Href);
            }}
            style={({ pressed }) => [
              styles.commentsButton,
              {
                borderColor: themeStyles.border,
                backgroundColor: isDark ? "#151719" : "#F8F9FA",
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.commentsButtonLeft}>
              <MaterialIcons
                name="forum"
                size={20}
                color={themeStyles.tintColor}
              />
              <Text
                style={[
                  styles.commentsButtonText,
                  { color: themeStyles.textColor },
                ]}
              >
                Ver todos os comentários ({publicData.commentCount})
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={themeStyles.subText}
            />
          </Pressable>
        </View>
      </ScrollView>

      {isOwner && (
        <>
          <EditReviewModal
            visible={showEditReview}
            onClose={() => setShowEditReview(false)}
            currentReview={publicData.review || ""}
            ratingId={Number(id)}
            onSuccess={handleUpdateRating}
          />
          <EditNoteModal
            visible={showEditNote}
            onClose={() => setShowEditNote(false)}
            currentNote={publicData.ratingNote}
            ratingId={Number(id)}
            onSuccess={handleUpdateRating}
          />
          <EditPrivacyModal
            visible={showEditPrivacy}
            onClose={() => setShowEditPrivacy(false)}
            currentPrivacy={rating.whoCanSee}
            ratingId={Number(id)}
            onSuccess={handleUpdateRating}
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
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionContainer: {
    gap: 6,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  targetTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  targetIdSubtitle: {
    fontSize: 12,
    fontStyle: "italic",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ratingValueText: {
    fontSize: 16,
    fontWeight: "700",
  },
  editIcon: {
    padding: 6,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  rowJustify: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  privacyIcon: {
    marginRight: 6,
  },
  privacyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  interactionRow: {
    flexDirection: "row",
    gap: 20,
  },
  interactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  interactionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  commentsButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentsButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  errorBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
