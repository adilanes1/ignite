
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQ5uOmP3ewvBumK20cOvwhbxxBuEwR7Yo",
  authDomain: "udep-155f6.firebaseapp.com",
  projectId: "udep-155f6",
  storageBucket: "udep-155f6.firebasestorage.app",
  messagingSenderId: "566173921875",
  appId: "1:566173921875:web:ae01faedc63930459f8ca6",
  measurementId: "G-TSWEC6Q3MP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.auth = auth;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;

console.log(" Firebase initialized (modular style like React)");
