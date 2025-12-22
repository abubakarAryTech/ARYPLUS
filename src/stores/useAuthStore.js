import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { signInWithGooglev2, signInWithApplev2, sendPasswordResetEmailv2, checkIfUserExistsByEmail, deleteaccount } from '../firebase';
import api from '../services/api';
import { useWatchlistStore } from './useWatchlistStore';
import { useWatchHistoryStore } from './useWatchHistoryStore';
import sessionService from '../services/session';
import logger from '../services/logger';
import DeviceInfo from '../components/DeviceInfo';
import { getUserPlan, deleteUserAccount } from '../services/user';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      displayName: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Enhanced login method
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await signInWithEmailAndPassword(auth, email, password);
          const user = res.user;

          const userData = await get().fetchUserData(user.uid, user);
          set({ 
            user: userData, 
            displayName: userData.displayName || user.email?.split('@')[0] || 'User',
            isAuthenticated: true, 
            isLoading: false 
          });
          
          await get().createSession();
          get().initializeStores(user.uid);
          
          return { success: true, user: userData };
        } catch (err) {
          const message = get().getErrorMessage(err.code);
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Enhanced register method with backend integration
      register: async (email, password, emailVerified = false) => {
        set({ isLoading: true, error: null });
        try {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          const user = res.user;
          
          // Create user in backend
          const deviceInfo = DeviceInfo();
          const device = `${deviceInfo.os.name} ${deviceInfo.os.version}`;
          
          const response = await api.post("/api/v2/member", {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            email: user.email,
            emailVerified,
            authProvider: "local",
            device,
          });

          if (response.data.success) {
            const userData = await get().fetchUserData(user.uid, user);
            set({ user: userData, isAuthenticated: true, isLoading: false });
            
            await get().createSession();
            get().initializeStores(user.uid);
            
            return { 
              success: true, 
              user: userData,
              isNewUser: response.status === 201 
            };
          } else {
            throw new Error("Backend user creation failed");
          }
        } catch (err) {
          const message = get().getErrorMessage(err.code) || err.message;
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Google OAuth authentication
      googleAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithGooglev2();
          if (!result.success) {
            throw new Error(result.message || "Google sign-in failed");
          }

          const user = auth.currentUser;
          const { displayName, email, photoURL, uid, phoneNumber, emailVerified } = user;
          
          const deviceInfo = DeviceInfo();
          const device = `${deviceInfo.os.name} ${deviceInfo.os.version}`;

          const response = await api.post("/api/v2/member", {
            uid,
            displayName,
            photoURL,
            phoneNumber,
            emailVerified: emailVerified || true,
            email,
            authProvider: "google",
            device,
          });

          if (response.data.success) {
            const userData = await get().fetchUserData(uid, user);
            set({ 
              user: userData, 
              displayName: userData.displayName || email?.split('@')[0] || 'User',
              isAuthenticated: true, 
              isLoading: false 
            });
            
            await get().createSession();
            get().initializeStores(uid);
            
            return { 
              success: true, 
              user: userData,
              isNewUser: response.status === 201 
            };
          } else {
            throw new Error("Backend authentication failed");
          }
        } catch (err) {
          const message = err.message || "Google authentication failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Apple OAuth authentication
      appleAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithApplev2();
          if (!result.success) {
            throw new Error(result.message || "Apple sign-in failed");
          }

          const user = auth.currentUser;
          const { displayName, email, photoURL, uid, phoneNumber, emailVerified } = user;
          
          const deviceInfo = DeviceInfo();
          const device = `${deviceInfo.os.name} ${deviceInfo.os.version}`;

          const response = await api.post("/api/v2/member", {
            uid,
            displayName,
            photoURL,
            email,
            emailVerified: emailVerified || true,
            phoneNumber,
            authProvider: "apple",
            device,
          });

          if (response.data.success) {
            const userData = await get().fetchUserData(uid, user);
            set({ 
              user: userData, 
              displayName: userData.displayName || email?.split('@')[0] || 'User',
              isAuthenticated: true, 
              isLoading: false 
            });
            
            await get().createSession();
            get().initializeStores(uid);
            
            return { 
              success: true, 
              user: userData,
              isNewUser: response.status === 201 
            };
          } else {
            throw new Error("Backend authentication failed");
          }
        } catch (err) {
          const message = err.message || "Apple authentication failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Password reset
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const result = await sendPasswordResetEmailv2(email);
          set({ isLoading: false });
          return result;
        } catch (err) {
          const message = err.message || "Password reset failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Check if user exists by email
      checkUserExists: async (email) => {
        try {
          const result = await checkIfUserExistsByEmail(email);
          return result;
        } catch (err) {
          logger.error('Error checking user existence:', err);
          return { success: false, error: err.message };
        }
      },

      // Get user plan and update subscriptions
      getUserPlan: async () => {
        const user = get().user;
        if (!user?.uid) {
          return { success: false, error: 'User not authenticated' };
        }
        
        try {
          const planData = await getUserPlan(user.uid);
          
          if (planData.success && planData.subscriptions) {
            // Convert plan API subscriptions to the format expected by the store
            const subscriptions = planData.subscriptions.reduce((acc, sub) => {
              const now = new Date();
              const expiryDate = new Date(sub.subscription_expiry);
              const timeDiff = expiryDate - now;
              const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
              
              return {
                ...acc,
                [sub.package_id]: {
                  subscription_date: sub.subscription_date,
                  subscription_expiry: sub.subscription_expiry,
                  subscription_status: sub.subscription_status,
                  daysLeft,
                  daysLeftText: daysLeft > 0 ? `${daysLeft} days left` : 'Expired'
                }
              };
            }, {});
            
            // Update user subscriptions in store
            get().updateSubscriptions(subscriptions);
          }
          
          return { success: true, plan: planData };
        } catch (err) {
          logger.error('Error fetching user plan:', err);
          return { success: false, error: err.message };
        }
      },

      // Delete user account
      deleteAccount: async () => {
        const user = get().user;
        if (!user?.uid) {
          return { success: false, error: 'User not authenticated' };
        }
        
        set({ isLoading: true, error: null });
        try {
          
          // Delete from Firebase first
          await deleteUser(auth.currentUser);
          
          // Delete from MongoDB after Firebase succeeds
          try {
            await api.delete(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/v2/member/${user.uid}`);
          } catch (dbError) {
            if (dbError.response?.status !== 404) {
              logger.warn('MongoDB deletion failed:', dbError.message);
            }
          }
          
          await get().logout();
          return { success: true };
        } catch (err) {
          if (err.code === 'auth/requires-recent-login') {
            set({ isLoading: false });
            return { success: false, requiresReauth: true, message: 'For security reasons, please sign in again to confirm account deletion.' };
          }
          const message = err.message || "Account deletion failed";
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Helper method to fetch user data with subscriptions
      fetchUserData: async (uid, firebaseUser) => {
        let memberData = {}; // ensure it's always defined
        try {
          // Fetch member data from database
          const memberResponse = await api.get(`/api/v2/member/${uid}`);
          memberData  = memberResponse.data?.data || {};

          // Fetch subscriptions
          const subscriptionsResponse = await api.get(`/api/v2/subscriptions/user/${uid}`);
          const subscriptions = subscriptionsResponse.data.reduce((acc, sub) => ({
            ...acc,
            [sub.package_id]: {
              subscription_date: sub.subscription_date,
              subscription_expiry: sub.subscription_expiry,
              subscription_status: sub.subscription_status,
              daysLeft: sub.daysLeft,
              daysLeftText: sub.daysLeftText
            }
          }), {});

          // Fetch search history
          const searchHistoryResponse = await api.get(`/api/v2/searchhistory/user/${uid}`);

          return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            subscriptions,
            searchHistory: searchHistoryResponse.data,
            emailVerified: memberData.emailVerified ?? firebaseUser.emailVerified,
            authProvider: memberData.authProvider
          };
        } catch (error) {
          logger.error('Error fetching user data:', error);
          return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            subscriptions: {},
            searchHistory: [],
            emailVerified: memberData.emailVerified ?? firebaseUser.emailVerified,
            authProvider: memberData.authProvider
          };
        }
      },

      // Helper method to create session
      createSession: async () => {
        try {
          const session = await sessionService.createSession();
          if (session) {
            logger.log('✅ Session created successfully:', session._id);
          } else {
            logger.warn('⚠️ Session creation returned null');
          }
        } catch (err) {
          logger.error('❌ Session creation failed:', err);
        }
      },

      // Helper method to initialize other stores
      initializeStores: (uid) => {
        useWatchlistStore.getState().initialize(uid);
        useWatchHistoryStore.getState().initialize(uid);
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      logout: async () => {
        try {
          // Sign out from Firebase
          await signOut(auth);
          logger.log('✅ Firebase signOut successful');
        } catch (error) {
          logger.error('❌ Firebase signOut failed:', error);
        }
        
        sessionService.logoutSession().catch(err => 
          logger.error('Session logout failed:', err)
        );
        
        set({ 
          user: null, 
          displayName: '...', 
          isAuthenticated: false, 
          error: null 
        });
        useWatchlistStore.getState().clear();
        useWatchHistoryStore.getState().clear();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        // Cleanup auth state listener
        if (typeof window !== 'undefined' && window._authStateUnsubscribe) {
          window._authStateUnsubscribe();
          delete window._authStateUnsubscribe;
        }
        
        window.location.href = '/';
      },

      fetchUserInfo: async (uid) => {
        const cacheKey = `user_info_${uid}`;
        const timestampKey = `user_info_${uid}_timestamp`;
        const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
        
        const cached = localStorage.getItem(cacheKey);
        const timestamp = localStorage.getItem(timestampKey);
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          if (age < CACHE_TTL) {
            try {
              const cachedData = JSON.parse(cached);
              set({ displayName: cachedData.displayName });
              logger.log('✅ Using cached user info (no API call)');
              return;
            } catch (e) {
              localStorage.removeItem(cacheKey);
              localStorage.removeItem(timestampKey);
            }
          }
        }
        
        try {
          const response = await api.get(`/api/v2/member/${uid}`);
          const result = response.data;

          if (result.success && result.data.displayName) {
            set({ displayName: result.data.displayName });
            
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
            localStorage.setItem(timestampKey, Date.now().toString());
            logger.log('✅ User info fetched and cached');
          } else {
            const user = get().user;
            set({ displayName: user?.displayName || user?.email?.split('@')[0] || 'Guest' });
          }
        } catch (error) {
          logger.error('Error fetching user info:', error);
          
          if (cached) {
            try {
              const cachedData = JSON.parse(cached);
              set({ displayName: cachedData.displayName });
              logger.log('⚠️ Using cached user info due to API error');
            } catch (e) {
              // Ignore
            }
          }
        }
      },

      updateUserProfile: (updates) => {
        set(state => ({ 
          user: { ...state.user, ...updates },
          displayName: updates.displayName || state.displayName
        }));
      },

      updateSubscriptions: (subscriptions) => {
        set(state => ({ 
          user: { ...state.user, subscriptions } 
        }));
      },

      // Update user subscription data from plan API
      updateUserSubscriptionData: async () => {
        const user = get().user;
        if (!user?.uid) {
          return { success: false, error: 'User not authenticated' };
        }
        
        try {
          const planData = await getUserPlan(user.uid);
          
          if (planData.success && planData.subscriptions) {
            // Convert plan API subscriptions to store format
            const subscriptions = planData.subscriptions.reduce((acc, sub) => {
              const now = new Date();
              const expiryDate = new Date(sub.subscription_expiry);
              const timeDiff = expiryDate - now;
              const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
              
              return {
                ...acc,
                [sub.package_id]: {
                  subscription_date: sub.subscription_date,
                  subscription_expiry: sub.subscription_expiry,
                  subscription_status: sub.subscription_status,
                  daysLeft,
                  daysLeftText: daysLeft > 0 ? `${daysLeft} days left` : 'Expired'
                }
              };
            }, {});
            
            // Update subscriptions in store
            get().updateSubscriptions(subscriptions);
            logger.log('✅ User subscriptions updated from plan API');
            return { success: true, subscriptions };
          }
          
          return { success: true, subscriptions: {} };
        } catch (err) {
          logger.error('Error updating user subscription data:', err);
          return { success: false, error: err.message };
        }
      },

      checkSubscription: (packageId) => {
        const user = get().user;
        return user?.subscriptions?.[packageId] !== undefined;
      },

      getErrorMessage: (code) => {
        const messages = {
          'auth/user-not-found': 'No user found with this email.',
          'auth/wrong-password': 'Incorrect password. Please try again.',
          'auth/invalid-email': 'Invalid email address format.',
          'auth/invalid-credential': 'Invalid email or password.',
          'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
          'auth/weak-password': 'Password should be at least 6 characters.',
          'auth/email-already-in-use': 'Email already exists. Please login or use a different email.'
        };
        return messages[code] || 'Authentication failed. Please try again.';
      },

      initialize: () => {
        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          const currentState = get();
          
          if (firebaseUser) {
            // Firebase has a user
            if (!currentState.isAuthenticated) {
              // Zustand doesn't know about it - restore auth state (hard refresh case)
              logger.log('🔄 Restoring auth state from Firebase');
              
              try {
                const userData = await get().fetchUserData(firebaseUser.uid, firebaseUser);
                set({ 
                  user: userData, 
                  displayName: userData.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  isAuthenticated: true 
                });
                await get().createSession();
                get().initializeStores(firebaseUser.uid);
                logger.log('✅ Auth state restored successfully');
              } catch (error) {
                logger.error('❌ Failed to restore auth state:', error);
              }
            }
          } else {
            // Firebase has no user
            if (currentState.isAuthenticated) {
              // User was logged out - clear Zustand state
              logger.log('🔄 User logged out, clearing auth state');
              set({ user: null, isAuthenticated: false, displayName: null });
              useWatchlistStore.getState().clear();
              useWatchHistoryStore.getState().clear();
            }
          }
        });
        
        // Store unsubscribe function for cleanup
        if (typeof window !== 'undefined') {
          window._authStateUnsubscribe = unsubscribe;
        }
        
        // Check stored user data for backward compatibility
        const storedUser = localStorage.getItem('user') || localStorage.getItem('auth-storage');
        if (storedUser) {
          try {
            let userData;
            if (storedUser.includes('"state"')) {
              // New format from Zustand persist
              const parsed = JSON.parse(storedUser);
              userData = parsed.state?.user;
            } else {
              // Old format
              userData = JSON.parse(storedUser);
            }
            
            if (userData) {
              set({ user: userData, isAuthenticated: true });
              get().fetchUserInfo(userData.uid);
              get().initializeStores(userData.uid);
            }
          } catch (e) {
            logger.error('Failed to parse stored user:', e);
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        displayName: state.displayName
      })
    }
  )
);

// Cross-tab sync for auth state
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-storage' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        const currentState = useAuthStore.getState();
        
        if (data.state.user?.uid !== currentState.user?.uid) {
          useAuthStore.setState({
            user: data.state.user,
            isAuthenticated: data.state.isAuthenticated,
            displayName: data.state.displayName
          });
          
          if (data.state.user?.uid) {
            useWatchlistStore.getState().initialize(data.state.user.uid);
            useWatchHistoryStore.getState().initialize(data.state.user.uid);
          } else {
            useWatchlistStore.getState().clear();
            useWatchHistoryStore.getState().clear();
          }
        }
      } catch (error) {
        logger.error('Auth sync error:', error);
      }
    }
  });
}