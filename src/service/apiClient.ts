import axios from "axios";
import { router } from "expo-router";
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
  (error) => {
    let normalizedError: NormalizedError;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Partial<ErrorDto> | undefined;
      const errors = Array.isArray(data?.errors) ? data.errors : [];
      const message = errors.join(", ") || data?.status || "Erro interno do servidor.";

      normalizedError = {
        status,
        message,
        errors,
      };

      if (status === 401) {
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
