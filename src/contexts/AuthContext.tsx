import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

interface User {
  uid: string;
  employeeId: string;
  name: string;
  role: 'admin' | 'employee';
  joiningDate: Date;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createFirebaseUser = async (employeeId: string, password: string) => {
    const email = `${employeeId}@skyinvestments.com`;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Firebase user created successfully");
    } catch (error: any) {
      if (error.code !== 'auth/email-already-in-use') {
        throw error;
      }
    }
  };

  const login = async (employeeId: string, password: string) => {
    try {
      // First, try to create the user (will fail if already exists)
      await createFirebaseUser(employeeId, password);
      
      // Then sign in
      const email = `${employeeId}@skyinvestments.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", employeeId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: userCredential.user.uid,
          employeeId: userData.employeeId,
          name: userData.name,
          role: userData.role,
          joiningDate: userData.joiningDate.toDate(),
          active: userData.active,
        });
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid employee ID or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const employeeId = firebaseUser.email?.split('@')[0] || '';
          const userDoc = await getDoc(doc(db, "users", employeeId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              employeeId: userData.employeeId,
              name: userData.name,
              role: userData.role,
              joiningDate: userData.joiningDate.toDate(),
              active: userData.active,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};