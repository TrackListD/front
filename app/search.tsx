import { authFetch } from "@/src/service/api";
import {
  searchService,
  SpotifySearchResponseDTO,
} from "@/src/service/searchApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  GestureResponderEvent,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchIndexProps {}

interface ActionMenuOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionMenuState {
  item: any;
  x: number;
  y: number;
}

export default function SearchIndex({}: SearchIndexProps) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SpotifySearchResponseDTO | null>(null);
  const [favoritingId, setFavoritingId] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await searchService.executeQuery(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Falha ao buscar mídias:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToReview = (item: any) => {
    const displayName = item.name;
    const imageUrl = item.coverURL || item.profilePictureURL || "";
    const artistName = item.artists?.[0]?.name || "";

    router.push({
      pathname: "/ratings/create",
      params: {
        targetId: item.id,
        title: displayName,
        coverUrl: imageUrl,
        artist: artistName,
      },
    });
  };

  const goToArtist = (item: any) => {
    router.push({
      pathname: "/artist/[id]",
      params: { id: item.id, name: item.name },
    });
  };

  // Mapeia o tipo do item de busca para o campo correto do
  // UserUpdatePerfilRequestDTO no backend (favoriteArtistSpotifyId,
  // favoriteMusicSpotifyId, favoriteAlbumSpotifyId).
  const buildFavoritePayload = (item: any) => {
    if (item.type === "artist") {
      return { favoriteArtistSpotifyId: item.id };
    }
    if (item.type === "track") {
      return { favoriteMusicSpotifyId: item.id };
    }
    if (item.type === "album") {
      return { favoriteAlbumSpotifyId: item.id };
    }
    return null;
  };

  const handleSetFavorite = async (item: any) => {
    const payload = buildFavoritePayload(item);
    if (!payload) return;

    setFavoritingId(item.id);
    try {
      const response = await authFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Falha ao favoritar (status ${response.status})`);
      }

      Alert.alert("Pronto!", `"${item.name}" foi definido como favorito.`);
    } catch (error) {
      console.error("Falha ao definir favorito:", error);
      Alert.alert(
        "Não foi possível favoritar",
        "Tente novamente em alguns instantes.",
      );
    } finally {
      setFavoritingId(null);
    }
  };

  const handleItemPress = (item: any) => {
    if (item.type === "artist") {
      goToArtist(item);
    } else {
      goToReview(item);
    }
  };

  // Abre o menu de ações customizado. Recebe a posição (x, y) de onde o
  // usuário tocou/clicou, para posicionar o menu ali (em vez de centralizado
  // na tela como o Alert nativo faria).
  const openActionMenu = (item: any, x: number, y: number) => {
    setActionMenu({
      item,
      x,
      y,
    });
  };

  const closeActionMenu = () => setActionMenu(null);

  const runMenuAction = (action: () => void) => {
    closeActionMenu();
    action();
  };

  // onLongPress (mobile/touch): não temos coordenadas de mouse, então
  // centralizamos o menu horizontalmente perto do topo da tela.
  const handleItemLongPress = (item: any) => {
    openActionMenu(item, -1, -1);
  };

  // onContextMenu (botão direito do mouse, web/desktop): captura a posição
  // exata do clique e bloqueia o menu de contexto nativo do navegador.
  const handleItemContextMenu = (item: any, event: any) => {
    if (Platform.OS === "web") {
      event.preventDefault?.();
      const x = event.nativeEvent?.pageX ?? event.pageX ?? 0;
      const y = event.nativeEvent?.pageY ?? event.pageY ?? 0;
      openActionMenu(item, x, y);
    }
  };

  const getMenuOptions = (item: any): ActionMenuOption[] => {
    const isArtist = item.type === "artist";

    return [
      isArtist
        ? { label: "Ver artista", onPress: () => goToArtist(item) }
        : { label: "Ver resenha", onPress: () => goToReview(item) },
      {
        label: "Marcar como favorito",
        onPress: () => handleSetFavorite(item),
      },
    ];
  };

  const renderActionMenu = () => {
    if (!actionMenu) return null;

    const options = getMenuOptions(actionMenu.item);

    return (
      <Modal
        transparent
        visible
        animationType="fade"
        onRequestClose={closeActionMenu}
      >
        <Pressable style={styles.menuOverlay} onPress={closeActionMenu}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle} numberOfLines={1}>
              {actionMenu.item.name}
            </Text>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.menuOption,
                  index === options.length - 1 && styles.menuOptionLast,
                ]}
                onPress={() => runMenuAction(option.onPress)}
              >
                <Text style={styles.menuOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    let imageUrl = null;

    imageUrl = item.coverURL || item.profilePictureURL || null;

    const displayTitle = item.name;
    let displaySubtitle = "";

    if (item.type === "track") {
      const artistName = item.artists?.[0]?.name || "Artista";
      displaySubtitle = `Música • ${artistName}`;
    } else if (item.type === "album") {
      const artistName = item.artists?.[0]?.name || "Artista";
      displaySubtitle = `Álbum • ${artistName}`;
    } else {
      displaySubtitle = "Artista";
    }

    const isFavoritingThisItem = favoritingId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
        // @ts-ignore - onContextMenu existe no RN Web (sintetizado a partir do DOM), mas não está nos tipos do RN core
        onContextMenu={(event: GestureResponderEvent) =>
          handleItemContextMenu(item, event)
        }
        delayLongPress={350}
        activeOpacity={0.7}
        disabled={isFavoritingThisItem}
      >
        <Image
          source={
            imageUrl ? { uri: imageUrl } : { uri: "https://placehold.co/150" }
          }
          style={
            item.type === "artist"
              ? styles.cardImageRound
              : styles.cardImageSquare
          }
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {displaySubtitle}
          </Text>
        </View>
        {isFavoritingThisItem && (
          <ActivityIndicator color="#60EFFF" size="small" />
        )}
      </TouchableOpacity>
    );
  };

  const dynamicItems: any[] = [];
  if (results) {
    if (results.tracks?.items) {
      results.tracks.items.forEach((t) =>
        dynamicItems.push({ ...t, type: "track" }),
      );
    }
    if (results.albums?.items) {
      results.albums.items.forEach((a) =>
        dynamicItems.push({ ...a, type: "album" }),
      );
    }
    if (results.artists?.items) {
      results.artists.items.forEach((art) =>
        dynamicItems.push({ ...art, type: "artist" }),
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Explorar</Text>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar álbuns, artistas, músicas..."
          placeholderTextColor="#A8A8B3"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {loading && (
        <ActivityIndicator
          color="#60EFFF"
          size="large"
          style={{ marginVertical: 20 }}
        />
      )}

      <FlatList
        data={dynamicItems}
        keyExtractor={(item) => item.id + item.type}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && query.length > 0 ? (
            <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
          ) : null
        }
      />

      {renderActionMenu()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 16,
  },
  searchBarContainer: {
    backgroundColor: "#202024",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#29292e",
  },
  searchInput: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  cardImageSquare: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  cardImageRound: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cardInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#A8A8B3",
    fontSize: 14,
    fontWeight: "400",
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "85%",
    maxWidth: 420,
    backgroundColor: "#202024",
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#29292e",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  menuTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#29292e",
  },
  menuOption: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  menuOptionText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "500",
  },
  menuOptionLast: {
    paddingBottom: 12,
  },
});
