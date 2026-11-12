import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyB0jE6sj9_hPGY-Iywgz--jrnDDUwzAj60",
  authDomain: "qlhocphan-75311.firebaseapp.com",
  projectId: "qlhocphan-75311",
  storageBucket: "qlhocphan-75311.firebasestorage.app",
//  messagingSenderId: "747553564814",
  appId: "1:747553564814:web:a97044a0dc6c207c9241df",
 // measurementId: "G-H9DQ5WWG3V"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);