/**
 * Vendored from whatauth-sdk/core (WhatauthWorkerClient)
 * Uses only native fetch + WebSocket — zero external dependencies.
 */

// --- Error types ---
export class WhatauthError extends Error {
  code: string;
  statusCode?: number;
  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'WhatauthError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, WhatauthError.prototype);
  }
}

class NetworkError extends WhatauthError {
  constructor(message = 'Network error') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

class AuthenticationError extends WhatauthError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTHENTICATION_FAILED', 401);
    this.name = 'AuthenticationError';
  }
}

// --- Types ---
export interface AuthResponse {
  success: boolean;
  verified: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  error?: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface WhatauthWorkerConfig {
  apiUrl: string;
  clientId: string;
  tenantSlug: string;
}

export interface WhatauthWorkerCallbacks {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: WhatauthError) => void;
  onExpired?: () => void;
  onPinRegistered?: (loginCode: string, expiresIn: number) => void;
  onAuthCodeIssued?: (authCode: string, expiresIn: number) => void;
}

// --- PKCE helpers ---
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256Base64Url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Client ---
export class WhatauthWorkerClient {
  private config: WhatauthWorkerConfig;
  private callbacks: WhatauthWorkerCallbacks = {};
  private ws: WebSocket | null = null;
  private sdkSessionJwt: string | null = null;
  private codeVerifier: string | null = null;
  private currentAuthCode: string | null = null;

  constructor(config: WhatauthWorkerConfig) {
    this.config = config;
  }

  setCallbacks(callbacks: WhatauthWorkerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /** 1) Handshake: obtain sdk_session_jwt */
  async initSession(): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_WHATAUTH_ES}/sdk/session/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.clientId,
        tenant_slug: this.config.tenantSlug,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Session init failed: ${res.status} ${err}`);
    }
    const { sdk_session_jwt } = await res.json();
    if (!sdk_session_jwt) throw new Error('Missing sdk_session_jwt');
    this.sdkSessionJwt = sdk_session_jwt;
  }

  /** 2) Open WebSocket with the session token */
  async connectWebSocket(): Promise<void> {
    if (!this.sdkSessionJwt) throw new Error('Session not initialized');
    const wsUrl = new URL('/ws', process.env.NEXT_PUBLIC_BACKEND_WHATAUTH_ES);
    wsUrl.searchParams.set('tenant_slug', this.config.tenantSlug);
    wsUrl.searchParams.set('token', this.sdkSessionJwt);
    this.ws = new WebSocket(wsUrl.toString());
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);
      this.ws!.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      this.ws!.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch {
          // ignore parse errors
        }
      };
      this.ws!.onclose = () => {};
      this.ws!.onerror = () => {
        clearTimeout(timeout);
        this.callbacks.onError?.(new NetworkError('WebSocket error'));
        reject(new NetworkError('WebSocket error'));
      };
    });
  }

  private handleMessage(msg: { type: string; loginCode?: string; expiresIn?: number; auth_code?: string; error?: string }) {
    switch (msg.type) {
      case 'pin_registered':
        this.callbacks.onPinRegistered?.(msg.loginCode!, msg.expiresIn!);
        break;
      case 'pin_expired':
        this.callbacks.onExpired?.();
        break;
      case 'auth_code_issued':
        this.currentAuthCode = msg.auth_code!;
        this.callbacks.onAuthCodeIssued?.(msg.auth_code!, msg.expiresIn!);
        break;
      case 'error':
        this.callbacks.onError?.(new AuthenticationError(msg.error || 'Unknown error'));
        break;
      default:
    }
  }

  /** 3) Register a PIN (generates PKCE code_challenge) */
  async registerPin(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    this.codeVerifier = generateCodeVerifier();
    const codeChallenge = await sha256Base64Url(this.codeVerifier);
    this.ws.send(
      JSON.stringify({
        type: 'register_pin',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        code_verifier: this.codeVerifier,
      })
    );
  }

  /** Cancel auth (optional) */
  cancelAuth(loginCode: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'cancel_auth', loginCode }));
  }

  /** 4) Exchange auth_code + code_verifier for login_proof_jwt */
  async exchangeAuthCode(): Promise<AuthResponse> {
    if (!this.currentAuthCode || !this.codeVerifier || !this.sdkSessionJwt) {
      throw new Error('Missing auth_code or verifier');
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_WHATAUTH_ES}/sdk/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdkSessionJwt}`,
      },
      body: JSON.stringify({
        auth_code: this.currentAuthCode,
        code_verifier: this.codeVerifier,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Token exchange failed: ${res.status} ${err}`);
    }
    const { login_proof_jwt } = await res.json();
    if (!login_proof_jwt) throw new Error('Missing login_proof_jwt');
    const payload = JSON.parse(atob(login_proof_jwt.split('.')[1]));
    const user: User = {
      id: payload.sub || 'unknown',
      name: payload.name || 'Usuario',
      phone: payload.phone,
    };
    const authResponse: AuthResponse = {
      success: true,
      verified: true,
      token: login_proof_jwt,
      user,
    };
    this.callbacks.onSuccess?.(authResponse);
    return authResponse;
  }

  /** Disconnect WebSocket */
  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.sdkSessionJwt = null;
    this.codeVerifier = null;
    this.currentAuthCode = null;
  }
}
