// Componente: Modal de edição de resenha — permite ao dono alterar o texto da avaliação via PATCH /ratings/{id}/review
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/api";
import { RatingOwnerResponseDto } from "@/src/types/rating";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface EditReviewModalProps {
  visible: boolean;
  onClose: () => void;
  currentReview: string;
  ratingId: number;
  onSuccess: (updatedRating: RatingOwnerResponseDto) => void;
}

export default function EditReviewModal({
  visible,
  onClose,
  currentReview,
  ratingId,
  onSuccess,
}: EditReviewModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [review, setReview] = useState(currentReview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza o estado com a propriedade quando o modal é aberto
  useEffect(() => {
    if (visible) {
      setReview(currentReview);
      setError(null);
    }
  }, [visible, currentReview]);

  const themeStyles = {
    backdrop: "rgba(0, 0, 0, 0.5)",
    modalBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    inputBg: isDark ? "#151719" : "#F8F9FA",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    buttonCancelBg: isDark ? "#2A2D31" : "#F1F3F5",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<RatingOwnerResponseDto>(
        `/ratings/${ratingId}/review`,
        { newReview: review },
      );
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const normalized = err as NormalizedError;
      setError(normalized.message || "Erro ao salvar a resenha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[styles.backdrop, { backgroundColor: themeStyles.backdrop }]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.modalCard,
                { backgroundColor: themeStyles.modalBackground },
              ]}
            >
              {/* Cabeçalho */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeStyles.textColor }]}>
                  Editar Resenha
                </Text>
                <Pressable
                  onPress={onClose}
                  disabled={loading}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={themeStyles.textColor}
                  />
                </Pressable>
              </View>

              {/* Alerta de erro */}
              {error && (
                <View
                  style={[
                    styles.errorContainer,
                    { backgroundColor: themeStyles.errorBg },
                  ]}
                >
                  <Text
                    style={[styles.errorText, { color: themeStyles.errorText }]}
                  >
                    {error}
                  </Text>
                </View>
              )}

              {/* Campo de entrada de texto */}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeStyles.inputBg,
                    color: themeStyles.textColor,
                    borderColor: themeStyles.border,
                  },
                ]}
                multiline={true}
                numberOfLines={6}
                value={review}
                onChangeText={setReview}
                placeholder="Escreva sua opinião..."
                placeholderTextColor={themeStyles.subText}
                textAlignVertical="top"
                editable={!loading}
              />

              {/* Ações do Rodapé */}
              <View style={styles.footer}>
                <Pressable
                  style={[
                    styles.button,
                    styles.buttonCancel,
                    { backgroundColor: themeStyles.buttonCancelBg },
                  ]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: themeStyles.textColor },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.button,
                    styles.buttonSave,
                    { backgroundColor: themeStyles.tintColor },
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonSaveText}>Salvar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: {
    width: "100%",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    height: 120,
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  buttonCancel: {},
  buttonSave: {},
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
