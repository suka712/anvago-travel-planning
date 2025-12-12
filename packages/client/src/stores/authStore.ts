import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isPremium: boolean;
  isAdmin?: boolean;
  subscriptionTier?: 'free' | 'premium';
}

// Helper to check authentication
export const useIsAuthenticated = () => {
  const { user, accessToken } = useAuthStore();
  return !!user && !!accessToken;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeToPremium: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: false,
      isLoading: false,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      loadUser: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          set({ isInitialized: true });
          return;
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isInitialized: true, isAuthenticated: true });
        } catch {
          // Token invalid, clear auth state
          set({ 
            user: null, 
            accessToken: null, 
            refreshToken: null, 
            isInitialized: true,
            isAuthenticated: false,
          });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data.data;
          
          set({ 
            user, 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false,
            isAuthenticated: true,
          });
          
          api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { user, tokens } = response.data.data;
          
          set({ 
            user, 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false,
            isAuthenticated: true,
          });
          
          api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null,
          isAuthenticated: false,
        });
        delete api.defaults.headers.common['Authorization'];
      },

      upgradeToPremium: async () => {
        try {
          const response = await api.post('/users/me/upgrade');
          set({ user: { ...get().user!, isPremium: true, ...response.data.data } });
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'anvago-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

