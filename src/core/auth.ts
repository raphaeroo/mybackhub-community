interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface TokenPayload {
  sub: string;
  externalId: string;
  email: string;
  iat: number;
  exp: number;
}

interface VerifyResponse {
  valid: boolean;
  payload: TokenPayload;
}

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  externalId: string;
}

interface CreateUserRequest {
  externalId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  private apiBaseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('api_access_token');
      const expiry = localStorage.getItem('api_token_expiry');
      this.tokenExpiry = expiry ? parseInt(expiry) : null;
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry * 1000;
  }

  private setToken(tokenData: TokenResponse): void {
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = Math.floor(Date.now() / 1000) + tokenData.expires_in;
  }

  private clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api_access_token');
      localStorage.removeItem('api_token_expiry');
    }
  }

  async getToken(externalId: string): Promise<TokenResponse | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ externalId }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't exist, return null to trigger user creation
          return null;
        }
        throw new Error(`Token request failed: ${response.status}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.setToken(tokenData);
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('api_access_token', tokenData.access_token);
        localStorage.setItem('api_token_expiry', String(Math.floor(Date.now() / 1000) + tokenData.expires_in));
      }
      
      return tokenData;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  async refreshToken(): Promise<TokenResponse> {
    if (!this.accessToken) {
      throw new Error('No token available to refresh');
    }

    const response = await fetch(`${this.apiBaseUrl}auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: this.accessToken }),
    });

    if (!response.ok) {
      this.clearToken();
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokenData: TokenResponse = await response.json();
    this.setToken(tokenData);
    return tokenData;
  }

  async verifyToken(): Promise<VerifyResponse> {
    if (!this.accessToken) {
      throw new Error('No token available to verify');
    }

    const response = await fetch(`${this.apiBaseUrl}auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`Token verification failed: ${response.status}`);
    }

    return response.json();
  }

  async getValidToken(externalId?: string, ssoUserInfo?: UserInfo): Promise<string | null> {
    // First try to use existing valid token
    if (this.accessToken && !this.isTokenExpired()) {
      try {
        await this.verifyToken();
        return this.accessToken;
      } catch {
        console.warn('Token verification failed, attempting refresh');
      }
    }

    // Try to refresh expired token
    if (this.accessToken) {
      try {
        await this.refreshToken();
        return this.accessToken;
      } catch {
        console.warn('Token refresh failed, clearing token');
        this.clearToken();
      }
    }

    // Try to get new token with externalId
    if (externalId) {
      const tokenResponse = await this.getToken(externalId);
      
      if (!tokenResponse && ssoUserInfo) {
        // Token failed because user doesn't exist, create user first
        const created = await this.createUser(ssoUserInfo);
        if (created) {
          // Try to get token again after user creation
          const newTokenResponse = await this.getToken(externalId);
          return newTokenResponse ? this.accessToken : null;
        }
      }
      
      return tokenResponse ? this.accessToken : null;
    }

    return null;
  }

  getStoredToken(): string | null {
    return this.accessToken;
  }

  async createUser(userInfo: UserInfo): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalId: userInfo.externalId,
          username: `${userInfo.firstName}_${userInfo.externalId}`,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
        } as CreateUserRequest),
      });

      if (!response.ok) {
        console.error('Failed to create user:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create user:', error);
      return false;
    }
  }

  async getUserInfo(token: string): Promise<UserInfo | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch user info:', response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }

  logout(): void {
    this.clearToken();
  }
}

export const authService = new AuthService();
export type { TokenResponse, TokenPayload, VerifyResponse, UserInfo, CreateUserRequest };