import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import apiClient from "../src/service/api";
import { getMyProfile } from "../src/service/userApi";

export default function ReportModalScreen() {
  const router = useRouter();

  // Recebe os IDs das telas de origem (FeedList, PostCard ou Profile)
  const { commentId, postId, userTargetId, reason } = useLocalSearchParams<{
    commentId?: string;
    postId?: string;
    userTargetId?: string;
    reason?: string;
  }>();

  const [description, setDescription] = useState(reason ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmitReport = async () => {
    if (!description.trim()) {
      Alert.alert("Erro", "Por favor, descreva o motivo da denúncia.");
      return;
    }

    setLoading(true);

    try {
      // Busca o usuário logado que está efetuando a denúncia
      const me = await getMyProfile();

      // Sanitização estrita: Garante que só enviará números válidos ou null (evita 0 ou NaN)
      const targetUser = userTargetId && userTargetId.trim() !== "" ? Number(userTargetId) : null;
      const targetComment = commentId && commentId.trim() !== "" ? Number(commentId) : null;
      const targetPost = postId && postId.trim() !== "" ? Number(postId) : null;

      // DTO mapeado conforme esperado pelo @RequestBody ReportRequestDTO no Spring
      const reportData = {
        informerId: me.id,
        userTargetId: targetUser,
        commentTargetId: targetComment,
        postTargetId: targetPost, // Incluído para denúncias de posts/publicações
        reportReason: description,
      };

      // Envia a requisição usando o cliente unificado que gerencia os tokens
      await apiClient.post("/reports", reportData);

      Alert.alert(
        "Denúncia Enviada",
        "Agradecemos o envio. Nossa equipe de moderação irá analisar o conteúdo.",
      );
      router.back(); 
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Ocorreu um problema ao enviar a denúncia. Tente novamente.";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Denunciar Conteúdo
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Ajude-nos a manter a comunidade do TrackListd segura e respeitosa.
      </ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Explique o motivo (ex: Discurso de ódio, assédio, spam, spoiler...)"
        placeholderTextColor="#777"
        multiline
        numberOfLines={5}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.button, styles.submitButton]}
        onPress={handleSubmitReport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <ThemedText style={styles.buttonText}>Enviar Denúncia</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#fff",
    borderRadius: 8,
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#1DB954",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: "#FF453A",
    fontWeight: "600",
  },
});