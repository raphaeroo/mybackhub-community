import axios from "axios";
import { signOut } from "next-auth/react";
import { authService } from "./auth";

const SSO_API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SSO_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const APP_API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

SSO_API.interceptors.request.use(
  async (config) => {
    let accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!accessToken) {
      try {
        const response = await fetch("/api/auth/token");
        const { token } = await response.json();

        if (token) {
          accessToken = token;
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", token);
          }
        }
      } catch (error) {
        console.error("Failed to fetch access token:", error);
      }
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

APP_API.interceptors.request.use(
  async (config) => {
    const token = authService.getStoredToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      const externalId = localStorage.getItem("externalId");
      if (externalId) {
        try {
          await authService.getToken(externalId);
          const newToken = authService.getStoredToken();
          if (newToken) {
            config.headers["Authorization"] = `Bearer ${newToken}`;
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
          // await signOut({ callbackUrl: "/api/auth/signin" });
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

SSO_API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }

      await signOut({ callbackUrl: "/api/auth/signin" });
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

APP_API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let externalId: string | null = null;
      if (typeof window !== "undefined") {
        externalId = localStorage.getItem("externalId");
      }

      if (externalId) {
        try {
          await authService.refreshToken();
          const token = authService.getStoredToken();
          if (token) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return APP_API(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          authService.logout();
          await signOut({ callbackUrl: "/api/auth/signin" });
        }
      }
    }
    return Promise.reject(error);
  }
);

export { SSO_API, APP_API };
