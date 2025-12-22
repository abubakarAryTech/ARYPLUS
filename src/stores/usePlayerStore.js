import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set) => ({
      currentVideo: null,
      playbackTime: 0,
      volume: 1,
      isMuted: false,
      isPlaying: false,
      quality: 'auto',
      playbackRate: 1,

      setCurrentVideo: (videoData) => {
        set({ currentVideo: videoData, playbackTime: 0, isPlaying: false });
      },

      updatePlaybackTime: (time) => {
        set({ playbackTime: time });
      },

      setVolume: (level) => {
        set({ volume: Math.max(0, Math.min(1, level)) });
      },

      toggleMute: () => {
        set(state => ({ isMuted: !state.isMuted }));
      },

      setMuted: (muted) => {
        set({ isMuted: muted });
      },

      setPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setQuality: (quality) => {
        set({ quality });
      },

      setPlaybackRate: (rate) => {
        set({ playbackRate: rate });
      },

      reset: () => {
        set({ currentVideo: null, playbackTime: 0, isPlaying: false });
      }
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({ 
        volume: state.volume,
        isMuted: state.isMuted,
        quality: state.quality,
        playbackRate: state.playbackRate
      })
    }
  )
);
