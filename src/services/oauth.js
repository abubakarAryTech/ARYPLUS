// OAuth service - Google and Apple authentication
import { signInWithGooglev2, signInWithApplev2 } from '../firebase';

export const googleAuth = signInWithGooglev2;
export const appleAuth = signInWithApplev2;