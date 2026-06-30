// Componente: Modal de edição de nome da lista via PATCH /api/mediaList/{id}/name
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { MediaListOwnerResponseDto } from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface EditMediaListNameModalProps {
  visible: boolean;
  currentName: string;
  listId: number;
  onClose: () => void;
  onSuccess: (updatedList: MediaListOwnerResponseDto) => void;
}

export default function EditMediaListNameModal({
  visible,
  currentName,
  listId,
  onClose,
  onSuccess,
}: EditMediaListNameModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setError(null);
    }
  }, [visible, currentName]);

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
    if (!name.trim()) {
      setError("O nome da lista não pode ficar vazio.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<MediaListOwnerResponseDto>(
        `/api/mediaList/${listId}/name`,
        { newName: name.trim() }
      );
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const normalized = err as NormalizedError;
      setError(normalized.message || "Erro ao salvar o nome da lista.");
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
        <View style={[styles.backdrop, { backgroundColor: themeStyles.backdrop }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={[styles.modalCard, { backgroundColor: themeStyles.modalBackground }]}>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeStyles.textColor }]}>
                  Editar Nome da Lista
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
                value={name}
                onChangeText={setName}
                placeholder="Nome da lista..."
                placeholderTextColor={themeStyles.subText}
                editable={!loading}
              />

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
    height: 48,
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
