// Componente: Modal de edição de privacidade — permite ao dono alterar a visibilidade da avaliação via PATCH /ratings/{id}/privacy
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/api";
import { RatingOwnerResponseDto } from "@/src/types/rating";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type PrivacyOption = "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";

interface EditPrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  currentPrivacy: PrivacyOption;
  ratingId: number;
  onSuccess: (updatedRating: RatingOwnerResponseDto) => void;
}

export default function EditPrivacyModal({
  visible,
  onClose,
  currentPrivacy,
  ratingId,
  onSuccess,
}: EditPrivacyModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [privacy, setPrivacy] = useState<PrivacyOption>(currentPrivacy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza o estado com a propriedade quando o modal é aberto
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
    buttonCancelBg: isDark ? "#2A2D31" : "#F1F3F5",
    segmentedBg: isDark ? "#151719" : "#F1F3F5",
    segmentedActiveBg: isDark ? "#2C2F33" : "#FFFFFF",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
  };

  const visibilityOptions = [
    { value: "PUBLIC", label: "Público", icon: "public" },
    { value: "JUST_FOLLOWERS", label: "Seguidores", icon: "people" },
    { value: "PRIVATE", label: "Privado", icon: "lock" },
  ] as const;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<RatingOwnerResponseDto>(
        `/ratings/${ratingId}/privacy`,
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[styles.backdrop, { backgroundColor: themeStyles.backdrop }]}
        >
          <TouchableWithoutFeedback>
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

              {/* Seletor Segmentado (Padrão visual do whoCanSee em create.tsx) */}
              <View style={styles.segmentedWrapper}>
                <View
                  style={[
                    styles.segmentedContainer,
                    { backgroundColor: themeStyles.segmentedBg },
                  ]}
                >
                  {visibilityOptions.map((opt) => {
                    const isSelected = privacy === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        disabled={loading}
                        onPress={() => setPrivacy(opt.value)}
                        style={[
                          styles.segmentedItem,
                          isSelected && [
                            styles.segmentedItemActive,
                            { backgroundColor: themeStyles.segmentedActiveBg },
                          ],
                        ]}
                      >
                        <MaterialIcons
                          name={opt.icon}
                          size={16}
                          color={
                            isSelected
                              ? themeStyles.tintColor
                              : themeStyles.subText
                          }
                          style={styles.segmentedIcon}
                        />
                        <Text
                          style={[
                            styles.segmentedText,
                            {
                              color: isSelected
                                ? themeStyles.textColor
                                : themeStyles.subText,
                            },
                            isSelected && styles.segmentedTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
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
  segmentedWrapper: {
    marginBottom: 24,
  },
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    height: 44,
  },
  segmentedItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  segmentedItemActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedIcon: {
    marginRight: 6,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: "500",
  },
  segmentedTextActive: {
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
