import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
        joiningDate: new Date(),
        active: true
      },
      {
        employeeId: "001",
        name: "Test Employee",
        role: "employee",
        joiningDate: new Date(),
        active: true
      }
    ];

    // Create Firestore records
    for (const user of testUsers) {
      await setDoc(doc(db, "users", user.employeeId), user);
      console.log(`Created/updated Firestore record for ${user.employeeId}`);
    }
    
    console.log("Test users initialized successfully");
  } catch (error) {
    console.error("Error initializing test users:", error);
  }
};

// Uncomment and run this once to initialize test users, then comment it out again
// initializeTestUsers();

export { initializeTestUsers };