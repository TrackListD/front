// src/components/ProfileView.tsx (ou o caminho que preferir)
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { UserProfile } from "../src/service/userApi";

const genericProfilePic = {
  uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
};

const COLORS = {
  bg: "#111214",
  bgSubtle: "#1c1c1e",
  text: "#ffffff",
  textSubtle: "#a1a1a1",
  accent: "#60a5fa",
};

interface ProfileViewProps {
  user: UserProfile;
  isMe: boolean;
  following?: boolean;
  onFollowPress?: () => void;
  onEditPress?: () => void;
}

export function ProfileView({
  user,
  isMe,
  following,
  onFollowPress,
  onEditPress,
}: ProfileViewProps) {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image
          source={
            user.profilePic ? { uri: user.profilePic } : genericProfilePic
          }
          style={styles.avatar}
        />

        <Text style={styles.name}>{user.name}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statLine}>
            <Text style={styles.statValue}>{user.ratings?.length ?? 0}</Text>{" "}
            reviews •{" "}
            <Text style={styles.statValue}>{user.followersCount ?? 0}</Text>{" "}
            seguidores
          </Text>
        </View>

        {/* Condicional de Botão: Editar Perfil vs Seguir */}
        {isMe ? (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.followText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={following ? styles.followingButton : styles.followButton}
            onPress={onFollowPress}
          >
            <Text style={styles.followText}>
              {following ? "Seguindo" : "Seguir"}
            </Text>
          </TouchableOpacity>
        )}

        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <Text style={styles.sectionTitle}>Favoritos</Text>

      <View style={styles.favoritesGrid}>
        <FavoriteCard title="Álbum Favorito" item={user.favoriteAlbum} />
        <FavoriteCard title="Música Favorita" item={user.favoriteMusic} />
        <FavoriteCard title="Artista Favorito" item={user.favoriteArtist} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Resenhas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Estatísticas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        scrollEnabled={false}
        data={user.ratings}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => <ReviewCard rating={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScrollView>
  );
}

// Sub-componentes auxiliares mantidos iguaizinhos
function FavoriteCard({ title, item }: { title: string; item: any }) {
  if (!item) {
    return (
      <View style={styles.favoriteCard}>
        <Text style={styles.favoriteType}>{title}</Text>
        <Text style={styles.textSubtleError}>Nenhum favorito</Text>
      </View>
    );
  }
  const image =
    item.coverUrl ||
    item.profilePictureURL ||
    "https://via.placeholder.com/200";
  const name = item.title || item.name;

  return (
    <View style={styles.favoriteCard}>
      <Text style={styles.favoriteType}>{title}</Text>
      <View style={styles.favoriteContent}>
        <Image source={{ uri: image }} style={styles.favoriteImage} />
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName} numberOfLines={2}>
            {name}
          </Text>
          {item.artist && (
            <Text style={styles.favoriteArtist} numberOfLines={1}>
              {item.artist}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function ReviewCard({ rating }: { rating: any }) {
  const getStars = (count: number) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= count ? "star" : "star-o"}
          size={14}
          color="#FFD700"
          style={{ marginRight: 2 }}
        />,
      );
    }
    return stars;
  };
  const albumImage = rating.coverUrl || "https://via.placeholder.com/200";

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: albumImage }} style={styles.reviewAlbumCover} />
        <View style={styles.reviewInfoMain}>
          <View style={styles.reviewTitleLine}>
            <Text style={styles.reviewAlbumTitle} numberOfLines={1}>
              {rating.title || rating.albumName || "Álbum desconhecido"}
            </Text>
            <Text style={styles.reviewDate}>2d atrás</Text>
          </View>
          <Text style={styles.reviewArtistName}>
            {rating.artistName || "Artista"}
          </Text>
          <View style={styles.starsContainer}>{getStars(rating.rating)}</View>
          {rating.review && (
            <Text style={styles.reviewText} numberOfLines={3}>
              {rating.review}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  backButton: { marginTop: 60, marginLeft: 16, zIndex: 10 },
  header: { alignItems: "center", paddingHorizontal: 20, marginTop: -10 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#2c2c2e",
  },
  name: { color: COLORS.text, fontSize: 22, fontWeight: "700", marginTop: 14 },
  statsContainer: { marginTop: 8, marginBottom: 16 },
  statLine: { color: COLORS.textSubtle, fontSize: 13 },
  statValue: { color: COLORS.accent, fontWeight: "600" },
  bio: {
    color: "#ddd",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 30,
    fontSize: 13,
    lineHeight: 18,
  },
  followButton: {
    marginTop: 10,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followingButton: {
    marginTop: 10,
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3a3a3c",
  },
  editButton: {
    marginTop: 10,
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  followText: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 12,
  },
  favoritesGrid: { paddingHorizontal: 16, gap: 12 },
  favoriteCard: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 12,
    padding: 12,
  },
  favoriteType: { color: COLORS.textSubtle, fontSize: 12, marginBottom: 8 },
  favoriteContent: { flexDirection: "row", alignItems: "center" },
  favoriteImage: { width: 50, height: 50, borderRadius: 8 },
  favoriteInfo: { marginLeft: 12, flex: 1 },
  favoriteName: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  favoriteArtist: { color: COLORS.textSubtle, marginTop: 2, fontSize: 12 },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3c",
    gap: 16,
  },
  tab: { paddingBottom: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { color: COLORS.textSubtle, fontSize: 15, fontWeight: "600" },
  activeTabText: { color: COLORS.text },
  reviewCard: {
    backgroundColor: COLORS.bgSubtle,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  reviewHeader: { flexDirection: "row" },
  reviewAlbumCover: { width: 60, height: 60, borderRadius: 6 },
  reviewInfoMain: { flex: 1, marginLeft: 12 },
  reviewTitleLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAlbumTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
  reviewDate: { color: COLORS.textSubtle, fontSize: 11, marginLeft: 8 },
  reviewArtistName: { color: COLORS.textSubtle, fontSize: 12, marginTop: 2 },
  starsContainer: { flexDirection: "row", marginTop: 6, marginBottom: 8 },
  reviewText: { color: "#ddd", fontSize: 13, lineHeight: 18 },
  textSubtleError: { color: COLORS.textSubtle, fontSize: 14 },
});
