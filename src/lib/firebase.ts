import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your-api-key" && 
  firebaseConfig.apiKey !== "VOTRE_CLE_FIREBASE";

let app: any = null;
let auth: any = null;
let analytics: any = null;

let googleProvider: any = null;
let facebookProvider: any = null;
let twitterProvider: any = null;
let githubProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
    
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    twitterProvider = new TwitterAuthProvider();
    githubProvider = new GithubAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn("Firebase is not configured: NEXT_PUBLIC_FIREBASE_API_KEY is not set. Social login will be unavailable.");
  }
}

export { auth, analytics, googleProvider, facebookProvider, twitterProvider, githubProvider };

