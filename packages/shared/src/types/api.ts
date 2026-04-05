// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: ApiMeta;
  error?: ApiError;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  timestamp?: string;
  requestId?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'EXTERNAL_API_ERROR'
  | 'DATABASE_ERROR';

// Request Types

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth API Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    isPremium: boolean;
    isAdmin?: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface OAuthRequest {
  provider: 'google' | 'facebook';
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Admin API Types

export interface AdminStats {
  users: {
    total: number;
    premium: number;
    newToday: number;
  };
  itineraries: {
    total: number;
    templates: number;
    generated: number;
  };
  trips: {
    total: number;
    active: number;
    completed: number;
  };
  locations: {
    total: number;
    verified: number;
    categories: Record<string, number>;
  };
}

export interface DemoResetResponse {
  success: boolean;
  message: string;
  resetItems: {
    users: number;
    itineraries: number;
    trips: number;
  };
}

