const express = require("express");
const app = express();
const mysql = require("mysql2/promise");

// ตั้งค่าการเชื่อมต่อกับฐานข้อมูล MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "your_database_name",
});

app.use(express.json());

// ฟังก์ชันบันทึกประวัติการเข้าเรียน
async function addAttendanceHistory(userId, classroomId, status) {
  const query =
    "INSERT INTO attendance (user_id, classroom_id, status) VALUES (?, ?, ?)";
  await db.execute(query, [userId, classroomId, status]);
}

// ฟังก์ชันเรียกดูประวัติการเข้าเรียน
async function getAttendanceHistory(userId) {
  const query = "SELECT * FROM attendance WHERE user_id = ?";
  const [rows] = await db.execute(query, [userId]);
  return rows;
}

// ฟังก์ชันสร้างห้องเรียนใหม่
async function createClassroom(classroomName, teacherId) {
  const query = "INSERT INTO classrooms (name, teacher_id) VALUES (?, ?)";
  const [result] = await db.execute(query, [classroomName, teacherId]);
  return result.insertId; // ส่งคืน classroom ID ที่สร้างขึ้น
}

// ฟังก์ชันเพิ่มสมาชิกเข้าห้องเรียน
async function addClassroomMember(classroomId, userId) {
  const query =
    "INSERT INTO classroom_members (classroom_id, user_id) VALUES (?, ?)";
  await db.execute(query, [classroomId, userId]);
}

// ฟังก์ชันเรียกสมาชิกในห้องเรียน
async function getClassroomMembers(classroomId) {
  const query = "SELECT * FROM classroom_members WHERE classroom_id = ?";
  const [rows] = await db.execute(query, [classroomId]);
  return rows;
}

// ฟังก์ชันลบห้องเรียน
async function deleteClassroom(classroomId) {
  const query = "DELETE FROM classrooms WHERE id = ?";
  await db.execute(query, [classroomId]);
}

// Route สำหรับการบันทึกการเข้าเรียน
app.post("/attendance", async (req, res) => {
  const { userId, classroomId, status } = req.body;
  try {
    await addAttendanceHistory(userId, classroomId, status);
    res.status(200).send("Attendance recorded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error recording attendance");
  }
});

// Route สำหรับการเรียกดูประวัติการเข้าเรียน
app.get("/attendance/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const attendance = await getAttendanceHistory(userId);
    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching attendance history");
  }
});

// Route สำหรับการสร้างห้องเรียน
app.post("/classrooms", async (req, res) => {
  const { classroomName, teacherId } = req.body;
  try {
    const classroomId = await createClassroom(classroomName, teacherId);
    res.status(200).json({ classroomId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating classroom");
  }
});

// Route สำหรับการเพิ่มสมาชิกเข้าห้องเรียน
app.post("/classrooms/:classroomId/members", async (req, res) => {
  const { classroomId } = req.params;
  const { userId } = req.body;
  try {
    await addClassroomMember(classroomId, userId);
    res.status(200).send("Member added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding member to classroom");
  }
});

// Route สำหรับการเรียกดูสมาชิกในห้องเรียน
app.get("/classrooms/:classroomId/members", async (req, res) => {
  const { classroomId } = req.params;
  try {
    const members = await getClassroomMembers(classroomId);
    res.status(200).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching classroom members");
  }
});

// Route สำหรับการลบห้องเรียน
app.delete("/classrooms/:classroomId", async (req, res) => {
  const { classroomId } = req.params;
  try {
    await deleteClassroom(classroomId);
    res.status(200).send("Classroom deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting classroom");
  }
});

// ตั้งค่าเซิร์ฟเวอร์ให้รันบนพอร์ต 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
