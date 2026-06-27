// Tela: Comentários de um Usuário — lista todos os comentários feitos por um usuário específico via GET /api/comments/user/{userId}
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
} from "react-native";
import { Stack, useLocalSearchParams, router, Href } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { CommentResponseDto } from "@/src/types/comment";
import { UserPerfilResponseDTO } from "@/src/types/user";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function UserCommentsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Form search input state
  const [searchInput, setSearchInput] = useState(userId || "");

  // Fetch states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [comments, setComments] = useState<CommentResponseDto[]>([]);

  const fetchComments = async (targetUserId: string) => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      let actualUserId = targetUserId;
      if (targetUserId === "me") {
        const profileRes = await apiClient.get<UserPerfilResponseDTO>("/api/users/me");
        actualUserId = String(profileRes.data.id);
      }
      const response = await apiClient.get<CommentResponseDto[]>("/api/comments/user/" + actualUserId);
      setComments(response.data);
    } catch (err) {
      setError(err as NormalizedError);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchComments(userId);
      setSearchInput(userId);
    }
  }, [userId]);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    router.replace((`/comments/user/${trimmed}`) as Href);
  };

  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    inputBg: isDark ? "#151719" : "#F1F3F5",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
  };

  const parseBackendDate = (dateStr: string) => {
    try {
      const matches = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
      if (matches) {
        const [_, day, month, year, hour, minute, second] = matches;
        return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const parsed = parseBackendDate(dateStr);
    if (!parsed || isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "Comentários do Usuário",
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
        {!loading && !error && comments.length === 0 && (
          <View style={styles.centerContainer}>
            <MaterialIcons name="forum" size={48} color={themeStyles.subText} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
              Nenhum comentário encontrado
            </Text>
          </View>
        )}

        {/* Success List */}
        {!loading && !error && comments.length > 0 && (
          <FlatList
            data={comments}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push((`/ratings/${item.idPost}`) as Href)}
                style={({ pressed }) => [
                  styles.commentCard,
                  {
                    backgroundColor: themeStyles.cardBackground,
                    borderColor: themeStyles.border,
                  },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.targetName, { color: themeStyles.textColor }]} numberOfLines={1}>
                      Publicação #{item.idPost}
                    </Text>
                    <Text style={[styles.dateText, { color: themeStyles.subText }]}>
                      {formatDate(item.commentDate)}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={themeStyles.subText} />
                </View>

                <Text style={[styles.commentText, { color: themeStyles.textColor }]} numberOfLines={2}>
                  {item.text}
                </Text>

                <View style={styles.likesContainer}>
                  <MaterialIcons name="thumb-up-off-alt" size={16} color={themeStyles.subText} />
                  <Text style={[styles.likesText, { color: themeStyles.subText }]}>
                    {item.likeCount} {item.likeCount === 1 ? "curtida" : "curtidas"}
                  </Text>
                </View>
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
  commentCard: {
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
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  likesText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  emptyIcon: {
    opacity: 0.4,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
