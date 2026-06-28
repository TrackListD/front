import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authFetch } from "../../src/service/api"; // Ajuste o caminho do seu import

interface AlbumData {
  spotifyID: string;
  name: string;
  releaseDate: string;
  imageUrl: string;
}

interface ArtistData {
  artist: {
    spotifyID: string;
    name: string;
    profilePictureURL: string;
  };
  albums: AlbumData[];
}

export default function ArtistScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArtistData();
    }
  }, [id]);

  const fetchArtistData = async () => {
    try {
      const response = await authFetch(`/artists/${id}`);

      if (response.ok) {
        const data = await response.json();
        setArtist(data);
      } else {
        const errorText = await response.text();
        console.error(`Erro na API: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Erro fatal na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D2DF" />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro ao carregar artista.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={{
          uri:
            artist.artist.profilePictureURL ||
            "https://via.placeholder.com/600x300",
        }}
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.3 }}
      />

      <View style={styles.profileSection}>
        <Image
          source={{ uri: artist.artist.profilePictureURL }}
          style={styles.artistImage}
        />
        <Text style={styles.artistName}>{artist.artist.name}</Text>

        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite ? styles.favoriteButtonActive : null,
          ]}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color="#FFF"
          />
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? "Favoritado" : "Favoritar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.albumsSection}>
        <Text style={styles.sectionTitle}>Álbuns</Text>
        <View style={styles.albumsGrid}>
          {artist.albums?.map((album) => {
            const releaseYear = album.releaseDate
              ? album.releaseDate.split("-")[0]
              : "N/A";

            return (
              <View key={album.spotifyID} style={styles.albumCard}>
                <Image
                  source={{ uri: album.imageUrl }}
                  style={styles.albumCover}
                />
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {album.name}
                </Text>
                <View style={styles.albumFooter}>
                  <Text style={styles.albumYear}>{releaseYear}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0C",
  },
  errorText: { color: "#FFF" },
  container: { flex: 1, backgroundColor: "#0A0A0C" },
  headerBackground: { width: "100%", height: 180, backgroundColor: "#111" },
  profileSection: {
    alignItems: "center",
    marginTop: -60,
    paddingHorizontal: 20,
  },
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#0A0A0C",
  },
  artistName: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 15,
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00D2DF",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 24,
    marginTop: 15,
    gap: 8,
  },
  favoriteButtonActive: { backgroundColor: "#333" },
  favoriteButtonText: { color: "#FFF", fontWeight: "bold" },
  albumsSection: { marginTop: 40, paddingHorizontal: 20 },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  albumsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  albumCard: { width: "47%", marginBottom: 20 },
  albumCover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#222",
  },
  albumTitle: { color: "#FFF", marginTop: 8, fontWeight: "600" },
  albumFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  albumYear: { color: "#888", fontSize: 12 },
});
