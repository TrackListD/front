import axios from "axios";
import { router } from "expo-router";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

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

// eslint-disable-next-line import/no-named-as-default-member
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Proceed without authorization header if token resolution fails
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    let normalizedError: NormalizedError;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown> | null | undefined;
      const errors: string[] = data && Array.isArray(data.errors)
        ? data.errors.map((e) => String(e))
        : [];

      let message = "";
      if (status === 401) {
        message = "Sua sessão expirou. Por favor, faça login novamente.";
      } else if (status === 403) {
        message = "Você não tem permissão para realizar esta ação.";
      } else if (status === 404) {
        message = "Recurso não encontrado.";
      } else {
        const dataMessage = data && typeof data.message === "string" ? data.message : "";
        const dataStatus = data && typeof data.status === "string" ? data.status : "";
        message = dataMessage || errors.join(", ") || dataStatus || "Erro interno do servidor.";
      }

      normalizedError = {
        status,
        message,
        errors,
      };

      if (status === 401) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Erro ao fazer logout:", signOutError);
        }
        router.replace("/login");
      }
    } else {
      normalizedError = {
        status: 0,
        message: "Erro de conexão. Verifique sua internet.",
        errors: ["Erro de conexão. Verifique sua internet."],
      };
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
