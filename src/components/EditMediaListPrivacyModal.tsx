// Componente: Modal de edição de privacidade da lista via PATCH /mediaList/{id}/privacy
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/api";
import { MediaListOwnerResponseDto, Privacy } from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface EditMediaListPrivacyModalProps {
  visible: boolean;
  currentPrivacy: Privacy;
  listId: number;
  onClose: () => void;
  onSuccess: (updatedList: MediaListOwnerResponseDto) => void;
}

export default function EditMediaListPrivacyModal({
  visible,
  currentPrivacy,
  listId,
  onClose,
  onSuccess,
}: EditMediaListPrivacyModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [privacy, setPrivacy] = useState<Privacy>(currentPrivacy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPrivacy(currentPrivacy);
      setError(null);
    }
  }, [visible, currentPrivacy]);

  const themeStyles = {
    backdrop: "rgba(0, 0, 0, 0.5)",
    modalBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    selectedBg: isDark ? "#1E293B" : "#E0F2FE",
    buttonCancelBg: isDark ? "#2A2D31" : "#F1F3F5",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<MediaListOwnerResponseDto>(
        `/mediaList/${listId}/privacy`,
        { newPrivacy: privacy },
      );
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const normalized = err as NormalizedError;
      setError(normalized.message || "Erro ao salvar a privacidade.");
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    value: Privacy,
    label: string,
    icon: "public" | "people" | "lock",
  ) => {
    const isSelected = privacy === value;
    return (
      <Pressable
        onPress={() => setPrivacy(value)}
        disabled={loading}
        style={[
          styles.selectorButton,
          {
            borderColor: isSelected
              ? themeStyles.tintColor
              : themeStyles.border,
            backgroundColor: isSelected
              ? themeStyles.selectedBg
              : themeStyles.modalBackground,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={isSelected ? themeStyles.tintColor : themeStyles.subText}
        />
        <Text
          style={[
            styles.selectorButtonText,
            {
              color: isSelected ? themeStyles.tintColor : themeStyles.textColor,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[styles.backdrop, { backgroundColor: themeStyles.backdrop }]}
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
              Editar Privacidade
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

          {/* Opções de Privacidade */}
          <View style={styles.selectorColumn}>
            {renderOption("PUBLIC", "Público", "public")}
            {renderOption("JUST_FOLLOWERS", "Seguidores", "people")}
            {renderOption("PRIVATE", "Privado", "lock")}
          </View>

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
                style={[styles.buttonText, { color: themeStyles.textColor }]}
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
      </View>
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
  selectorColumn: {
    gap: 10,
    marginBottom: 24,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  selectorButtonText: {
    fontSize: 14,
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
});
