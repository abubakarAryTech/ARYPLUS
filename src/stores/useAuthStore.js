import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    // Basic login logic - you can expand this
    set({ 
      user: { email }, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },
  
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user 
    });
  }
}));