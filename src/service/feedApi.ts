import { FeedItem } from "@/types/feed";
import { authFetch } from "./api";

export type LikeResponse = {
  liked: boolean;
  likesCount: number;
};

export async function toggleLike(publicationId: number): Promise<LikeResponse> {
  const response = await authFetch(`/publications/${publicationId}/like`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Falha ao curtir publicação: ${response.status}`);
  }

  return response.json();
}

export async function followUser(friendId: number): Promise<void> {
  const response = await authFetch(`/users/follow/${friendId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Falha ao seguir usuário: ${response.status}`);
  }
}

export async function getUserFeed(userId: number): Promise<FeedItem[]> {
  const response = await authFetch(`/feed/${userId}`);

  if (!response.ok) {
    throw new Error(`Falha ao buscar feed do usuário: ${response.status}`);
  }

  return response.json();
}
