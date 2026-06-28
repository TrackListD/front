// Tela: Criar Nova Lista — formulário Frontend-First para POST /api/mediaList
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/api";
import {
  ListType,
  MediaListOwnerResponseDto,
  Privacy,
} from "@/src/types/mediaList";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateMediaListScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Form states
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [whoCanSee, setWhoCanSee] = useState<Privacy>("PUBLIC");
  const [typeOfList, setTypeOfList] = useState<ListType>("ALBUM");

  // Fetch / Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Theme configuration
  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    inputBg: isDark ? "#151719" : "#FFFFFF",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    errorBg: isDark ? "#2A1818" : "#FEF2F2",
    errorText: isDark ? "#F87171" : "#B91C1C",
    selectedBg: isDark ? "#1E293B" : "#E0F2FE",
  };

  const handleSubmit = async () => {
    if (!listName.trim()) {
      setSubmitError("O nome da lista é obrigatório.");
      return;
    }
    if (!typeOfList) {
      setSubmitError("O tipo da lista é obrigatório.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // FUTURA INTEGRAÇÃO: Enviar 'description' quando o backend for atualizado.
    // FUTURA INTEGRAÇÃO: Enviar 'tags' quando o backend suportar categorias/tags.
    const payload = {
      typeOfList,
      listName: listName.trim(),
      isFavorite: false,
      whoCanSee,
      mediaIds: [],
    };

    try {
      const response = await apiClient.post<MediaListOwnerResponseDto>(
        "/api/mediaList",
        payload,
      );

      router.replace(`/media-lists/${response.data.publicData.id}` as Href);
    } catch (err) {
      const normalized = err as NormalizedError;
      setSubmitError(normalized.message || "Erro ao criar a lista de mídias.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPrivacyOption = (
    value: Privacy,
    label: string,
    icon: "public" | "people" | "lock",
  ) => {
    const isSelected = whoCanSee === value;
    return (
      <Pressable
        onPress={() => setWhoCanSee(value)}
        disabled={submitting}
        style={[
          styles.selectorButton,
          {
            borderColor: isSelected
              ? themeStyles.tintColor
              : themeStyles.border,
            backgroundColor: isSelected
              ? themeStyles.selectedBg
              : themeStyles.cardBackground,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={18}
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

  const renderTypeOption = (
    value: ListType,
    label: string,
    icon: "album" | "music-note",
  ) => {
    const isSelected = typeOfList === value;
    return (
      <Pressable
        onPress={() => setTypeOfList(value)}
        disabled={submitting}
        style={[
          styles.selectorButton,
          {
            borderColor: isSelected
              ? themeStyles.tintColor
              : themeStyles.border,
            backgroundColor: isSelected
              ? themeStyles.selectedBg
              : themeStyles.cardBackground,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={18}
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <Stack.Screen
        options={{
          title: "Criar Lista",
          headerStyle: { backgroundColor: themeStyles.cardBackground },
          headerTintColor: themeStyles.textColor,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Nome da Lista */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeStyles.subText }]}>
              Nome da Lista
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: themeStyles.inputBg,
                  color: themeStyles.textColor,
                  borderColor: themeStyles.border,
                },
              ]}
              placeholder="Ex: Meus Álbuns Favoritos"
              placeholderTextColor={themeStyles.subText}
              value={listName}
              onChangeText={setListName}
              editable={!submitting}
            />
          </View>

          {/* Tipo da Lista (Álbum ou Música) */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeStyles.subText }]}>
              Tipo de Conteúdo
            </Text>
            <View style={styles.selectorRow}>
              {renderTypeOption("ALBUM", "Álbum", "album")}
              {renderTypeOption("MUSIC", "Música", "music-note")}
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeStyles.subText }]}>
              Descrição
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                {
                  backgroundColor: themeStyles.inputBg,
                  color: themeStyles.textColor,
                  borderColor: themeStyles.border,
                },
              ]}
              placeholder="Fale um pouco sobre o objetivo desta lista..."
              placeholderTextColor={themeStyles.subText}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
            />
          </View>

          {/* Privacidade */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeStyles.subText }]}>
              Privacidade
            </Text>
            <View style={styles.selectorRow}>
              {renderPrivacyOption("PUBLIC", "Público", "public")}
              {renderPrivacyOption("JUST_FOLLOWERS", "Seguidores", "people")}
              {renderPrivacyOption("PRIVATE", "Privado", "lock")}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeStyles.subText }]}>
              Tags
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: themeStyles.inputBg,
                  color: themeStyles.textColor,
                  borderColor: themeStyles.border,
                },
              ]}
              placeholder="Ex: rock, anos 90, favoritos (separadas por vírgula)"
              placeholderTextColor={themeStyles.subText}
              value={tags}
              onChangeText={setTags}
              editable={!submitting}
            />
          </View>

          {/* Exibição do erro inline */}
          {submitError && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: themeStyles.errorBg,
                  borderColor: themeStyles.errorText,
                },
              ]}
            >
              <MaterialIcons
                name="error-outline"
                size={20}
                color={themeStyles.errorText}
                style={styles.errorIcon}
              />
              <Text
                style={[styles.errorText, { color: themeStyles.errorText }]}
              >
                {submitError}
              </Text>
            </View>
          )}

          {/* Botão de Envio */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: themeStyles.tintColor },
              pressed && styles.pressed,
              submitting && styles.disabledButton,
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Criar Lista de Mídias</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectorRow: {
    flexDirection: "row",
    gap: 10,
  },
  selectorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  errorIcon: {
    flexShrink: 0,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});
