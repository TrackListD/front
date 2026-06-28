import {
  searchService,
  SpotifySearchResponseDTO,
} from "@/src/service/searchApi";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchIndexProps {
  navigation: any;
}

export default function SearchIndex({ navigation }: SearchIndexProps) {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SpotifySearchResponseDTO | null>(null);

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

  const handleItemPress = (item: any) => {
    const displayName = item.name;

    // Pegando a imagem com a mesma lógica do renderItem
    const imageUrl = item.coverURL || item.profilePictureURL || "";

    // Pegando o artista padrão se for track ou album
    const artistName = item.artists?.[0]?.name || "";

    if (item.type === "artist") {
      // Mantém a navegação antiga se for artista (ou ajuste para a rota do expo-router se necessário)
      navigation.navigate("artist/[id]", { id: item.id, name: displayName });
    } else {
      // Redireciona para a rota de criação de avaliação usando Expo Router
      // Passando exatamente os parâmetros esperados pela CreateRatingScreen
      router.push({
        pathname: "/ratings/create", // Ajuste o caminho exato da sua pasta de rotas se for diferente (ex: "/review/create")
        params: {
          targetId: item.id,
          title: displayName,
          coverUrl: imageUrl,
          artist: artistName,
        },
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    console.log(`[${item.type}]`, JSON.stringify(item, null, 2));
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

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : { uri: "https://via.placeholder.com/150" }
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
});
