// Api_create.js
require("dotenv").config({ path: "Project_comsci/server/.env" });
const express = require("express");
const router = express.Router();
const db = require("./db"); // ตรวจสอบให้แน่ใจว่าเส้นทางถูกต้อง
const jwt = require("jsonwebtoken");
const secret = process.env.API_KEY || "API_KEY_2024"; // คีย์สำหรับการตรวจสอบ JWT
const firebaseAdmin = require("./firebaseadmin.js"); // หากชื่อไฟล์เป็น firebaseAdmin.js
const { getDatabase } = require("firebase-admin/database");

// Middleware สำหรับตรวจสอบ token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ status: "error", message: "Token is invalid" });
    }
    req.user = user; // เก็บข้อมูลผู้ใช้ใน request
    console.log("User data:", req.user); // เพิ่มการ log user data
    next();
  });
};

// Middleware สำหรับตรวจสอบสิทธิ์ผู้ใช้ว่าเป็นอาจารย์
const authorizeTeacher = (req, res, next) => {
  console.log("User role:", req.user.role);
  if (req.user.role !== "teacher") {
    return res
      .status(403)
      .json({ status: "error", message: "You do not have permission" });
  }
  next();
};

// Middleware สำหรับตรวจสอบสิทธิ์ผู้ใช้ว่าเป็นนิสิต
const authorizeStudent = (req, res, next) => {
  const userRole = req.user.role;
  console.log("authorizeStudent - User role:", userRole); // เพิ่มการ log เพื่อตรวจสอบบทบาท
  if (userRole !== "nisit") {
    return res.status(403).json({
      status: "error",
      message: "Forbidden: Only nisit can perform this action",
    });
  }
  next();
};

// ดึงข้อมูลผู้ใช้
router.get("/users/:userId", authenticateToken, async (req, res) => {
  const userId = req.params.userId; // ใช้ userId จาก URL

  try {
    const user = await db.getUserById(userId);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//deletenisit
router.delete("/classroom/members/:id", async (req, res) => {
  const { id } = req.params; // ดึง id ของนิสิตที่ต้องการลบจาก URL

  try {
    const result = await db.deletenisitClass(id); // เรียกใช้ฟังก์ชัน deletenisitClass

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบรายชื่อนิสิตที่ต้องการลบ" });
    }

    res.status(200).json({ message: "ลบรายชื่อนิสิตสำเร็จ" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบรายชื่อ" });
  }
});
//update
router.put("/update/classroom/members/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // ใช้ status แทน Status
  console.log("ID:", id); // ตรวจสอบว่า ID ถูกส่งมาถูกต้องหรือไม่
  console.log("Status:", status); // ตรวจสอบค่าที่ถูกส่งมา
  try {
    const result = await db.updateNisitStatus(id, status); // แก้ไขเป็น status แทน Status

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบนิสิตที่ต้องการอัปเดต" });
    }

    res.json({ message: "อัปเดตสถานะสำเร็จ" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});
// db.getUserByStudentId = async (studentId) => {
//   const query = `
//     SELECT studentId, fname, lname
//     FROM nisit WHERE studentId = ?;`; // ใช้การค้นหาจาก studentId
//   try {
//     const results = await execute(query, [studentId]);
//     return results.length > 0 ? results[0] : null;
//   } catch (error) {
//     throw new Error(`Error fetching user by Student ID: ${error.message}`);
//   }
// };
// บันทึกประวัติการเข้าเรียน
router.post("/api/attendance_history", (req, res) => {
  // จัดการข้อมูลที่ได้รับ
  const attendanceData = req.body;
  console.log("Received attendance data:", attendanceData);
  // สมมติว่าบันทึกข้อมูลลงฐานข้อมูลที่นี่
  res.status(200).json({ message: "Attendance history recorded successfully" });
});

//updata to Firebase
router.post("/update-classroom", async (req, res) => {
  const {
    classCode,
    studentId,
    fname,
    lname,
    last_attendance_time,
    standing,
    total_attendance,
  } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!classCode || !studentId || !fname || !lname) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
  }

  try {
    // สร้าง reference path ใน Firebase Realtime Database
    const studentRef = database.ref(`rooms/${classCode}/members/${studentId}`);

    // ตรวจสอบว่านิสิตที่มี studentId นี้มีอยู่ในห้องเรียนหรือไม่
    const snapshot = await studentRef.once("value");

    if (snapshot.exists()) {
      // ถ้านิสิตที่มี studentId นี้มีอยู่แล้ว ให้ทำการอัปเดตข้อมูล
      await studentRef.update({
        fname: fname,
        lname: lname,
        last_attendance_time: last_attendance_time || null,
        standing: standing || "null",
        total_attendance: total_attendance !== undefined ? total_attendance : 0,
      });
      res.status(200).json({ message: "อัปเดตข้อมูลนิสิตสำเร็จ" });
    } else {
      // ถ้านิสิตที่มี studentId นี้ยังไม่มี ให้เพิ่มข้อมูลใหม่
      await studentRef.set({
        fname: fname,
        lname: lname,
        last_attendance_time: last_attendance_time || null,
        standing: standing || "null",
        total_attendance: total_attendance !== undefined ? total_attendance : 0,
      });
      res.status(201).json({ message: "เพิ่มข้อมูลนิสิตสำเร็จ" });
    }
  } catch (error) {
    console.error("Error updating Firebase:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

// ลบสมาชิกออกจากห้องเรียน (สำหรับนิสิต)
router.delete(
  "/classroom/:classroomId/member/self",
  authenticateToken,
  authorizeStudent,
  async (req, res) => {
    const classroomId = req.params.classroomId;
    const studentId = req.user.id; // ใช้ ID ของนิสิตจาก token

    console.log(
      `Attempting to remove student ID ${studentId} from classroom ID ${classroomId}`
    );

    try {
      // ตรวจสอบว่าห้องเรียนมีอยู่ในระบบหรือไม่
      const classroom = await db.getClassroomById(classroomId);
      console.log("Classroom:", classroom);
      if (!classroom) {
        return res
          .status(404)
          .json({ status: "error", message: "Classroom not found" });
      }

      // ตรวจสอบว่านิสิตเป็นสมาชิกของห้องเรียนนี้หรือไม่
      const isMember = await db.checkClassroomMembership(
        classroomId,
        studentId
      );
      console.log("Is member:", isMember); // เพิ่มการ log ตรวจสอบสมาชิก

      if (!isMember) {
        return res.status(400).json({
          status: "error",
          message: "You are not a member of this classroom",
        });
      }

      // ลบสมาชิก
      await db.removeClassroomMember(classroomId, studentId);
      console.log(
        `Student ID ${studentId} has left classroom ID ${classroomId}`
      );
      res.json({ status: "success", message: "You have left the classroom" });
    } catch (error) {
      console.error("Error leaving classroom:", error); // log ข้อผิดพลาด
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ลบสมาชิกออกจากห้องเรียน (สำหรับอาจารย์)
router.delete(
  "/classroom/:classroomId/member/:studentId",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const classroomId = req.params.classroomId;
    const studentId = req.params.studentId;

    console.log(
      `Attempting to remove student ID ${studentId} from classroom ID ${classroomId} by teacher ID ${req.user.id}`
    );

    try {
      // ตรวจสอบว่าห้องเรียนมีอยู่ในระบบหรือไม่
      const classroom = await db.getClassroomById(classroomId);
      if (!classroom) {
        return res
          .status(404)
          .json({ status: "error", message: "Classroom not found" });
      }

      // ตรวจสอบว่าอาจารย์เป็นเจ้าของห้องเรียนหรือไม่
      const isOwner = await db.checkClassroomOwnership(
        classroomId,
        req.user.id
      );
      if (!isOwner) {
        return res.status(403).json({
          status: "error",
          message:
            "You do not have permission to remove members from this classroom",
        });
      }

      // ตรวจสอบว่านิสิตเป็นสมาชิกของห้องเรียนนี้หรือไม่
      const isMember = await db.checkClassroomMembership(
        classroomId,
        studentId
      );
      if (!isMember) {
        return res.status(400).json({
          status: "error",
          message: "Student is not a member of this classroom",
        });
      }

      // ลบสมาชิก
      await db.removeClassroomMember(classroomId, studentId);
      console.log(
        `Teacher ID ${req.user.id} removed student ID ${studentId} from classroom ID ${classroomId}`
      );
      res.json({ status: "success", message: "Member removed from classroom" });
    } catch (error) {
      console.error("Error removing member:", error); // log ข้อผิดพลาด
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// เพิ่มห้องเรียน
router.post(
  "/classroom",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const { code, days, endTime, group, room, startTime, subject, type } =
      req.body;

    // ตรวจสอบว่าฟิลด์ที่จำเป็นทั้งหมดมีอยู่
    if (
      !code ||
      !days ||
      !endTime ||
      !group ||
      !room ||
      !startTime ||
      !subject ||
      !type
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    try {
      // ใช้ req.user.id แทน teacher_id จาก frontend
      const teacher_id = req.user.id;

      console.log("User data:", req.user); // เช็คค่าของ req.user
      console.log("Teacher ID:", teacher_id); // เช็คค่าของ teacher_id

      // ตรวจสอบว่า teacher_id มีค่าหรือไม่
      if (!teacher_id) {
        return res
          .status(400)
          .json({ status: "error", message: "Teacher ID is undefined" });
      }

      console.log("Creating classroom for teacher_id:", teacher_id);

      // สร้างห้องเรียน โดยส่ง teacher_id เป็นส่วนหนึ่งของอ็อบเจ็กต์
      const classroomId = await db.createClassroom({
        code,
        teacher_id, // เพิ่ม teacher_id เข้าไปในอ็อบเจ็กต์
        days,
        endTime,
        group,
        room,
        startTime,
        subject,
        type,
      });

      res.status(201).json({
        status: "success",
        message: "Classroom created",
        classroomId,
      });
    } catch (error) {
      console.error("Error creating classroom:", error); // เพิ่มการ log error
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ดึงข้อมูลห้องเรียนทั้งหมดที่ผู้ใช้สามารถเข้าถึงได้
router.get("/classrooms", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let classrooms;

    if (userRole === "teacher") {
      // สำหรับอาจารย์ ดึงห้องเรียนที่สร้างโดยอาจารย์คนนี้
      classrooms = await db.getClassroomsByTeacherId(userId);
    } else if (userRole === "nisit") {
      // สำหรับนิสิต ดึงห้องเรียนที่นิสิตเข้าร่วม
      classrooms = await db.getClassroomsByStudentId(userId);
    } else {
      return res.status(403).json({ status: "error", message: "Invalid role" });
    }

    res.json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// เพิ่มนิสิตเข้าห้องเรียนด้วยรหัส
router.post("/join-classroom", authenticateToken, async (req, res) => {
  const { code } = req.body; // รหัสห้องเรียน
  const userId = req.user.id; // ใช้ userId จาก token

  // ตรวจสอบว่ามีรหัสห้องเรียนหรือไม่
  if (!code) {
    return res
      .status(400)
      .json({ status: "error", message: "จำเป็นต้องมีรหัสห้องเรียน" });
  }

  try {
    // ตรวจสอบว่าห้องเรียนมีอยู่ในฐานข้อมูล
    const classroom = await db.getClassroomByCode(code);
    if (!classroom) {
      return res
        .status(404)
        .json({ status: "error", message: "ไม่พบห้องเรียนที่ระบุ" });
    }

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกในห้องเรียนอยู่แล้วหรือไม่
    const isMember = await db.checkClassroomMembership(classroom.id, userId);
    if (isMember) {
      return res.status(400).json({
        status: "error",
        message: "คุณเป็นสมาชิกของห้องเรียนนี้แล้ว",
      });
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลตาม userId
    const student = await db.getUserByStudentId(userId); // เปลี่ยนให้เรียกตาม userId
    if (!student) {
      return res
        .status(404)
        .json({ status: "error", message: "ไม่พบข้อมูลนิสิต" });
    }

    // เพิ่มนิสิตเข้าห้องเรียนในฐานข้อมูล
    await db.addClassroomMember(classroom.id, userId); // ใช้ studentId ที่ได้จากฐานข้อมูล

    // ส่งข้อมูลไปยัง Firebase
    const studentData = {
      fname: student.fname,
      lname: student.lname,
      major: student.major,
      faculty: student.faculty,
      last_attendance_time: "",
      standing: "", // หรือสถานะที่เหมาะสม
      total_attendance: 0,
      // id: classroom.id, // ส่ง ID ห้องเรียน
      startTime: classroom.startTime, // ส่งเวลาเริ่ม
      endTime: classroom.endTime, // ส่งเวลาสิ้นสุด
    };

    // สร้าง reference path ใน Firebase Realtime Database
    const database = getDatabase(); // รับอินสแตนซ์ของ Firebase Database
    const studentRef = database.ref(
      `rooms/${classroom.id}/members/${student.studentId}`
    ); // ใช้ studentId ที่ถูกต้องจากฐานข้อมูล

    await studentRef.set(studentData);

    res.status(201).json({
      status: "success",
      message: "คุณได้เข้าร่วมห้องเรียนเรียบร้อยแล้ว",
      classroom: {
        id: classroom.id, // ส่ง ID ห้องเรียน
        startTime: classroom.startTime,
        endTime: classroom.endTime,
      },
    });
  } catch (error) {
    console.error("Error joining classroom:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ดึงสมาชิกในห้องเรียน
router.get(
  "/classroom/:classroomId/members",
  authenticateToken,
  async (req, res) => {
    const classroomId = req.params.classroomId;

    try {
      const members = await db.getClassroomMembers(classroomId);
      if (!members.length) {
        return res
          .status(404)
          .json({ status: "error", message: "No members found" });
      }
      res.json(members);
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ลบห้องเรียน (สำหรับอาจารย์) โดยไม่ต้องตรวจสอบว่ามีสมาชิกอยู่หรือไม่
router.delete(
  "/classroom/:classroomId",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const classroomId = req.params.classroomId;

    try {
      // ลบสมาชิกทั้งหมดก่อน
      await db.removeAllClassroomMembers(classroomId); // ฟังก์ชันนี้ต้องสร้างใน db.js
      console.log(`All members removed from classroom ID ${classroomId}`);

      // ลบห้องเรียน
      await db.deleteClassroom(classroomId);
      res.json({
        status: "success",
        message: "Classroom deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ดึงข้อมูลห้องเรียน
router.get("/classroom/:classroomId", authenticateToken, async (req, res) => {
  const classroomId = req.params.classroomId;

  try {
    const classroom = await db.getClassroomById(classroomId);
    if (!classroom) {
      return res
        .status(404)
        .json({ status: "error", message: "Classroom not found" });
    }
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

//check mem
router.get("/classroom/:classroomId/members-history", async (req, res) => {
  const { classroomId } = req.params;
  console.log(`Fetching members and history for classroomId: ${classroomId}`);

  try {
    const members = await db.getClassroomMembers(classroomId);
    // สมมติว่ามีฟังก์ชันดึงประวัติการเข้าชั้นเรียน
    const history = await db.getAttendanceHistory(classroomId);
    res.json({ members, history });
  } catch (error) {
    console.error(
      "Error fetching classroom members and history:",
      error.message
    );
    res.status(500).json({
      message: "Error fetching members and history",
      error: error.message,
    });
  }
});

// ดึงสมาชิกและประวัติการเข้าชั้นเรียนของห้องเรียน
router.get(
  "/classroom/:classroomId/members-history",
  authenticateToken,
  async (req, res) => {
    const { classroomId } = req.params;
    console.log(`Fetching members and history for classroomId: ${classroomId}`);

    try {
      const members = await db.getClassroomMembers(classroomId);
      const history = await db.getClassroomAttendanceHistory(classroomId); // ใช้ฟังก์ชันใหม่
      res.json({ members, history });
    } catch (error) {
      console.error(
        "Error fetching classroom members and history:",
        error.message
      );
      res.status(500).json({
        message: "Error fetching members and history",
        error: error.message,
      });
    }
  }
);

// อัปเดตข้อมูลห้องเรียน
router.put(
  "/classroom/:classroomId",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const classroomId = req.params.classroomId;
    const { room, subject, group, startTime, endTime, days, type } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตทั้งหมด
    if (
      !room ||
      !subject ||
      !group ||
      !startTime ||
      !endTime ||
      !days ||
      !type
    ) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required to update",
      });
    }

    try {
      console.log(
        "Updating classroom with ID:",
        classroomId,
        "and data:",
        req.body
      ); // เพิ่มการ log
      await db.updateClassroom(classroomId, {
        room,
        subject,
        group,
        startTime,
        endTime,
        days,
        type,
      });
      res.json({
        status: "success",
        message: "Classroom updated successfully",
      });
    } catch (error) {
      console.error("Error updating classroom:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

module.exports = router;
