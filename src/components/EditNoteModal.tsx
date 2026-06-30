// Componente: Modal de edição de nota — permite ao dono alterar a nota da avaliação via PATCH /api/ratings/{id}/note
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { RatingOwnerResponseDto } from "@/src/types/rating";
import { StarRating } from "./StarRating";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface EditNoteModalProps {
  visible: boolean;
  onClose: () => void;
  currentNote: number;
  ratingId: number;
  onSuccess: (updatedRating: RatingOwnerResponseDto) => void;
}

export default function EditNoteModal({
  visible,
  onClose,
  currentNote,
  ratingId,
  onSuccess,
}: EditNoteModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [note, setNote] = useState(currentNote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sincroniza o estado com a propriedade quando o modal é aberto
  useEffect(() => {
    if (visible) {
      setNote(currentNote);
      setError(null);
      setValidationError(null);
    }
  }, [visible, currentNote]);

  const themeStyles = {
    backdrop: "rgba(0, 0, 0, 0.5)",
    modalBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    buttonCancelBg: isDark ? "#2A2D31" : "#F1F3F5",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
    starColor: "#FFC107",
  };

  const handleSave = async () => {
    if (note <= 0) {
      setValidationError("A nota de avaliação deve ser maior que zero.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<RatingOwnerResponseDto>(
        `/api/ratings/${ratingId}/note`,
        { newRatingNote: note }
      );
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const normalized = err as NormalizedError;
      setError(normalized.message || "Erro ao salvar a nota.");
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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: themeStyles.backdrop }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, { backgroundColor: themeStyles.modalBackground }]}>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeStyles.textColor }]}>
                  Editar Nota
                </Text>
                <Pressable onPress={onClose} disabled={loading} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={themeStyles.textColor} />
                </Pressable>
              </View>

              {/* Alerta de erro */}
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: themeStyles.errorBg }]}>
                  <Text style={[styles.errorText, { color: themeStyles.errorText }]}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Área de Estrelas */}
              <View style={styles.starsWrapper}>
                <StarRating
                  rating={note}
                  onChange={(val) => {
                    setNote(val);
                    setValidationError(null);
                  }}
                  disabled={loading}
                  filledColor={themeStyles.starColor}
                  emptyColor={themeStyles.subText}
                  size={36}
                />
                <Text style={[styles.noteText, { color: themeStyles.textColor }]}>
                  {note.toFixed(1)} / 5.0
                </Text>
              </View>

              {/* Erro de validação inline */}
              {validationError && (
                <View
                  style={[
                    styles.validationErrorContainer,
                    {
                      backgroundColor: themeStyles.errorBg,
                      borderColor: themeStyles.errorText,
                    },
                  ]}
                >
                  <MaterialIcons name="error-outline" size={20} color={themeStyles.errorText} style={{ marginRight: 8 }} />
                  <Text style={[styles.validationErrorText, { color: themeStyles.errorText }]}>
                    {validationError}
                  </Text>
                </View>
              )}

              {/* Ações do Rodapé */}
              <View style={styles.footer}>
                <Pressable
                  style={[styles.button, styles.buttonCancel, { backgroundColor: themeStyles.buttonCancelBg }]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: themeStyles.textColor }]}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonSave, { backgroundColor: themeStyles.tintColor }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonSaveText}>Confirmar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
  modalCard: {
    width: "100%",
    maxWidth: 360,
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
    marginBottom: 20,
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
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  starsWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 18,
    fontWeight: "700",
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
  validationErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  validationErrorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
