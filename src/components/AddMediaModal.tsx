// Componente: Modal de busca do Spotify com Debounce e vínculo de mídia via POST /mediaList/{id}/medias/{mediaId}
import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient, { authFetch, NormalizedError } from "@/src/service/api";
import { MediaListOwnerResponseDto } from "@/src/types/mediaList";
import { SpotifyItemDto, SpotifySearchResponseDTO } from "@/src/types/spotify";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

interface AddMediaModalProps {
  visible: boolean;
  listId: number;
  typeOfList: "ALBUM" | "MUSIC";
  onClose: () => void;
  onSuccess: (updatedList: MediaListOwnerResponseDto) => void;
}

export default function AddMediaModal({
  visible,
  listId,
  typeOfList,
  onClose,
  onSuccess,
}: AddMediaModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Estados exigidos pelo escopo
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyItemDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Estados locais adicionais para feedback visual por item
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Limpa os estados ao abrir/fechar o modal
  useEffect(() => {
    if (visible) {
      setQuery("");
      setResults([]);
      setIsSearching(false);
      setIsAdding(false);
      setAddedItems({});
      setAddingItemId(null);
    }
  }, [visible]);

  // Implementação de Debounce de 500ms
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        // Usa authFetch diretamente, igual ao searchService — em vez de
        // apiClient.get, que não estava autenticando a chamada corretamente.
        const response = await authFetch(
          `/search?q=${encodeURIComponent(query.trim())}`,
          { method: "GET" },
        );

        if (!response.ok) {
          throw new Error(`Erro na busca: ${response.statusText}`);
        }

        const data: SpotifySearchResponseDTO = await response.json();

        if (typeOfList === "MUSIC") {
          setResults(data.tracks?.items || []);
        } else if (typeOfList === "ALBUM") {
          setResults(data.albums?.items || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Erro ao buscar no Spotify:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, typeOfList]);

  const themeStyles = {
    backdrop: "rgba(0, 0, 0, 0.6)",
    modalBackground: isDark ? "#1D1F22" : "#FFFFFF",
    textColor: isDark ? "#ECEDEE" : "#11181C",
    subText: isDark ? "#9BA1A6" : "#687076",
    border: isDark ? "#2C2F33" : "#E4E7EB",
    inputBg: isDark ? "#151719" : "#F8F9FA",
    tintColor: isDark ? "#10B981" : "#10B981", // Verde para o botão de adicionar
    successText: "#10B981",
    cardBg: isDark ? "#151719" : "#F8F9FA",
  };

  const handleAddMedia = async (item: SpotifyItemDto) => {
    setIsAdding(true);
    setAddingItemId(item.id);
    try {
      // OBS: mesma lógica do baseURL — sem repetir "/api" aqui.
      const response = await apiClient.post<MediaListOwnerResponseDto>(
        `/mediaList/${listId}/medias/${item.id}`,
      );
      onSuccess(response.data);
      // Mudar ícone temporariamente para indicar sucesso
      setAddedItems((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [item.id]: false }));
      }, 2000);
    } catch (err) {
      const normalized = err as NormalizedError;
      Alert.alert(
        "Erro",
        normalized.message || "Não foi possível adicionar esta mídia.",
      );
    } finally {
      setIsAdding(false);
      setAddingItemId(null);
    }
  };

  const renderSpotifyItem = ({ item }: { item: SpotifyItemDto }) => {
    const isItemAdding = addingItemId === item.id;
    const isItemAdded = !!addedItems[item.id];
    const artistName =
      item.artists && item.artists.length > 0
        ? item.artists[0].name
        : "Artista desconhecido";
    const coverUrl =
      item.images && item.images.length > 0
        ? item.images[0].url
        : item.cover_url && item.cover_url.length > 0
          ? item.cover_url[0].url
          : null;

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.border,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flex: 1,
            marginRight: 12,
          }}
        >
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={{ width: 40, height: 40, borderRadius: 6 }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                backgroundColor: isDark ? "#2A2D31" : "#E4E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons
                name={typeOfList === "ALBUM" ? "album" : "music-note"}
                size={20}
                color={themeStyles.textColor}
              />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text
              style={[styles.itemTitle, { color: themeStyles.textColor }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.itemSubtitle, { color: themeStyles.subText }]}
              numberOfLines={1}
            >
              {artistName}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => handleAddMedia(item)}
          disabled={isAdding}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: isItemAdded
                ? "#10B981"
                : isDark
                  ? "#2A2D31"
                  : "#E4E7EB",
            },
            pressed && styles.pressed,
          ]}
        >
          {isItemAdding ? (
            <ActivityIndicator
              size="small"
              color={isDark ? "#ECEDEE" : "#11181C"}
            />
          ) : isItemAdded ? (
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
          ) : (
            <MaterialIcons name="add" size={20} color={themeStyles.textColor} />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.backdrop, { backgroundColor: themeStyles.backdrop }]}
      >
        {/* Área vazia acima do card: tocar aqui fecha o teclado, mas não bloqueia o TextInput abaixo */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

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
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeStyles.textColor }]}>
                {typeOfList === "MUSIC"
                  ? "Adicionar Músicas"
                  : "Adicionar Álbum"}
              </Text>
              <Pressable
                onPress={onClose}
                disabled={isAdding}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={themeStyles.textColor}
                />
              </Pressable>
            </View>

            {/* Campo de Busca */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: themeStyles.inputBg,
                  borderColor: themeStyles.border,
                },
              ]}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={themeStyles.subText}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.input, { color: themeStyles.textColor }]}
                value={query}
                onChangeText={setQuery}
                placeholder={
                  typeOfList === "MUSIC"
                    ? "Buscar músicas no Spotify..."
                    : "Buscar álbuns no Spotify..."
                }
                placeholderTextColor={themeStyles.subText}
                editable={!isAdding}
                autoCorrect={false}
                autoFocus
              />
              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={themeStyles.textColor}
                  style={styles.loaderIcon}
                />
              )}
            </View>

            {/* Lista de Resultados */}
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderSpotifyItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                !isSearching && query.trim() !== "" ? (
                  <View style={styles.emptyContainer}>
                    <Text
                      style={[styles.emptyText, { color: themeStyles.subText }]}
                    >
                      Nenhum resultado encontrado.
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    height: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  closeButton: {
    padding: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
    paddingVertical: 0,
  },
  loaderIcon: {
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  itemSubtitle: {
    fontSize: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
