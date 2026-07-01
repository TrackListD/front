import PostCard from "@/components/PostCard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import HeaderNavbar from "../../components/HeaderNavbar";
import { FeedItem } from "../../types/feed";
import { authFetch } from "../service/api";
import { followUser, toggleLike } from "../service/feedApi";
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
  const [authLoaded, setAuthLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Firebase carregou:", user?.uid);

      if (user) {
        try {
          const response = await authFetch("/users/me");
          if (response.ok) {
            const data = await response.json();
            setCurrentUserId(data.id);
          }
        } catch (error) {
          console.error("Erro ao buscar usuário atual:", error);
        }
      } else {
        setCurrentUserId(undefined);
      }

      setAuthLoaded(true);
    });

    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!authLoaded) return;

      fetchFeed();

      return () => {};
    }, [authLoaded, fetchFeed]),
  );

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

  const handleReport = useCallback(
    (postId: number, authorId: number) => {
      router.push({
        pathname: "/reportModal",
        params: {
          commentId: postId,
          userTargetId: authorId,
        },
      });
    },
    [router],
  );

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
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUserId={currentUserId}
            onToggleLike={handleToggleLike}
            onFollow={handleFollow}
            onReport={handleReport}
          />
        )}
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
});
