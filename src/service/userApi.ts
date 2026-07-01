import { authFetch } from "./api";

export type MediaMin = {
  id: string;
  title: string;
  artist: string;
  type: string;
  coverUrl: string;
};

export type ArtistMin = {
  spotifyID: string;
  name: string;
  profilePictureURL: string;
};

export type RatingResponse = {
  id: number;
  rating: number;
  review?: string;
};

export type MediaListResponse = {
  id: number;
  name: string;
};

export type UserProfile = {
  id: number;
  name: string;
  profilePic: string | null;
  bio: string | null;

  role: string;
  whoCanComment: string;

  creationDate: string;
  estaAtivo: boolean;

  followersCount: number;
  followingCount: number;

  favoriteAlbum: MediaMin | null;
  favoriteMusic: MediaMin | null;
  favoriteArtist: ArtistMin | null;
  currentUserIsFollowing: boolean;
};

export type UserMin = {
  id: number;
  name: string;
};

export type UserUpdatePerfilRequest = {
  name?: string;
  bio?: string;
  profilePic?: string | null;
  whoCanComment?: string;
};

export async function getUserById(userId: number): Promise<UserProfile> {
  const response = await authFetch(`/users/${userId}`);

  if (!response.ok) {
    throw new Error(`Erro ao carregar usuário: ${response.status}`);
  }

  return response.json();
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await authFetch("/users/me");

  if (!response.ok) {
    throw new Error(`Erro ao carregar perfil: ${response.status}`);
  }

  return response.json();
}

export async function followUser(friendId: number): Promise<void> {
  const response = await authFetch(`/users/follow/${friendId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Erro ao seguir usuário: ${response.status}`);
  }
}

export async function unfollowUser(friendId: number): Promise<void> {
  const response = await authFetch(`/users/follow/${friendId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erro ao deixar de seguir usuário: ${response.status}`);
  }
}

export async function getFollowers(userId: number): Promise<UserMin[]> {
  const response = await authFetch(`/users/${userId}/followers`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar seguidores: ${response.status}`);
  }

  return response.json();
}

export async function getFollowing(userId: number): Promise<UserMin[]> {
  const response = await authFetch(`/users/${userId}/following`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar seguindo: ${response.status}`);
  }

  return response.json();
}

export async function updateMyProfile(
  data: UserUpdatePerfilRequest,
): Promise<UserProfile> {
  const response = await authFetch("/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar perfil: ${response.status}`);
  }

  return response.json();
}

export async function deleteMyAccount(): Promise<void> {
  const response = await authFetch("/users/me", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erro ao excluir conta: ${response.status}`);
  }
}
