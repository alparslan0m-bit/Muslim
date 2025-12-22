/**
 * Authentication token management for API requests
 * Supports JWT and session-based authentication
 */

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export class AuthManager {
  /**
   * Save authentication token
   */
  static setToken(token: string, expiryMs?: number): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      if (expiryMs) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expiryMs).toString());
      }
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  }

  /**
   * Get current authentication token
   */
  static getToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      // Check if token has expired
      if (token && expiry && Date.now() > parseInt(expiry)) {
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }

  /**
   * Clear authentication token
   */
  static clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Decode JWT token (basic decoding, doesn't verify signature)
   * Use only for extracting claims, not for validation
   */
  static decodeToken(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if JWT token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  }
}

/**
 * CORS error helper
 */
export class CORSError extends Error {
  constructor(message: string = 'CORS request failed') {
    super(message);
    this.name = 'CORSError';
  }
}

/**
 * Helper to check and handle CORS errors
 */
export function isCORSError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = (error as Error).message;
    return message.includes('fetch') || message.includes('CORS') || message.includes('network');
  }
  return false;
}

/**
 * Request interceptor configuration for future backend integration
 */
export interface RequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  withAuth?: boolean;
}

/**
 * Add authentication headers to request config
 */
export function withAuthHeaders(config: RequestConfig): RequestConfig {
  const token = AuthManager.getToken();
  if (!token) return config;

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}
