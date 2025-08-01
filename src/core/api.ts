import axios from "axios";
import { signOut } from "next-auth/react";

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
    let accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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
        // Don't sign out here - let the response interceptor handle 401s
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

SSO_API.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      
      // Clear the stored access token
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      
      // Sign out and redirect to login
      await signOut({ callbackUrl: "/api/auth/signin" });
      
      // Return a rejected promise to stop further processing
      return Promise.reject(error);
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

export { SSO_API, APP_API };
