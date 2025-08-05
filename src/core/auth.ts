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
  }

  async getToken(externalId: string): Promise<TokenResponse> {
    const response = await fetch(`${this.apiBaseUrl}auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ externalId }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const tokenData: TokenResponse = await response.json();
    this.setToken(tokenData);
    return tokenData;
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

  async getValidToken(externalId?: string): Promise<string | null> {
    if (this.accessToken && !this.isTokenExpired()) {
      try {
        await this.verifyToken();
        return this.accessToken;
      } catch {
        console.warn('Token verification failed, attempting refresh');
      }
    }

    if (this.accessToken) {
      try {
        await this.refreshToken();
        return this.accessToken;
      } catch {
        console.warn('Token refresh failed, clearing token');
        this.clearToken();
      }
    }

    if (externalId) {
      try {
        await this.getToken(externalId);
        return this.accessToken;
      } catch (error) {
        console.error('Failed to get new token:', error);
      }
    }

    return null;
  }

  getStoredToken(): string | null {
    return this.accessToken;
  }

  logout(): void {
    this.clearToken();
  }
}

export const authService = new AuthService();
export type { TokenResponse, TokenPayload, VerifyResponse };