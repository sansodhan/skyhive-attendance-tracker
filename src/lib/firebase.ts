import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA1NEjhUKl8T-HdFqJ1__NEgAjMx3Nsn_w",
  authDomain: "sky-investment-851bc.firebaseapp.com",
  databaseURL: "https://sky-investment-851bc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sky-investment-851bc",
  storageBucket: "sky-investment-851bc.firebasestorage.app",
  messagingSenderId: "1016242571780",
  appId: "1:1016242571780:web:cf4c6a5d7dcd9ee71a0351",
  measurementId: "G-EX04TZ4KQ8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Initialize test users
const initializeTestUsers = async () => {
  const testUsers = [
    {
      employeeId: "000",
      password: "Admin001",
      name: "Admin User",
      role: "admin",
      email: "admin@skyinvestments.com",
    },
    {
      employeeId: "001",
      password: "Emp001",
      name: "Test Employee",
      role: "employee",
      email: "employee@skyinvestments.com",
    }
  ];

  // Add test users to Firestore
  const usersRef = collection(db, "users");
  for (const user of testUsers) {
    await setDoc(doc(usersRef, user.employeeId), {
      ...user,
      joiningDate: new Date(),
      active: true
    });
  }
};

// Call this function once to set up test users
// initializeTestUsers();