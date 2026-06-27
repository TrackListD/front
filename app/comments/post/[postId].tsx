// Tela: Comentários de uma Avaliação — lista e gerencia comentários de uma publicação específica via GET /api/comments/post/{postId}
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { CommentResponseDto } from "@/src/types/comment";
import { UserPerfilResponseDTO } from "@/src/types/user";
import EditCommentModal from "@/src/components/EditCommentModal";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function PostCommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // New comment input states
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal editing state
  const [editingComment, setEditingComment] = useState<CommentResponseDto | null>(null);

  // Theme configuration
  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    avatarBg: isDark ? "#334155" : "#E2E8F0",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
    inputBg: isDark ? "#151719" : "#FFFFFF",
  };

  const fetchComments = async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<CommentResponseDto[]>("/api/comments/post/" + postId);
      setComments(response.data);
    } catch (err) {
      setError(err as NormalizedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    const fetchCurrentUser = async () => {
      try {
        const response = await apiClient.get<UserPerfilResponseDTO>("/api/users/me");
        setCurrentUserId(response.data.id);
      } catch (err) {
        console.error("Erro ao carregar usuário atual:", err);
      }
    };
    fetchCurrentUser();
  }, [postId]);

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

  const handleCreateComment = async () => {
    if (!newCommentText.trim() || !postId) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await apiClient.post<Omit<CommentResponseDto, "id"> & { id?: number }>("/api/comments", {
        idPost: Number(postId),
        text: newCommentText.trim(),
      });

      const newComment: CommentResponseDto = {
        ...response.data,
        id: response.data.id ?? Date.now(),
      };

      setComments((prev) => [newComment, ...prev]);
      setNewCommentText("");
    } catch (err) {
      const normalized = err as NormalizedError;
      setSubmitError(normalized.message || "Erro ao publicar comentário.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      "Excluir Comentário",
      "Tem certeza que deseja excluir este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/api/comments/${commentId}`);
              setComments((prev) => prev.filter((c) => c.id !== commentId));
            } catch (err) {
              const normalized = err as NormalizedError;
              Alert.alert("Erro", normalized.message || "Erro ao excluir o comentário.");
            }
          },
        },
      ]
    );
  };

  const renderCommentCard = ({ item }: { item: CommentResponseDto }) => {
    const isOwner = currentUserId !== null && item.idAuthor === currentUserId;

    return (
      <View style={[styles.commentCard, { backgroundColor: themeStyles.cardBackground, borderColor: themeStyles.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.authorContainer}>
            <View style={[styles.avatar, { backgroundColor: themeStyles.avatarBg }]}>
              <Text style={[styles.avatarText, { color: themeStyles.textColor }]}>
                U
              </Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: themeStyles.textColor }]}>
                Usuário #{item.idAuthor}
              </Text>
              <Text style={[styles.dateText, { color: themeStyles.subText }]}>
                {formatDate(item.commentDate)}
              </Text>
            </View>
          </View>

          {isOwner && (
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                onPress={() => setEditingComment(item)}
              >
                <MaterialIcons name="edit" size={18} color={themeStyles.tintColor} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                onPress={() => handleDeleteComment(item.id)}
              >
                <MaterialIcons name="delete" size={18} color="#EF4444" />
              </Pressable>
            </View>
          )}
        </View>

        <Text style={[styles.commentText, { color: themeStyles.textColor }]}>
          {item.text}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.likesContainer}>
            <MaterialIcons name="thumb-up-off-alt" size={16} color={themeStyles.subText} />
            <Text style={[styles.likesText, { color: themeStyles.subText }]}>
              {item.likeCount} {item.likeCount === 1 ? "curtida" : "curtidas"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: themeStyles.cardBackground, borderColor: themeStyles.border }]}>
      <Text style={[styles.sectionTitle, { color: themeStyles.textColor }]}>
        Novo Comentário
      </Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: themeStyles.inputBg, color: themeStyles.textColor, borderColor: themeStyles.border }]}
          placeholder="Adicione um comentário..."
          placeholderTextColor={themeStyles.subText}
          value={newCommentText}
          onChangeText={setNewCommentText}
          multiline
          editable={!submitting}
        />
        
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: themeStyles.tintColor },
            (!newCommentText.trim() || submitting) && styles.disabledButton,
            pressed && styles.pressed,
          ]}
          onPress={handleCreateComment}
          disabled={!newCommentText.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      {submitError && (
        <View style={[styles.errorContainer, { backgroundColor: themeStyles.errorBg }]}>
          <Text style={[styles.errorText, { color: themeStyles.errorText }]}>
            {submitError}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="forum" size={48} color={themeStyles.subText} style={styles.emptyIcon} />
      <Text style={[styles.emptyText, { color: themeStyles.subText }]}>
        Ainda não há comentários nesta publicação.
      </Text>
      <Text style={[styles.emptySubtitle, { color: themeStyles.subText }]}>
        Seja o primeiro a comentar!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "Comentários",
          headerStyle: { backgroundColor: themeStyles.cardBackground },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
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
                {error.message || "Erro ao carregar comentários."}
              </Text>
              <Pressable
                style={[styles.retryButton, { backgroundColor: themeStyles.tintColor }]}
                onPress={fetchComments}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCommentCard}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
          />
        )}
      </KeyboardAvoidingView>

      {editingComment && (
        <EditCommentModal
          visible={!!editingComment}
          commentId={editingComment.id}
          currentText={editingComment.text}
          onClose={() => setEditingComment(null)}
          onSuccess={(updatedComment) => {
            setComments((prev) =>
              prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 46,
    maxHeight: 120,
  },
  submitButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  commentCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    fontWeight: "600",
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
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
  errorContainer: {
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
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
