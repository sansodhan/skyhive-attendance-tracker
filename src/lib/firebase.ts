import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA1NEjhUKl8T-HdFqJ1__NEgAjMx3Nsn_w",
  authDomain: "sky-investment-851bc.firebaseapp.com",
  databaseURL: "https://sky-investment-851bc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sky-investment-851bc",
  storageBucket: "sky-investment-851bc.appspot.com",
  messagingSenderId: "1016242571780",
  appId: "1:1016242571780:web:cf4c6a5d7dcd9ee71a0351",
  measurementId: "G-EX04TZ4KQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize test users in Firestore
const initializeTestUsers = async () => {
  try {
    const testUsers = [
      {
        employeeId: "000",
        name: "Admin User",
        role: "admin",
        email: "000@skyinvestments.com",
        joiningDate: new Date(),
        active: true
      },
      {
        employeeId: "001",
        name: "Test Employee",
        role: "employee",
        email: "001@skyinvestments.com",
        joiningDate: new Date(),
        active: true
      }
    ];

    // Create Firebase Auth users and Firestore records
    for (const user of testUsers) {
      try {
        // Create Firebase Auth user
        await createUserWithEmailAndPassword(
          auth, 
          user.email,
          user.employeeId === "000" ? "Admin001" : "Emp001"
        );
      } catch (error: any) {
        // Ignore if user already exists
        if (error.code !== 'auth/email-already-in-use') {
          console.error("Error creating auth user:", error);
        }
      }

      // Create Firestore record
      await setDoc(doc(db, "users", user.employeeId), user);
    }
    
    console.log("Test users initialized successfully");
  } catch (error) {
    console.error("Error initializing test users:", error);
  }
};

// Uncomment the line below to initialize test users (run once)
// initializeTestUsers();

export { initializeTestUsers };