import { followUser, getUserFeed, toggleLike } from "@/src/service/feedApi";
import { auth } from "@/src/service/firebase";
import { UserProfile } from "@/src/service/userApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PostCard from "../components/PostCard";
import { FeedItem } from "../types/feed";

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

  const [activeTab, setActiveTab] = useState<"reviews" | "lists">("reviews");
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserFeed(user.id);
      setPosts(data);
    } catch (error) {
      console.error("Erro ao buscar feed do usuário:", user.id, error);
      Alert.alert(
        "Erro de Conexão",
        "Não foi possível carregar as publicações deste perfil.",
      );
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUserFeed();
  }, [fetchUserFeed]);

  const handleToggleLike = useCallback(
    async (postId: number) => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: !post.likedByMe,
                likesCount: post.likedByMe
                  ? post.likesCount - 1
                  : post.likesCount + 1,
              }
            : post,
        ),
      );

      try {
        const result = await toggleLike(postId);

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedByMe: result.liked,
                  likesCount: result.likesCount,
                }
              : post,
          ),
        );
      } catch (error) {
        console.error("Erro ao curtir publicação:", postId, error);

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedByMe: !post.likedByMe,
                  likesCount: post.likedByMe
                    ? post.likesCount - 1
                    : post.likesCount + 1,
                }
              : post,
          ),
        );

        Alert.alert(
          "Erro",
          "Não foi possível registrar sua curtida. Tente novamente.",
        );
      }
    },
    [router],
  );

  const handleFollowAuthor = useCallback(
    async (authorId: number) => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.author.id === authorId
            ? { ...post, authorFollowedByAuthUser: true }
            : post,
        ),
      );

      try {
        await followUser(authorId);
      } catch (error) {
        console.error("Erro ao seguir usuário:", authorId, error);

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.author.id === authorId
              ? { ...post, authorFollowedByAuthUser: false }
              : post,
          ),
        );

        Alert.alert("Erro", "Não foi possível seguir este usuário.");
      }
    },
    [router],
  );

  // Filtra a timeline do perfil pelo tipo de publicação por trás das tabs.
  const filteredPosts = useMemo(() => {
    const targetType = activeTab === "reviews" ? "RATING" : "MEDIA_LIST";
    return posts.filter((post) => post.type === targetType);
  }, [posts, activeTab]);

  const reviewsCount = useMemo(
    () => posts.filter((post) => post.type === "RATING").length,
    [posts],
  );

  return (
    <FlatList
      style={styles.container}
      data={filteredPosts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PostCard
          item={item}
          onToggleLike={handleToggleLike}
          onFollow={handleFollowAuthor}
        />
      )}
      ListHeaderComponent={
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/feed/global")}
          >
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
                <Text style={styles.statValue}>{reviewsCount}</Text> reviews •{" "}
                <Text style={styles.statValue}>{user.followersCount ?? 0}</Text>{" "}
                seguidores
              </Text>
            </View>

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

          {/* TABS */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reviews" && styles.activeTabText,
                ]}
              >
                Resenhas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "lists" && styles.activeTab]}
              onPress={() => setActiveTab("lists")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "lists" && styles.activeTabText,
                ]}
              >
                Listas
              </Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator
              size="small"
              color={COLORS.text}
              style={{ marginTop: 24 }}
            />
          )}
        </>
      }
      ListEmptyComponent={
        !loading ? (
          <Text style={styles.emptyText}>
            {activeTab === "reviews"
              ? "Nenhuma resenha publicada ainda."
              : "Nenhuma lista compartilhada ainda."}
          </Text>
        ) : null
      }
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

/* ===================== FAVORITOS ===================== */

function FavoriteCard({ title, item }: { title: string; item: any }) {
  const image =
    item?.coverUrl ||
    item?.profilePictureURL ||
    "https://placehold.co/300x300/2c2c2e/ffffff?text=TrackListd";

  const name = item?.title || item?.name || "Não definido";

  const subtitle =
    item?.artist ||
    (title === "Artista Favorito" ? "Artista" : "Adicione um favorito");

  return (
    <View style={styles.favoriteCard}>
      <Text style={styles.favoriteType}>{title}</Text>

      <Image source={{ uri: image }} style={styles.favoriteImage} />

      <Text style={styles.favoriteName} numberOfLines={2}>
        {name}
      </Text>

      <Text style={styles.favoriteArtist} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  backButton: { marginTop: 60, marginLeft: 16, zIndex: 10 },

  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -10,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#2c2c2e",
  },

  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14,
  },

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

  favoritesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  favoriteCard: {
    width: "31%",
  },

  favoriteType: {
    color: COLORS.accent,
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },

  favoriteImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },

  favoriteName: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
    marginTop: 8,
  },

  favoriteArtist: {
    color: COLORS.textSubtle,
    fontSize: 13,
    marginTop: 2,
  },

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

  tabText: {
    color: COLORS.textSubtle,
    fontSize: 15,
    fontWeight: "600",
  },

  activeTabText: { color: COLORS.text },

  textSubtleError: { color: COLORS.textSubtle, fontSize: 14 },

  emptyText: {
    color: COLORS.textSubtle,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 30,
  },
});
