import axios from "axios";
import { signOut } from "next-auth/react";
import { authService, UserInfo } from "./auth";

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
    let token = authService.getStoredToken();
    
    // If we don't have a token, try to get one
    if (!token) {
      const externalId = localStorage.getItem("externalId");
      const ssoToken = localStorage.getItem("accessToken");
      
      if (externalId) {
        // First, try to get SSO user info if we have an SSO token
        let ssoUserInfo: UserInfo | null = null;
        if (ssoToken) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SSO_BASE_URL}/users/me`, {
              headers: {
                'Authorization': `Bearer ${ssoToken}`,
              },
            });
            if (response.ok) {
              const ssoData = await response.json();
              ssoUserInfo = {
                id: ssoData.id,
                externalId: ssoData.id,
                email: ssoData.email,
                firstName: ssoData.firstName,
                lastName: ssoData.lastName,
              };
            }
          } catch (error) {
            console.error("Failed to fetch SSO user info:", error);
          }
        }
        
        // Try to get a valid token, potentially creating the user if needed
        token = await authService.getValidToken(externalId, ssoUserInfo || undefined);
      }
    }
    
    // Add the token to the request if we have one
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
    
    // Only retry once for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const externalId = typeof window !== "undefined" ? localStorage.getItem("externalId") : null;
      const ssoToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      if (externalId) {
        try {
          // First try to refresh the token
          await authService.refreshToken();
          let token = authService.getStoredToken();
          
          // If refresh failed, try to get a new token
          if (!token) {
            // Get SSO user info if we have an SSO token
            let ssoUserInfo: UserInfo | null = null;
            if (ssoToken) {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SSO_BASE_URL}/users/me`, {
                  headers: {
                    'Authorization': `Bearer ${ssoToken}`,
                  },
                });
                if (response.ok) {
                  const ssoData = await response.json();
                  ssoUserInfo = {
                    id: ssoData.id,
                    externalId: ssoData.id,
                    email: ssoData.email,
                    firstName: ssoData.firstName,
                    lastName: ssoData.lastName,
                  };
                }
              } catch (error) {
                console.error("Failed to fetch SSO user info:", error);
              }
            }
            
            // Get a new token, potentially creating the user
            token = await authService.getValidToken(externalId, ssoUserInfo || undefined);
          }
          
          if (token) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return APP_API(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          authService.logout();
          
          // Only sign out if we can't recover
          if (!originalRequest._retryWithoutAuth) {
            await signOut({ callbackUrl: "/api/auth/signin" });
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export { SSO_API, APP_API };
