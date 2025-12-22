import { create } from 'zustand';

export const useUIStore = create((set) => ({
  searchQuery: '',
  isSearchOpen: false,
  showSplash: true,
  modals: {
    dailyBonus: false,
    share: false,
    playlist: false
  },
  mobileMenuOpen: false,
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  toggleSearch: () => {
    set(state => ({ isSearchOpen: !state.isSearchOpen }));
  },

  openSearch: () => {
    set({ isSearchOpen: true });
  },

  closeSearch: () => {
    set({ isSearchOpen: false, searchQuery: '' });
  },

  setShowSplash: (show) => {
    set({ showSplash: show });
  },

  openModal: (modalName) => {
    set(state => ({ modals: { ...state.modals, [modalName]: true } }));
  },

  closeModal: (modalName) => {
    set(state => ({ modals: { ...state.modals, [modalName]: false } }));
  },

  toggleMobileMenu: () => {
    set(state => ({ mobileMenuOpen: !state.mobileMenuOpen }));
  },

  setWidth: (width) => {
    set({ width });
  }
}));
