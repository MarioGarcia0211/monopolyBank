// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBq0nV3f4zvbzkpiQAOceevRWW0CfXI-6s",
  authDomain: "bd-monopoly.firebaseapp.com",
  projectId: "bd-monopoly",
  storageBucket: "bd-monopoly.firebasestorage.app",
  messagingSenderId: "261540729846",
  appId: "1:261540729846:web:613e9bd8d74328b0752dd7"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyBDNEmKXxZ0WmN71yaNo-SZ7UnFeXnB65E",
//   authDomain: "monopoly-bank-3981c.firebaseapp.com",
//   projectId: "monopoly-bank-3981c",
//   storageBucket: "monopoly-bank-3981c.firebasestorage.app",
//   messagingSenderId: "889178058588",
//   appId: "1:889178058588:web:cab856e6f0aa85f8301b99"
// };



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };