// frontend/src/firebaseClient.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; 

// ข้อมูลการตั้งค่าของ Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "face-recognition-3e9a6.firebaseapp.com",
  databaseURL:
    "https://face-recognition-3e9a6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "face-recognition-3e9a6",
  storageBucket: "face-recognition-3e9a6.appspot.com",
  messagingSenderId: "244312713764",
  appId: "1:244312713764:web:157bca838ed646f1b946b1",
  measurementId: "G-XTNXX2L70M",
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);

// รับอ้างอิงไปยังบริการฐานข้อมูล
const database = getDatabase(app); 
const storage = getStorage(app);
export { database, storage };
