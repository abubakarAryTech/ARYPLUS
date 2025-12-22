import api from "./api";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "../stores/useAuthStore";

const login = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Fetch user subscriptions
    const subscriptionsResponse = await api.get(`/api/v2/subscriptions/user/${user.uid}`);
    const subscriptions = subscriptionsResponse.data;

    // Structure subscriptions data for localStorage
    const subscriptionsData = subscriptions.reduce((acc, sub) => ({
      ...acc,
      [sub.package_id]: {
        subscription_date: sub.subscription_date,
        subscription_expiry: sub.subscription_expiry,
        subscription_status: sub.subscription_status,
        daysLeft:sub.daysLeft,
        daysLeftText:sub.daysLeftText
      }
    }), {});

    const usersearchhistory = await api.get(`/api/v2/searchhistory/user/${user.uid}`);
    
    // Save user data and subscriptions to localStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      subscriptions: subscriptionsData,
      searchHistory: usersearchhistory.data
    };

    // Use Zustand store instead of localStorage
    const { login } = useAuthStore.getState();
    await login(email, password);
    return { success: true, user };
  } catch (err) {
    // Friendly error messages for common Firebase Auth errors
    let message = "Login failed. Please try again.";
    if (err.code === "auth/user-not-found") {
      message = "No user found with this email.";
    } else if (err.code === "auth/wrong-password") {
      message = "Incorrect password. Please try again.";
    } else if (err.code === "auth/invalid-email") {
      message = "Invalid email address format.";
    } else if (err.code === "auth/invalid-credential") {
      message = "Invalid email or password.";
    } else if (err.code === "auth/too-many-requests") {
      message = "Too many failed attempts. Please try again later or reset your password.";
    }
    return { success: false, error: message };
  }
};

const register = async (email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    // localStorage.setItem("user", JSON.stringify({
    //   uid: user.uid,
    //   email: user.email,
    //   displayName: user.displayName,
    // }));
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const logout = (redirectPath = null) => {
  const { logout: zustandLogout } = useAuthStore.getState();
  zustandLogout();
  if (redirectPath) {
    window.location.href = redirectPath;
  }
};

export default {
  login,
  logout,
  register,
}; 