import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import api from "./services/api";
import logger from "./services/logger";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set Firebase auth persistence to localStorage to maintain sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Firebase persistence setup failed:', error);
});

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

// Legacy session management - use Zustand store instead
const saveUserToSession = (user) => {
  try { window.dispatchEvent(new Event("user-auth-changed")); } catch (_) {}
};

const getUserFromSession = () => {
  const { user } = require('./stores/useAuthStore').useAuthStore.getState();
  return user;
};

const removeUserFromSession = () => {
  try { sessionStorage.removeItem("idTokenOverride"); } catch (_) {}
  try { window.dispatchEvent(new Event("user-auth-changed")); } catch (_) {}
};

// Legacy Apple sign-in - use useAuthStore.appleAuth() instead
const signInWithApple = async (location) => {
  const { appleAuth } = require('./stores/useAuthStore').useAuthStore.getState();
  return await appleAuth();
};

const signInWithApplev2 = async () => {
  try {
    const res = await signInWithPopup(auth, appleProvider);
    const user = res.user;

    return {
      success: true,
      message: "Apple sign-in successful",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified, // Include email verification status
      },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Apple sign-in failed",
      errorCode: err.code || "UNKNOWN_ERROR",
    };
  }
};

// const signInWithGoogle = async (location) => {
//   try {
//     const res = await signInWithPopup(auth, googleProvider);
//     const user = res.user;
//     saveUserToSession(user);

//     const q = query(
//       collection(db, "users"),
//       where("uid", "==", user.uid)
//     );
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       const d_info = DeviceInfo();
//       const os = `${d_info.os.name} ${d_info.os.version}`;
//       await addDoc(collection(db, "users"), {
//         uid: user.uid,
//         name: user.displayName,
//         authProvider: "google",
//         location,
//         email: user.email,
//         plan: "free",
//         phoneNumber: null,
//         device: os,
//         platform: "web",
//       });
//     } else {
//       const userDoc = querySnapshot.docs[0];
//       if (!userDoc.data().name) {
//         const userRef = doc(db, "users", userDoc.id);
//         await updateDoc(userRef, {
//           name: user.displayName,
//         });
//       }
//     }

//     toast.success("Signed in");
//   } catch (err) {
//     toast.error(err.message);
//   }
// };

const signInWithGooglev2 = async () => {
  try {
    // Trigger Google sign-in using Firebase's sign-in popup
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;  // Get the user object from the result of sign-in

    // Save the user data to the session for later use
    // saveUserToSession(user);

    // Return a success response with user details
    return {
      success: true,
      message: "Google sign-in successful",  // Message indicating sign-in was successful
      user: {  // User details to return in the response
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified, // Include email verification status
      },
    };
  } catch (err) {
    // If an error occurs, return a failure response with the error message
    return {
      success: false,
      message: err.message || "Google sign-in failed",  // Error message
      errorCode: err.code || "UNKNOWN_ERROR",  // Error code or "UNKNOWN_ERROR" if no code is provided
    };
  }
};


// const signInWithEmailAndPasswordv2 = async (email, password) => {
//   try {
//     const res = await signInWithEmailAndPassword(auth, email, password);
//     const user = res.user;

//     saveUserToSession(user);

//     return {
//       success: true,
//       message: "Sign in successful",
//       user: {
//         uid: user.uid,
//         email: user.email,
//         displayName: user.displayName,
//       },
//     };
//   } catch (err) {
//     // Handle Firebase authentication errors gracefully
//     const errorMessage = err.message || "An error occurred during login.";

//     return {
//       success: false,
//       message: errorMessage, // Provide a message for the error
//       errorCode: err.code || "UNKNOWN_ERROR",
//     };
//   }
// };

// DEPRECATED: Use useAuthStore.getState().login() directly instead
// NOTE: require() is used here to avoid circular dependency between firebase.jsx and useAuthStore.js
const signInWithEmailAndPasswordFn = async (email, password) => {
  const { login } = require('./stores/useAuthStore').useAuthStore.getState();
  return await login(email, password);
};

// const registerWithEmailAndPasswordv2 = async (email, password) => {
//   try {
//     const res = await createUserWithEmailAndPassword(auth, email, password);
//     const user = res.user;
//     saveUserToSession(user);

//     const q = query(
//       collection(db, "users"),
//       where("uid", "==", user.uid)
//     );
//     const querySnapshot = await getDocs(q);

//     let isNewUser = false;

//     if (querySnapshot.empty) {
//       const d_info = DeviceInfo();
//       const os = `${d_info.os.name} ${d_info.os.version}`;

//       await addDoc(collection(db, "users"), {
//         uid: user.uid,
//         authProvider: "local",
//         email: user.email,
//         plan: "free",
//         device: os,
//         platform: "web",
//       });

//       isNewUser = true;
//     }

//     return {
//       success: true,
//       isNewUser,
//       uid: user.uid,
//       email: user.email,
//     };
//   } catch (err) {
//     return {
//       success: false,
//       error: err.message,
//     };
//   }
// };

// DEPRECATED: Use useAuthStore.getState().register() directly instead
// NOTE: require() is used here to avoid circular dependency between firebase.jsx and useAuthStore.js
// This is a legacy pattern and should not be replicated in new code
const registerWithEmailAndPasswordFn = async (name, email, password, location, phone, dob) => {
  const { register } = require('./stores/useAuthStore').useAuthStore.getState();
  return await register(email, password);
};

// Sign-in using a Firebase Custom Token passed from a trusted source (e.g., backend)
const signInWithFirebaseToken = async (token) => {
  try {
    const res = await signInWithCustomToken(auth, token);
    const user = res.user;

    // Normalize and persist session user similar to other sign-in flows
    const normalizedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified || false,
    };
    // Try to hydrate full profile; fallback to normalized
    const hydrated = await hydrateFullMemberProfile(user.uid, user.email);
    if (!hydrated) {
      saveUserToSession(normalizedUser);
    }

    // Hydration handled above

    return { success: true, user: normalizedUser };
  } catch (err) {
    return { success: false, error: err?.message || "Token sign-in failed" };
  }
};

// Accept a Firebase ID token directly, set override for API calls, and synthesize a session
const signInWithIdTokenDirect = async (idToken) => {
  try {
    // Persist override so axios attaches it even before auth.currentUser is ready
    try { sessionStorage.setItem("idTokenOverride", idToken); } catch (_) {}

    // Try to fetch minimal profile using backend protected route to infer UID
    // If not available, we will leave subscriptions empty and fill later
    let derivedUser = null;

    // Decode JWT locally to extract uid/email/name flags
    try {
      const parts = idToken.split(".");
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = atob(b64);
        const payload = JSON.parse(jsonStr);
        const uid = payload.user_id || payload.uid || payload.sub || null;
        const email = payload.email || null;
        const emailVerified = !!(payload.email_verified || payload.emailVerified);
        const name = payload.name || payload.displayName || null;
        derivedUser = {
          uid,
          email,
          displayName: name,
          emailVerified,
        };
      }
    } catch (_) {}
    // Skip /api/v2/member/me call as it's breaking - use JWT payload instead

    // If we have uid/email, try to hydrate full profile
    if (derivedUser?.uid || derivedUser?.email) {
      const hydrated = await hydrateFullMemberProfile(derivedUser.uid, derivedUser.email);
      if (hydrated) {
        return { success: true, user: hydrated };
      }
    }

    // Store minimal session to pass isAuthenticated checks
    const normalizedUser = derivedUser || { uid: null, email: null, displayName: null, emailVerified: false };
    saveUserToSession(normalizedUser);

    // Best effort subscriptions load if uid available
    if (normalizedUser.uid) {
      try {
        const subscriptionsResponse = await api.get(`/api/v2/subscriptions/user/${normalizedUser.uid}`);
        const subscriptions = subscriptionsResponse.data || [];
        const subscriptionsData = subscriptions.reduce((acc, sub) => ({
          ...acc,
          [sub.package_id]: {
            subscription_date: sub.subscription_date,
            subscription_expiry: sub.subscription_expiry,
            subscription_status: sub.subscription_status,
            daysLeft: sub.daysLeft
          },
        }), {});
        // User data now managed by Zustand store
        const { updateUserProfile, updateSubscriptions } = require('../stores/useAuthStore').useAuthStore.getState();
        updateUserProfile(normalizedUser);
        updateSubscriptions(subscriptionsData);
      } catch (_) {}
    }

    return { success: true, user: normalizedUser };
  } catch (err) {
    return { success: false, error: err?.message || "ID token sign-in failed" };
  }
};

const checkIfUserExistsByEmail = async (email) => {
  try {
    const response = await api.get(`/api/v2/memberv2/email/${encodeURIComponent(email)}`);
    return response.data.success === true && response.data.data;
  } catch (error) {
    return false
  }
};

// DEPRECATED: Use useAuthStore.getState().deleteAccount() directly instead
// This wrapper exists only for backward compatibility and will be removed
const deleteaccount = async () => {
  const { deleteAccount } = require('./stores/useAuthStore').useAuthStore.getState();
  return await deleteAccount();
};

// DEPRECATED: Use useAuthStore.getState().resetPassword() directly instead
// NOTE: require() is used here to avoid circular dependency
const sendPasswordResetEmailFn = async (email) => {
  const { resetPassword } = require('./stores/useAuthStore').useAuthStore.getState();
  return await resetPassword(email);
};

const sendPasswordResetEmailv2 = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      email,
    };
  } catch (err) {
    // Return a more user-friendly error message
    const errorMessage = err.message || "Failed to send password reset email.";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// DEPRECATED: Use useAuthStore.getState().logout() directly instead
// NOTE: require() is used here to avoid circular dependency
const logoutFn = async () => {
  const { logout } = require('./stores/useAuthStore').useAuthStore.getState();
  return await logout();
};

// Legacy function - use user service API instead
const get_user_sessions = async () => {
  const { getUserSessions } = require('./services/user');
  const { user } = require('./stores/useAuthStore').useAuthStore.getState();
  if (!user?.uid) return [];
  try {
    return await getUserSessions(user.uid);
  } catch (err) {
    logger.error("Error fetching user sessions:", err);
    return [];
  }
};

// Legacy function - use user service API instead
const remove_user_session = async (sessionId) => {
  const { removeUserSession } = require('./services/user');
  try {
    await removeUserSession(sessionId);
    return true;
  } catch (err) {
    logger.error("Error deleting the user session:", err);
    return false;
  }
};

// Legacy function - use useAuthStore.getUserPlan() instead
const get_user_plan = async () => {
  const { getUserPlan } = require('./stores/useAuthStore').useAuthStore.getState();
  const result = await getUserPlan();
  return result.success ? result.plan : null;
};

// Legacy function - use user service API instead
const get_account_details = async () => {
  const { getAccountDetails } = require('./services/user');
  const { user } = require('./stores/useAuthStore').useAuthStore.getState();
  if (!user?.uid) return null;
  try {
    return await getAccountDetails(user.uid);
  } catch (err) {
    logger.error("Error fetching user details:", err);
    return null;
  }
};

// Legacy function - use useAuthStore.isAuthenticated instead
const isAuthenticated = () => {
  const { isAuthenticated } = require('./stores/useAuthStore').useAuthStore.getState();
  return isAuthenticated;
};

// Legacy function - use useAuthStore.user instead
const getUser = () => {
  const { user } = require('./stores/useAuthStore').useAuthStore.getState();
  return user;
};

// Legacy function - use user service API instead
const UpdateUserData = async (email, fullName, phone, dateOfBirth) => {
  const { updateUserData } = require('./services/user');
  const { user } = require('./stores/useAuthStore').useAuthStore.getState();
  if (!user?.uid) return false;
  try {
    await updateUserData(user.uid, {
      name: fullName,
      phoneNumber: phone,
      dateOfBirth,
    });
    return true;
  } catch (error) {
    logger.error("Error updating user details:", error);
    return false;
  }
};

// Helper function for token-based authentication
const hydrateFullMemberProfile = async (uid, email) => {
  try {
    const { fetchUserData } = require('./stores/useAuthStore').useAuthStore.getState();
    return await fetchUserData(uid, { uid, email });
  } catch (_) {
    return null;
  }
};

// Essential Firebase functions (cannot be removed)
export {
  auth,
  db,
  signInWithGooglev2,
  signInWithApplev2,
  sendPasswordResetEmailv2,
  signInWithFirebaseToken,
  signInWithIdTokenDirect,
  checkIfUserExistsByEmail
};

// Legacy functions (use Zustand store instead)
export {
  signInWithApple,
  signInWithEmailAndPasswordFn as signInWithEmailAndPassword,
  registerWithEmailAndPasswordFn as registerWithEmailAndPassword,
  sendPasswordResetEmailFn as sendPasswordResetEmail,
  logoutFn as logout,
  deleteaccount,
  get_user_sessions,
  remove_user_session,
  get_user_plan,
  isAuthenticated,
  getUser,
  get_account_details,
  UpdateUserData
};
