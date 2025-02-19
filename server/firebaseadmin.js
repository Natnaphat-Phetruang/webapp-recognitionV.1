const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database"); // เรียกใช้โมดูล getDatabase

// Path ของ service account file จาก Firebase
const serviceAccount = require("C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Project_comsci/server/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://face-recognition-3e9a6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

// เรียกใช้ getDatabase แทน admin.database()
const database = getDatabase();

module.exports = database;
