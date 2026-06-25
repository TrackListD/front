import Constants from "expo-constants";
import { Platform } from "react-native";
import { auth } from "./firebase";

function resolveHost(): string {
  if (Platform.OS === "web") {
    return "localhost";
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  const fallback = Platform.OS === "android" ? "10.0.2.2" : "localhost";

  return debuggerHost
    ? (debuggerHost.split(":").shift() ?? fallback)
    : fallback;
}

export const API_BASE_URL = `http://${resolveHost()}:8080/api`;

/**
 * Faz fetch para a API, injetando automaticamente o ID Token do Firebase
 * no header Authorization quando há um usuário logado.
 *
 * Use para QUALQUER chamada à API (autenticada ou não) — quando não há
 * usuário logado, o header simplesmente não é enviado, e o backend trata
 * a requisição como anônima (igual ao comportamento de /api/feed/global).
 */
export async function authFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  const currentUser = auth.currentUser;
  if (currentUser) {
    const idToken = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${idToken}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

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
