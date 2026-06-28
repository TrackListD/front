// Tela: Lista de Avaliações por Usuário — exibe todas as avaliações públicas de um usuário específico.

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Image,
} from "react-native";
import { Stack, useLocalSearchParams, router, Href } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { StarRating } from "@/src/components/StarRating";
import { RatingResponseDto } from "@/src/types/rating";
import { UserPerfilResponseDTO } from "@/src/types/user";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { formatDateBR } from "@/src/utils/dateUtils";

export default function UserRatingsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Form search input state
  const [searchInput, setSearchInput] = useState(userId || "");

  // Fetch states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [ratings, setRatings] = useState<RatingResponseDto[]>([]);

  const fetchRatings = async (targetUserId: string) => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      let actualUserId = targetUserId;
      if (targetUserId === "me") {
        const profileRes = await apiClient.get<UserPerfilResponseDTO>("/api/users/me");
        actualUserId = String(profileRes.data.id);
      }
      const response = await apiClient.get<RatingResponseDto[]>("/api/ratings/user/" + actualUserId);
      setRatings(response.data);
    } catch (err) {
      setError(err as NormalizedError);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRatings(userId);
      setSearchInput(userId);
    }
  }, [userId]);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    router.replace((`/ratings/user/${trimmed}`) as Href);
  };

  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    inputBg: isDark ? "#151719" : "#F1F3F5",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    starColor: "#FFC107",
  };



  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "Avaliações do Usuário",
          headerStyle: {
            backgroundColor: themeStyles.cardBackground,
          },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.container}>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={themeStyles.tintColor} />
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: "#EF4444" }]}>{error.message}</Text>
          </View>
        )}

        {/* Empty List State */}
        {!loading && !error && ratings.length === 0 && (
          <View style={styles.centerContainer}>
            <MaterialIcons name="rate-review" size={48} color={themeStyles.subText} />
            <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
              Nenhuma avaliação encontrada
            </Text>
          </View>
        )}

        {/* Success List */}
        {!loading && !error && ratings.length > 0 && (
          <FlatList
            data={ratings}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push((`/ratings/${item.id}`) as Href)}
                style={({ pressed }) => [
                  styles.ratingCard,
                  {
                    backgroundColor: themeStyles.cardBackground,
                    borderColor: themeStyles.border,
                  },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    {item.targetMedia?.coverUrl ? (
                      <Image
                        source={{ uri: item.targetMedia.coverUrl }}
                        style={{ width: 48, height: 48, borderRadius: 8 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          backgroundColor: themeStyles.inputBg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialIcons
                          name={item.targetMedia?.type === "ALBUM" ? "album" : "music-note"}
                          size={24}
                          color={themeStyles.tintColor}
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.targetName, { color: themeStyles.textColor }]} numberOfLines={1}>
                        {item.targetMedia?.title}
                      </Text>
                      <Text style={{ fontSize: 13, color: themeStyles.subText }} numberOfLines={1}>
                        {item.targetMedia?.artist}
                      </Text>
                      <Text style={[styles.dateText, { color: themeStyles.subText, marginTop: 2 }]}>
                        {formatDateBR(item.publicationDate)}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={themeStyles.subText} />
                </View>

                <View style={styles.ratingRow}>
                  <StarRating
                    rating={item.ratingNote}
                    size={18}
                    disabled={true}
                    filledColor={themeStyles.starColor}
                    emptyColor={themeStyles.subText}
                  />
                  <Text style={[styles.ratingNoteText, { color: themeStyles.textColor }]}>
                    {item.ratingNote.toFixed(1)}
                  </Text>
                </View>

                {item.review ? (
                  <Text style={[styles.reviewSnippet, { color: themeStyles.textColor }]} numberOfLines={2}>
                    {item.review}
                  </Text>
                ) : (
                  <Text style={[styles.reviewSnippet, styles.noReviewText, { color: themeStyles.subText }]}>
                    Sem opinião escrita.
                  </Text>
                )}
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  searchCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  ratingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  targetName: {
    fontSize: 16,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingNoteText: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewSnippet: {
    fontSize: 14,
    lineHeight: 20,
  },
  noReviewText: {
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
