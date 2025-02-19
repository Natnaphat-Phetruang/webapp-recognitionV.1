// testClassroomFunctions.js
const db = require("./db"); // นำเข้าฟังก์ชันจากฐานข้อมูล

async function testGetClassroomByCode() {
  const code = "pRHwO0WI"; // รหัสห้องเรียนที่ต้องการทดสอบ
  try {
    const classroom = await db.getClassroomByCode(code);
    if (classroom) {
      console.log("Classroom found:", classroom);
    } else {
      console.error("Classroom not found.");
    }
  } catch (error) {
    console.error("Error in getClassroomByCode:", error);
  }
}

async function testCheckClassroomMembership() {
  const classroomId = "51"; // ID ของห้องเรียนที่ต้องการทดสอบ
  const studentId = "1"; // ID ของนักเรียนที่ต้องการทดสอบ
  try {
    const isMember = await db.checkClassroomMembership(classroomId, studentId);
    console.log("Is student a member:", isMember);
  } catch (error) {
    console.error("Error in checkClassroomMembership:", error);
  }
}

async function testGetUserByStudentId() {
  const studentId = "6421604803"; // ID ของนักเรียนที่ต้องการทดสอบ
  try {
    const student = await db.getUserByStudentId(studentId);
    if (student) {
      console.log("Student found:", student);
    } else {
      console.error("Student not found.");
    }
  } catch (error) {
    console.error("Error in getUserByStudentId:", error);
  }
}

// ฟังก์ชันทดสอบหลัก
async function runTests() {
  console.log("Testing getClassroomByCode...");
  await testGetClassroomByCode();

  console.log("\nTesting checkClassroomMembership...");
  await testCheckClassroomMembership();

  console.log("\nTesting getUserByStudentId...");
  await testGetUserByStudentId();
}

// เรียกใช้ฟังก์ชันทดสอบหลัก
runTests();
