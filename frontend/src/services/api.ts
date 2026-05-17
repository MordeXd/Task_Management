import axios from "axios";
import type { store } from "@/store";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let storeRef: typeof store | null = null;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string) {
  try {
    const { data } = await axios.post(`${baseURL}/api/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const { setTokens } = await import("@/store/authSlice");
    storeRef?.dispatch(
      setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token })
    );
    return data.access_token as string;
  } catch {
    return null;
  }
}

export function setupApiInterceptors(appStore: typeof store) {
  storeRef = appStore;

  api.interceptors.request.use((config) => {
    const state = appStore.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry && storeRef) {
        original._retry = true;
        const refreshToken = storeRef.getState().auth.refreshToken;
        if (refreshToken) {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken(refreshToken);
          }
          const newAccessToken = await refreshPromise;
          refreshPromise = null;
          if (newAccessToken) {
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(original);
          }
          const { logout } = await import("@/store/authSlice");
          storeRef.dispatch(logout());
        }
      }
      return Promise.reject(error);
    }
  );
}

