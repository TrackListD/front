import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FeedItem } from "../types/feed";

type PostCardProps = {
  item: FeedItem;
  currentUserId?: number;
  onToggleLike: (postId: number) => void;
  onFollow: (authorId: number) => void;
  onReport: (postId: number, authorId: number) => void;
};

const defaultAvatar =
  "https://vivaacidadenews.com.br/wp-content/uploads/2026/01/SAMUEL-12-media-scaled-e1769187444520-1200x650.jpg";
const defaultCover =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300";

function formatTimeAgo(dateString: string) {
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
}

function renderStars(rating: number | null) {
  if (!rating) return null;
  const starsCount = Math.floor(rating);
  return Array.from({ length: starsCount }).map((_, index) => (
    <Text key={index} style={styles.starText}>
      ★
    </Text>
  ));
}

export default function PostCard({
  item,
  currentUserId,
  onToggleLike,
  onFollow,
  onReport,
}: PostCardProps) {
  const router = useRouter();

  // Controla se o botão "Seguir" ainda deve ser renderizado.
  // Só vira false depois que a animação de saída termina.
  const [followButtonVisible, setFollowButtonVisible] = useState(true);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleFollowPress = () => {
    onFollow(item.author.id);

    Animated.sequence([
      // 1. Pulse: cresce rápido
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 120,
        useNativeDriver: true,
      }),
      // 2. Encolhe e desaparece junto
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setFollowButtonVisible(false);
    });
  };

  const displayName = item.author.name
    ? item.author.name
    : `Usuário ${item.author.id}`;
  const displayUsername = item.author.name
    ? `@${item.author.name.toLowerCase().replace(" ", "")}`
    : `@usuario_${item.author.id}`;

  const userAvatar = item.author.profilePic
    ? item.author.profilePic
    : defaultAvatar;

  const goToAuthorProfile = () => {
    router.push(`/profile/${item.author.id}` as Href);
  };

  // Funções de navegação direta por ID
  const goToRatingDetails = () => {
    router.push(`/ratings/${item.id}` as Href);
  };

  const goToMediaListDetails = () => {
    router.push(`/media-lists/${item.id}` as Href);
  };

  return (
    <View style={styles.postContainer}>
      {/* Cabeçalho do Post */}
      <View style={styles.userInfoContainer}>
        <TouchableOpacity onPress={goToAuthorProfile}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userTextContainer}
          onPress={goToAuthorProfile}
        >
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userHandle}>
            {displayUsername} • {formatTimeAgo(item.publicationDate)}
          </Text>
        </TouchableOpacity>

        {followButtonVisible &&
          !item.authorFollowedByAuthUser &&
          item.author.id !== currentUserId && (
            <Animated.View
              style={{
                marginLeft: "auto",
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }}
            >
              <TouchableOpacity
                style={styles.followButton}
                onPress={handleFollowPress}
              >
                <Text style={styles.followButtonText}>Seguir</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
      </View>

      {/* 1. VISUALIZAÇÃO: SE FOR AVALIAÇÃO DE MÍDIA COMPARTILHADA (RATING) */}
      {item.type === "RATING" && item.media && (
        <TouchableOpacity onPress={goToRatingDetails} activeOpacity={0.7}>
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
                {item.media.artist ? item.media.artist : "Artista Desconhecido"}
              </Text>
              <View style={styles.starsContainer}>
                {renderStars(item.rating)}
              </View>
            </View>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </TouchableOpacity>
      )}

      {/* 2. VISUALIZAÇÃO CAPRICHADA: SE FOR COMPARTILHAMENTO DE LISTA (MEDIA_LIST) */}
      {item.type === "MEDIA_LIST" &&
        (() => {
          const mediaItems = item.mediaList ?? [];
          const previewCovers = mediaItems.slice(0, 4);
          const previewTracks = mediaItems.slice(0, 2);
          const remainingCount = mediaItems.length - previewTracks.length;

          return (
            <TouchableOpacity
              style={styles.playlistCardContainer}
              onPress={goToMediaListDetails}
              activeOpacity={0.8}
            >
              <View style={styles.playlistHeaderRow}>
                <View style={styles.playlistIconBadge}>
                  <Ionicons name="musical-notes" size={16} color="#1DB954" />
                  <Text style={styles.playlistBadgeText}>LISTA DE MÍDIAS</Text>
                </View>
              </View>

              <Text style={styles.playlistTitleText}>{item.content}</Text>

              <View style={styles.playlistPreviewBody}>
                {/* Grid de Capas Reais (com fallback genérico) */}
                <View style={styles.playlistGridCovers}>
                  {previewCovers.length > 0 ? (
                    previewCovers.map((media, index) => (
                      <Image
                        key={media.id ?? index}
                        source={{
                          uri: media.coverUrl ? media.coverUrl : defaultCover,
                        }}
                        style={styles.gridImageSquare}
                      />
                    ))
                  ) : (
                    <View
                      style={[
                        styles.gridImageSquare,
                        {
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#2C353F",
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Ionicons name="disc-outline" size={24} color="#8A8A8F" />
                    </View>
                  )}
                </View>

                {/* Informações da Tracklist Simplificada */}
                <View style={styles.playlistTracksPreview}>
                  {previewTracks.length > 0 ? (
                    <>
                      {previewTracks.map((media, index) => (
                        <View
                          key={media.id ?? index}
                          style={styles.trackRowMini}
                        >
                          <Text style={styles.trackNumberMini}>
                            {index + 1}
                          </Text>
                          <Text style={styles.trackNameMini} numberOfLines={1}>
                            {media.title ? media.title : "Mídia Sem Título"}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.viewMoreButtonMini}>
                        <Text style={styles.viewMoreTextMini}>
                          {remainingCount > 0
                            ? `Ver mais ${remainingCount} ${remainingCount === 1 ? "item" : "itens"}`
                            : "Ver tracklist completa"}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={12}
                          color="#1DB954"
                          style={{ marginLeft: 2 }}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.trackNameMini}>Lista vazia</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })()}

      {/* Barra de Interações Global do Post */}
      <View style={styles.interactionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onToggleLike(item.id)}
        >
          <Ionicons
            name={item.likedByMe ? "heart" : "heart-outline"}
            size={20}
            color={item.likedByMe ? "#E0245E" : "#8A8A8F"}
          />
          <Text
            style={[styles.actionText, item.likedByMe && { color: "#E0245E" }]}
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

        <TouchableOpacity 
          style={[styles.actionButton, { marginLeft: "auto", marginRight: 0 }]}
          onPress={() => onReport(item.id, item.author.id)}
        >
          <Ionicons name="flag-outline" size={18} color="#8A8A8F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

  interactionsContainer: { flexDirection: "row", alignItems: "center" },
  actionButton: { flexDirection: "row", alignItems: "center", marginRight: 28 },
  actionText: { color: "#8A8A8F", fontSize: 14, marginLeft: 6 },

  
});
