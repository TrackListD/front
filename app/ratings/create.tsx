// Tela: Criar Avaliação — formulário para criação de uma nova avaliação musical.

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Stack, router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { NormalizedError } from "@/src/service/apiClient";
import { StarRating } from "@/src/components/StarRating";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RatingRequestDto } from "@/src/types/rating";

export default function CreateRatingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Mounting and timer tracking to avoid memory leaks/setting state on unmounted component
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Form State
  const [targetId, setTargetId] = useState("");
  const [ratingNote, setRatingNote] = useState<number>(0);
  const [review, setReview] = useState("");
  const [whoCanSee, setWhoCanSee] = useState<"PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE">("PUBLIC");

  // UX State
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Validation / Error States
  const [validationErrors, setValidationErrors] = useState<{
    targetId?: string;
    ratingNote?: string;
  }>({});
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!targetId.trim()) {
      errors.targetId = "O ID da mídia é obrigatório.";
      isValid = false;
    }

    if (ratingNote <= 0 || ratingNote > 5) {
      errors.ratingNote = "A nota é obrigatória e deve ser entre 0.5 e 5 estrelas.";
      isValid = false;
    } else if (ratingNote % 0.5 !== 0) {
      errors.ratingNote = "A nota deve ser em incrementos de 0.5.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Reset previous errors
    setApiErrors([]);
    setApiErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    const dto: RatingRequestDto = {
      targetId: targetId.trim(),
      ratingNote,
      whoCanSee,
    };

    if (review.trim()) {
      dto.review = review.trim();
    }

    setSubmitting(true);

    try {
      await apiClient.post("/api/ratings", dto);
      
      // Success: Show beautiful confirmation and navigate back
      if (isMountedRef.current) {
        setShowSuccessToast(true);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowSuccessToast(false);
        }
        router.back();
      }, 1500);
    } catch (err) {
      // Capture normalized error
      const normErr = err as NormalizedError;
      
      if (isMountedRef.current) {
        if (normErr.errors && normErr.errors.length > 0) {
          setApiErrors(normErr.errors);
        } else {
          setApiErrorMessage(normErr.message || "Erro inesperado ao salvar sua avaliação.");
        }
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  // Color theme selectors
  const themeStyles = {
    background: isDark ? "#121214" : "#F8F9FA",
    cardBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    inputBorder: isDark ? "#2C2F33" : "#E4E7EB",
    inputBg: isDark ? "#151719" : "#F1F3F5",
    tintColor: isDark ? "#38BDF8" : "#0A7EA4",
    segmentedBg: isDark ? "#151719" : "#F1F3F5",
    segmentedActiveBg: isDark ? "#2C2F33" : "#FFFFFF",
  };

  const visibilityOptions = [
    { value: "PUBLIC", label: "Público", icon: "public" },
    { value: "JUST_FOLLOWERS", label: "Seguidores", icon: "people" },
    { value: "PRIVATE", label: "Privado", icon: "lock" },
  ] as const;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.background }]}>
      <Stack.Screen
        options={{
          title: "Nova Avaliação",
          headerShown: true,
          headerStyle: {
            backgroundColor: themeStyles.cardBackground,
          },
          headerTintColor: themeStyles.textColor,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      />

      {/* Floating Success Toast Banner */}
      {showSuccessToast && (
        <View style={styles.successToast}>
          <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.successToastText}>Avaliação criada com sucesso!</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: themeStyles.cardBackground }]}>
            
            {/* Input targetId */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: themeStyles.textColor }]}>
                ID da Mídia <Text style={styles.requiredStar}>*</Text>
              </Text>
              <Text style={[styles.disclaimerText, { color: themeStyles.subText }]}>
                (Temporário/mock até existir a busca integrada de mídias)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeStyles.inputBg,
                    borderColor: validationErrors.targetId ? "#EF4444" : themeStyles.inputBorder,
                    color: themeStyles.textColor,
                  },
                ]}
                placeholder="Ex: movie_12345"
                placeholderTextColor={isDark ? "#525860" : "#A0A5B0"}
                value={targetId}
                onChangeText={(text) => {
                  setTargetId(text);
                  if (text.trim() && validationErrors.targetId) {
                    setValidationErrors((prev) => ({ ...prev, targetId: undefined }));
                  }
                }}
                editable={!submitting}
              />
              {validationErrors.targetId && (
                <Text style={styles.errorText}>{validationErrors.targetId}</Text>
              )}
            </View>

            {/* Input ratingNote */}
            <View style={styles.fieldContainer}>
              <View style={styles.ratingHeader}>
                <Text style={[styles.label, { color: themeStyles.textColor }]}>
                  Sua Nota <Text style={styles.requiredStar}>*</Text>
                </Text>
                {ratingNote > 0 && (
                  <Text style={[styles.ratingValueText, { color: themeStyles.tintColor }]}>
                    {ratingNote.toFixed(1)} / 5.0
                  </Text>
                )}
              </View>
              
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={ratingNote}
                  onChange={(val) => {
                    setRatingNote(val);
                    if (val > 0 && validationErrors.ratingNote) {
                      setValidationErrors((prev) => ({ ...prev, ratingNote: undefined }));
                    }
                  }}
                  disabled={submitting}
                  size={36}
                  filledColor={themeStyles.tintColor}
                  emptyColor={themeStyles.subText}
                />
              </View>
              {validationErrors.ratingNote && (
                <Text style={styles.errorText}>{validationErrors.ratingNote}</Text>
              )}
            </View>

            {/* Input review */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: themeStyles.textColor }]}>
                Sua Opinião <Text style={[styles.disclaimerText, { color: themeStyles.subText }]}>- Opcional</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  {
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    color: themeStyles.textColor,
                  },
                ]}
                placeholder="Escreva detalhes da sua avaliação sobre esta mídia (opcional)..."
                placeholderTextColor={isDark ? "#525860" : "#A0A5B0"}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={review}
                onChangeText={setReview}
                editable={!submitting}
              />
            </View>

            {/* Input whoCanSee */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: themeStyles.textColor }]}>
                Quem pode ver esta avaliação?
              </Text>
              <View style={[styles.segmentedContainer, { backgroundColor: themeStyles.segmentedBg }]}>
                {visibilityOptions.map((opt) => {
                  const isSelected = whoCanSee === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      disabled={submitting}
                      onPress={() => setWhoCanSee(opt.value)}
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
                        color={isSelected ? themeStyles.tintColor : themeStyles.subText}
                        style={styles.segmentedIcon}
                      />
                      <Text
                        style={[
                          styles.segmentedText,
                          { color: isSelected ? themeStyles.textColor : themeStyles.subText },
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

            {/* API Errors Alert Box */}
            {(apiErrors.length > 0 || apiErrorMessage) && (
              <View style={styles.apiErrorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#EF4444" />
                <View style={styles.apiErrorList}>
                  {apiErrorMessage && <Text style={styles.apiErrorText}>{apiErrorMessage}</Text>}
                  {apiErrors.map((err, i) => (
                    <Text key={i} style={styles.apiErrorText}>
                      • {err}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              disabled={submitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: themeStyles.tintColor },
                submitting && styles.submitButtonDisabled,
                pressed && !submitting && { opacity: 0.8 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Publicar Avaliação</Text>
              )}
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  requiredStar: {
    color: "#EF4444",
  },
  disclaimerText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: -4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  multilineInput: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingValueText: {
    fontSize: 15,
    fontWeight: "700",
  },
  ratingContainer: {
    paddingVertical: 4,
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
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  apiErrorContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: "flex-start",
  },
  apiErrorList: {
    flex: 1,
    gap: 2,
  },
  apiErrorText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "500",
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  successToast: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  successToastText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
