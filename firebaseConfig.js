// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBbPg9STaclYP81Wy_JGMbl4HMGdMruio",
  authDomain: "gyogo-1393.firebaseapp.com",
  projectId: "gyogo-1393",
  storageBucket: "gyogo-1393.appspot.com",
  messagingSenderId: "539213629044",
  appId: "1:539213629044:web:775d00c20088ce6e3ab321",
  measurementId: "G-9BWJT2YFQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence:getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app); //get the database (not storage)