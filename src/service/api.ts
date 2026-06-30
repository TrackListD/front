import Constants from "expo-constants";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { Platform } from "react-native";
import { waitForAuth } from "../auth/authState";
import { auth } from "./firebase";

export interface ErrorDto {
  timestamp: string;
  codeError: number;
  status: string;
  errors: string[];
}

export interface NormalizedError {
  status: number;
  message: string;
  errors: string[];
}

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
  const user = await waitForAuth();
  if (user) {
    const idToken = await user.getIdToken(true);
    headers.set("Authorization", `Bearer ${idToken}`);
  }
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Lê o corpo de uma Response e monta um NormalizedError, com mensagens
 * genéricas por status (igual ao que o antigo apiClient fazia).
 * Por padronização — mexemos no detalhe das mensagens depois, se precisar.
 */
async function buildNormalizedError(
  response: Response,
): Promise<NormalizedError> {
  const status = response.status;
  let data: Record<string, unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    // corpo vazio ou não-JSON; segue com data = null
  }

  const errors: string[] =
    data && Array.isArray(data.errors) ? data.errors.map((e) => String(e)) : [];

  let message = "";
  if (status === 401) {
    message = "Sua sessão expirou. Por favor, faça login novamente.";
  } else if (status === 403) {
    message = "Você não tem permissão para realizar esta ação.";
  } else if (status === 404) {
    message = "Recurso não encontrado.";
  } else {
    const dataMessage =
      data && typeof data.message === "string" ? data.message : "";
    const dataStatus =
      data && typeof data.status === "string" ? data.status : "";
    message =
      dataMessage ||
      errors.join(", ") ||
      dataStatus ||
      "Erro interno do servidor.";
  }

  if (status === 401) {
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error("Erro ao fazer logout:", signOutError);
    }
    router.replace("/login");
  }

  return { status, message, errors };
}

/**
 * Wrapper sobre authFetch que já faz JSON.parse do corpo e lança um
 * NormalizedError em respostas de erro (status fora de 200–299), no
 * mesmo formato que o antigo apiClient (axios) lançava. Pensado para
 * telas que fazem `try { await apiGet(...) } catch (err) { err as NormalizedError }`.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await authFetch(path, options);
  } catch {
    const connectionError: NormalizedError = {
      status: 0,
      message: "Erro de conexão. Verifique sua internet.",
      errors: ["Erro de conexão. Verifique sua internet."],
    };
    throw connectionError;
  }

  if (!response.ok) {
    throw await buildNormalizedError(response);
  }

  // Algumas respostas (ex: DELETE) podem não ter corpo
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Client com a mesma forma do antigo apiClient (axios): get/post/delete,
 * todos retornando `{ data: T }` e lançando NormalizedError em erro.
 * Por dentro usa fetch nativo (authFetch), não axios.
 */
const apiClient = {
  get: async <T>(path: string): Promise<{ data: T }> => {
    const data = await request<T>(path, { method: "GET" });
    return { data };
  },
  post: async <T>(path: string, body?: unknown): Promise<{ data: T }> => {
    const data = await request<T>(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  delete: async <T>(path: string): Promise<{ data: T }> => {
    const data = await request<T>(path, { method: "DELETE" });
    return { data };
  },
};

export default apiClient;
