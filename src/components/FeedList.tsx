import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import HeaderNavbar from "../../components/HeaderNavbar";
import { FeedItem } from "../../types/feed";
import { authFetch, followUser, toggleLike } from "../service/api";
import { auth } from "../service/firebase";

type FeedListProps = {
  /** Caminho relativo do endpoint, ex: "/feed/global" ou "/feed/me" */
  endpoint: string;
  /** Texto mostrado quando a lista está vazia */
  emptyMessage?: string;
};

export default function FeedList({
  endpoint,
  emptyMessage = "Nenhum post encontrado no momento.",
}: FeedListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchFeed = useCallback(
    async (showLoadingIndicator = true) => {
      try {
        if (showLoadingIndicator) setLoading(true);

        const response = await authFetch(endpoint);

        if (!response.ok) {
          throw new Error("Resposta inválida do servidor");
        }

        const data: FeedItem[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Erro ao buscar feed em:", endpoint, error);
        Alert.alert(
          "Erro de Conexão",
          "Não foi possível conectar ao backend. Verifique se o servidor está rodando.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [endpoint],
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed(false);
  };

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

  const handleFollow = useCallback(
    async (authorId: number) => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      // atualização otimista
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.author.id === authorId
            ? {
                ...post,
                authorFollowedByAuthUser: true,
              }
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
              ? {
                  ...post,
                  authorFollowedByAuthUser: false,
                }
              : post,
          ),
        );

        Alert.alert("Erro", "Não foi possível seguir este usuário.");
      }
    },
    [router],
  );

  const formatTimeAgo = (dateString: string) => {
    try {
      const pubDate = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - pubDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Agora mesmo";
      if (diffMins < 60) return `${diffMins} min atrás`;
      if (diffHours < 24)
        return `${diffHours} ${diffHours === 1 ? "hora" : "horas"} atrás`;

      return pubDate.toLocaleDateString("pt-BR");
    } catch {
      return "Recentemente";
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const starsCount = Math.floor(rating);
    return Array.from({ length: starsCount }).map((_, index) => (
      <Text key={index} style={styles.starText}>
        ★
      </Text>
    ));
  };

  const renderPostItem = ({ item }: { item: FeedItem }) => {
    const displayName = item.author.name
      ? item.author.name
      : `Usuário ${item.author.id}`;
    const displayUsername = item.author.name
      ? `@${item.author.name.toLowerCase().replace(" ", "")}`
      : `@usuario_${item.author.id}`;

    const defaultAvatar =
      "https://vivaacidadenews.com.br/wp-content/uploads/2026/01/SAMUEL-12-media-scaled-e1769187444520-1200x650.jpg";
    const userAvatar = item.author.profilePic
      ? item.author.profilePic
      : defaultAvatar;

    const defaultCover =
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300";

    return (
      <View style={styles.postContainer}>
        {/* Cabeçalho do Post */}
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
            resizeMode="cover"
          />

          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userHandle}>
              {displayUsername} • {formatTimeAgo(item.publicationDate)}
            </Text>
          </View>

          {!item.authorFollowedByAuthUser && (
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => handleFollow(item.author.id)}
            >
              <Text style={styles.followButtonText}>Seguir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 1. VISUALIZAÇÃO: SE FOR AVALIAÇÃO DE MÍDIA COMPARTILHADA (RATING) */}
        {item.type === "RATING" && item.media && (
          <View>
            <View style={styles.albumCard}>
              <Image
                source={{
                  uri: item.media.coverUrl ? item.media.coverUrl : defaultCover,
                }}
                style={styles.albumCover}
                resizeMode="cover"
              />
              <View style={styles.albumInfo}>
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {item.media.title ? item.media.title : "Mídia Sem Título"}
                </Text>
                <Text style={styles.albumArtist} numberOfLines={1}>
                  {item.media.artist
                    ? item.media.artist
                    : "Artista Desconhecido"}
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(item.rating)}
                </View>
              </View>
            </View>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
        )}

        {/* 2. VISUALIZAÇÃO CAPRICHADA: SE FOR COMPARTILHAMENTO DE LISTA (MEDIA_LIST) */}
        {item.type === "MEDIA_LIST" && (
          <View style={styles.playlistCardContainer}>
            <View style={styles.playlistHeaderRow}>
              <View style={styles.playlistIconBadge}>
                <Ionicons name="musical-notes" size={16} color="#1DB954" />
                <Text style={styles.playlistBadgeText}>LISTA DE MÍDIAS</Text>
              </View>
            </View>

            <Text style={styles.playlistTitleText}>{item.content}</Text>

            {/* Layout de Preview da Playlist */}
            <View style={styles.playlistPreviewBody}>
              {/* Grid Simulado de Capas */}
              <View style={styles.playlistGridCovers}>
                <Image
                  source={{ uri: defaultCover }}
                  style={styles.gridImageSquare}
                />
                <View
                  style={[
                    styles.gridImageSquare,
                    {
                      backgroundColor: "#2C353F",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Ionicons name="disc-outline" size={24} color="#8A8A8F" />
                </View>
              </View>

              {/* Informações da Tracklist Simplificada */}
              <View style={styles.playlistTracksPreview}>
                <View style={styles.trackRowMini}>
                  <Text style={styles.trackNumberMini}>1</Text>
                  <Text style={styles.trackNameMini} numberOfLines={1}>
                    Faixa Inicial da Playlist
                  </Text>
                </View>
                <View style={styles.trackRowMini}>
                  <Text style={styles.trackNumberMini}>2</Text>
                  <Text style={styles.trackNameMini} numberOfLines={1}>
                    Próxima música da lista...
                  </Text>
                </View>
                <TouchableOpacity style={styles.viewMoreButtonMini}>
                  <Text style={styles.viewMoreTextMini}>
                    Ver tracklist completa
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={12}
                    color="#1DB954"
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Barra de Interações Global do Post */}
        <View style={styles.interactionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleLike(item.id)}
          >
            <Ionicons
              name={item.likedByMe ? "heart" : "heart-outline"}
              size={20}
              color={item.likedByMe ? "#E0245E" : "#8A8A8F"}
            />
            <Text
              style={[
                styles.actionText,
                item.likedByMe && { color: "#E0245E" },
              ]}
            >
              {item.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={18} color="#8A8A8F" />
            <Text style={styles.actionText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={19} color="#8A8A8F" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navbar posicionada fora da FlatList fixa no topo da tela */}
      <HeaderNavbar />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPostItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.centerEmpty}>
            <Text style={{ color: "#8A8A8F" }}>{emptyMessage}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#12161A" },
  center: {
    flex: 1,
    backgroundColor: "#12161A",
    justifyContent: "center",
    alignItems: "center",
  },
  centerEmpty: { padding: 40, alignItems: "center", justifyContent: "center" },
  listContent: { paddingBottom: 20, flexGrow: 1 },
  postContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.8,
    borderBottomColor: "#1F242A",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2C353F",
  },
  userTextContainer: { marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  userHandle: { fontSize: 13, color: "#8A8A8F", marginTop: 2 },

  // Estilos da Avaliação Tradicional (Rating)
  albumCard: {
    flexDirection: "row",
    backgroundColor: "#181E24",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  albumCover: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#2C353F",
  },
  albumInfo: { marginLeft: 14, flex: 1, justifyContent: "center" },
  albumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  albumArtist: { fontSize: 14, color: "#8A8A8F", marginBottom: 6 },
  starsContainer: { flexDirection: "row" },
  starText: { color: "#FFCC00", fontSize: 14, marginRight: 2 },
  commentText: {
    fontSize: 15,
    color: "#E1E1E6",
    lineHeight: 22,
    marginBottom: 16,
  },

  // Estilos Caprichados da Playlist (MEDIA_LIST)
  playlistCardContainer: {
    backgroundColor: "#182026",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#252F38",
    marginBottom: 16,
  },
  playlistHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  playlistIconBadge: {
    flexDirection: "row",
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  playlistBadgeText: {
    color: "#1DB954",
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  playlistTitleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  playlistPreviewBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  playlistGridCovers: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#12161A",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    padding: 2,
  },
  gridImageSquare: {
    width: "48%",
    height: "48%",
    borderRadius: 2,
  },
  playlistTracksPreview: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  trackRowMini: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  trackNumberMini: {
    color: "#8A8A8F",
    fontSize: 12,
    fontWeight: "bold",
    width: 16,
  },
  trackNameMini: {
    color: "#E1E1E6",
    fontSize: 13,
  },
  viewMoreButtonMini: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewMoreTextMini: {
    color: "#1DB954",
    fontSize: 12,
    fontWeight: "600",
  },
  followButton: {
    marginLeft: "auto",
    backgroundColor: "#1DB954",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },

  followButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  // Barra de Interações Inferior
  interactionsContainer: { flexDirection: "row", alignItems: "center" },
  actionButton: { flexDirection: "row", alignItems: "center", marginRight: 28 },
  actionText: { color: "#8A8A8F", fontSize: 14, marginLeft: 6 },
});
