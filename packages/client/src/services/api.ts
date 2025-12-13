import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('anvago-auth');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authData = localStorage.getItem('anvago-auth');
        if (authData) {
          const { state } = JSON.parse(authData);
          if (state?.refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: state.refreshToken,
            });

            const { tokens } = response.data.data;
            
            // Update stored tokens
            const newState = {
              ...state,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            };
            localStorage.setItem('anvago-auth', JSON.stringify({ state: newState }));

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth
        localStorage.removeItem('anvago-auth');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const onboardingAPI = {
  getQuestions: () =>
    api.get('/onboarding/questions'),
  
  getVibes: (city: string = 'Danang') =>
    api.get(`/onboarding/vibes?city=${city}`),
  
  getWeather: (city: string = 'Danang') =>
    api.get(`/onboarding/weather?city=${city}`),
  
  getContext: (city: string = 'Danang') =>
    api.get(`/onboarding/context?city=${city}`),
  
  submit: (answers: any) =>
    api.post('/onboarding/submit', answers),
};

export const locationsAPI = {
  getAll: (params?: { city?: string; category?: string; page?: number }) =>
    api.get('/locations', { params }),
  
  getById: (id: string) =>
    api.get(`/locations/${id}`),
  
  search: (query: string, city?: string) =>
    api.get('/locations/search', { params: { q: query, city } }),
  
  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get('/locations/nearby', { params: { lat, lng, radius } }),
};

export const itinerariesAPI = {
  getAll: () =>
    api.get('/itineraries'),

  getById: (id: string) =>
    api.get(`/itineraries/${id}`),

  create: (data: any) =>
    api.post('/itineraries', data),

  update: (id: string, data: any) =>
    api.put(`/itineraries/${id}`, data),

  delete: (id: string) =>
    api.delete(`/itineraries/${id}`),

  optimize: (id: string, criterion: string) =>
    api.post(`/itineraries/${id}/optimize`, { criterion }),

  localize: (id: string) =>
    api.post(`/itineraries/${id}/localize`),

  // Template methods
  getTemplates: (city: string = 'Danang') =>
    api.get('/itineraries/templates', { params: { city } }),

  getSuggestedTemplates: (params: {
    city?: string;
    personas?: string[];
    vibes?: string[];
    budget?: string;
    interests?: string[];
    duration?: number;
  }) =>
    api.get('/itineraries/templates/suggested', {
      params: {
        city: params.city || 'Danang',
        personas: params.personas?.join(','),
        vibes: params.vibes?.join(','),
        budget: params.budget,
        interests: params.interests?.join(','),
        duration: params.duration,
      },
    }),

  duplicate: (id: string) =>
    api.post(`/itineraries/${id}/duplicate`),
};

export const tripsAPI = {
  getAll: () =>
    api.get('/trips'),
  
  getById: (id: string) =>
    api.get(`/trips/${id}`),
  
  create: (itineraryId: string, startDate: string) =>
    api.post('/trips', { itineraryId, startDate }),
  
  update: (id: string, data: any) =>
    api.put(`/trips/${id}`, data),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/trips/${id}/status`, { status }),
  
  logEvent: (id: string, event: any) =>
    api.post(`/trips/${id}/events`, event),
};

export const integrationsAPI = {
  getGrabEstimate: (from: any, to: any) =>
    api.post('/integrations/grab/estimate', { from, to }),
  
  bookGrab: (data: any) =>
    api.post('/integrations/grab/book', data),
  
  searchBookings: (params: any) =>
    api.get('/integrations/booking/search', { params }),
  
  searchActivities: (params: any) =>
    api.get('/integrations/klook/search', { params }),
};

export const adminAPI = {
  getStats: () =>
    api.get('/admin/stats'),
  
  getUsers: () =>
    api.get('/admin/users'),
  
  getLocations: () =>
    api.get('/admin/locations'),
  
  updateDemoState: (state: any) =>
    api.post('/admin/demo-state', state),
  
  reseedDatabase: () =>
    api.post('/admin/reseed'),
};

export default api;
