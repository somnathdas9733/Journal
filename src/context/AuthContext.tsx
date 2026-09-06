import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isDemoUser: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemo: (email?: string, name?: string) => void;
  signOut: () => Promise<void>;
}

const DEMO_STORAGE_KEY = 'paradigm_demo_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // If Firebase Auth is configured, subscribe to Firebase auth state
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            isDemo: false,
          });
          // Clear any leftover demo session
          localStorage.removeItem(DEMO_STORAGE_KEY);
        } else {
          // Check for existing demo session
          const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
          if (savedDemo) {
            try {
              setUser(JSON.parse(savedDemo));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Check for demo session if Firebase is not yet configured
      const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase credentials not configured. Please add your VITE_FIREBASE_* variables to .env.');
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setUser({
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        isDemo: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const signInDemo = (email = 'alex.chen@paradigm.local', name = 'Alex Chen') => {
    const demoUser: AppUser = {
      uid: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      isDemo: true,
    };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth && !user?.isDemo) {
        await firebaseSignOut(auth);
      }
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoUser: Boolean(user?.isDemo),
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
