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
import { FeedItem } from "../../types/feed";
import { authFetch, toggleLike } from "../service/api";
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
          "Não foi possível conectar ao backend. Verifique se o servidor está rodando e na mesma rede Wi-Fi.",
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

      // Atualização otimista: muda a UI imediatamente, antes da resposta do servidor
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

        // Sincroniza com o valor real retornado pelo servidor
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

        // Rollback: desfaz a mudança otimista, já que a requisição falhou
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

  const renderStars = (rating: number) => {
    const starsCount = Math.floor(rating);
    return Array.from({ length: starsCount }).map((_, index) => (
      <Text key={index} style={styles.starText}>
        ★
      </Text>
    ));
  };

  const renderPostItem = ({ item }: { item: FeedItem }) => {
    const displayUsername = item.author.username
      ? `@${item.author.username}`
      : `@usuario_${item.author.id}`;
    const displayName = item.author.username
      ? item.author.username
      : `Usuário ${item.author.id}`;

    // Imagens estáticas via fallback seguro para evitar falha de carregamento HTTP externa
    const defaultAvatar = "https://avatar.iran.liara.run/public/30";
    const albumTitle = "Abbey Road";
    const albumArtist = "The Beatles";
    const albumCover =
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300";

    return (
      <View style={styles.postContainer}>
        {/* Cabeçalho do Post */}
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: defaultAvatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userHandle}>
              {displayUsername} • {formatTimeAgo(item.publicationDate)}
            </Text>
          </View>
        </View>

        {/* Card do Álbum */}
        <View style={styles.albumCard}>
          <Image
            source={{ uri: albumCover }}
            style={styles.albumCover}
            resizeMode="cover"
          />
          <View style={styles.albumInfo}>
            <Text style={styles.albumTitle} numberOfLines={1}>
              {albumTitle}
            </Text>
            <Text style={styles.albumArtist} numberOfLines={1}>
              {albumArtist}
            </Text>
            <View style={styles.starsContainer}>
              {renderStars(item.rating)}
            </View>
          </View>
        </View>

        {/* Conteúdo/Comentário da Avaliação */}
        <Text style={styles.commentText}>{item.content}</Text>

        {/* Barra de Interações baseada nos dados da API */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12161A",
  },
  center: {
    flex: 1,
    backgroundColor: "#12161A",
    justifyContent: "center",
    alignItems: "center",
  },
  centerEmpty: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
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
  userTextContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userHandle: {
    fontSize: 13,
    color: "#8A8A8F",
    marginTop: 2,
  },
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
  albumInfo: {
    marginLeft: 14,
    flex: 1,
    justifyContent: "center",
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: "#8A8A8F",
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starText: {
    color: "#FFCC00",
    fontSize: 14,
    marginRight: 2,
  },
  commentText: {
    fontSize: 15,
    color: "#E1E1E6",
    lineHeight: 22,
    marginBottom: 16,
  },
  interactionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 28,
  },
  actionText: {
    color: "#8A8A8F",
    fontSize: 14,
    marginLeft: 6,
  },
});
