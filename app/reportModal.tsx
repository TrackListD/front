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

  const { commentId, ratingId, mediaListId, userTargetId, reason } = useLocalSearchParams<{
    commentId?: string;
    ratingId?: string;
    mediaListId?: string;
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
      // Busca o usuário logado para saber quem está denunciando.
      // (Mesmo padrão usado no FeedList/profile: cada tela resolve o
      // usuário atual via getMyProfile/authFetch, não existe um
      // useAuth()/context global ainda.)
      const me = await getMyProfile();

      // DTO esperado pelo @RequestBody ReportRequestDTO do Spring (camelCase)
      const reportData = {
        informerId: me.id,
        userTargetId: userTargetId ? Number(userTargetId) : null,
        commentTargetId: commentId ? Number(commentId) : null,
        ratingTargetId: ratingId ? Number(ratingId) : null,
        mediaListTargetId: mediaListId ? Number(mediaListId) : null,
        reportReason: description,
      };

      // apiClient.post já usa authFetch por dentro (injeta o token do
      // Firebase, já resolve API_BASE_URL com /api, e já trata erros)
      await apiClient.post("/reports", reportData);

      Alert.alert(
        "Denúncia Enviada",
        "Agradecemos o envio. Nossa equipe de moderação irá analisar o conteúdo.",
      );
      router.back(); // Fecha o modal e volta para a tela anterior
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
