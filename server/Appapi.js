//Appapi.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("./db");
const crypto = require("crypto");
const { sendEmail, mailTemplate } = require("./utils/email");

dotenv.config();

const app = express();
const jsonParser = bodyParser.json();
const saltRounds = 10;
const secret = process.env.API_KEY || "API_KEY_2024";
const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);
const classroomRoutes = require("./Api_create");

app.use(cors());
app.use(express.json());
app.use("/api", classroomRoutes);

// Endpoint for Verify identity (teacher)
app.post("/verify_password", jsonParser, async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await db.getGlobalPassword();
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "error", message: "Incorrect password" });
    }
  } catch (err) {
    console.error("Server error:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Server error: " + err.message });
  }
});

// Remove user from database
app.delete("/userdelete", jsonParser, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { email } = req.body;

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    jwt.verify(token, secret);
    const result = await db.deleteUserByEmail(email);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the user",
    });
  }
});

// Update user profile
app.put("/users/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = req.params.id;
  const { fname, lname, email, major, faculty, studentId } = req.body;

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    jwt.verify(token, secret);
    const result = await db.updateUserData(
      userId,
      studentId,
      fname,
      lname,
      email,
      major,
      faculty
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "success", message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating data:", err.message);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});

// Get user profile
app.get("/users", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const email = decoded.email;
    const users = await db.getAllNisitData(email);

    if (!users.length) {
      return res
        .status(404)
        .json({ status: "error", message: "No users found" });
    }

    res.json(users);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});
// Get teacher profile based on token
app.get("/teachers/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "ไม่มี token" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const teacherId = decoded.id;

    const teacher = await db.getTeacherById(teacherId);

    if (!teacher) {
      return res.status(404).json({ status: "error", message: "ไม่พบอาจารย์" });
    }

    res.json(teacher);
  } catch (err) {
    console.error("Error fetching teacher data:", err.message);
    res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลอาจารย์",
    });
  }
});

// Update teacher profile
app.put("/teachers", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // รับค่า token จาก header
  const { fname, lname, email } = req.body; // รับข้อมูลที่ต้องการแก้ไขจาก body

  if (!token) {
    return res.status(401).json({ status: "error", message: "ไม่มี token" });
  }

  try {
    // ตรวจสอบ token เพื่อยืนยันสิทธิ์
    const decoded = jwt.verify(token, secret);
    const teacherId = decoded.id; // ใช้ teacherId จาก token แทนการส่งใน params

    // ทำการอัพเดตข้อมูลโดยใช้ teacherId ที่ได้จาก token
    const result = await db.updateTeacherData(teacherId, fname, lname, email);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "ไม่พบอาจารย์" });
    }

    res.json({
      status: "success",
      message: "อัปเดตข้อมูลอาจารย์เรียบร้อยแล้ว",
    });
  } catch (err) {
    console.error("Error updating teacher:", err.message);
    res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลอาจารย์",
    });
  }
});

// Authentication endpoint
// app.post("/Authen", jsonParser, (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.verify(token, secret);

//     res.json({ status: "success", decoded, email: decoded.email });
//   } catch (error) {
//     res.json({ status: "error", message: error.message });
//   }
// });
app.post("/Authen", jsonParser, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret); // ยืนยัน token

    let user;
    if (decoded.role === "nisit") {
      user = await db.getStudentData(decoded.id); // เรียกดูข้อมูลนิสิต
    } else if (decoded.role === "teacher") {
      user = await db.getTeacherData(decoded.id); // เรียกดูข้อมูลอาจารย์
    } else {
      throw new Error("User role not recognized");
    }

    res.json({
      status: "success",
      decoded: { ...decoded, fname: user.fname, lname: user.lname },
      email: decoded.email,
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Login endpoint
app.post("/login", jsonParser, async (req, res) => {
  try {
    const user = await db.getUserByEmail(req.body.email);

    if (!user) {
      return res.json({ status: "error", message: "User not found" });
    }

    if (!user.role) {
      return res.json({ status: "error", message: "User role not found" });
    }

    const isLogin = await bcrypt.compare(req.body.password, user.password);
    if (isLogin) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: "24h" }
      );
      res.json({
        status: "success",
        message: "Login Success",
        token,
        email: user.email,
        role: user.role,
        id: user.id,
      });
    } else {
      res.json({ status: "error", message: "Invalid Password" });
    }
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// Registration for student
app.post("/registernisit", jsonParser, async (req, res) => {
  try {
    const { email, password, fname, lname, major, faculty, studentId } =
      req.body;
    const emailExists = await db.checkEmailExists(email);

    if (emailExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.registerNisit(
      email,
      hashedPassword,
      fname,
      lname,
      "nisit",
      major,
      faculty,
      studentId
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Registration for teacher
app.post("/registerteacher", jsonParser, async (req, res) => {
  try {
    const { email, password, fname, lname } = req.body;
    const emailExists = await db.checkEmailExists(email);

    if (emailExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.registerUser(email, hashedPassword, "teacher", fname, lname);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Password reset request
app.post("/forgotpassword", jsonParser, async function (req, res) {
  try {
    console.log("req.body.email", req.body.email);
    const email = req.body.email;
    const user = await db.getUserByEmail(email);
    console.log("req.body:", req.body);

    // ตรวจสอบว่าผู้ใช้ถูกค้นพบ
    if (!user) {
      // เปลี่ยนจาก !user || user.length === 0 เป็น !user
      return res.json({
        success: false,
        message: "You are not registered!",
      });
    }

    const token = crypto.randomBytes(10).toString("hex"); //สร้าง token แบบสุ่มและแปลงเป็นรูปแบบ hex
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    // อัพเดทฐานข้อมูลสำหรับผู้ใช้ที่ตรงกับอีเมลที่ให้มา
    await db.update_forgot_password_token(user.id, resetToken); // เปลี่ยน user[0].id เป็น user.id

    const mailOption = {
      email: email,
      subject: "Forgot Password Link",
      message: mailTemplate(
        "We have received a request to reset your password. Please reset your password using the link below.",
        `${process.env.FRONTEND_URL}/resetPassword?id=${user.id}&token=${resetToken}`, // เปลี่ยน user[0].id เป็น user.id
        "Reset Password"
      ),
    };

    await sendEmail(mailOption);
    res.json({
      success: true,
      message: "A password reset link has been sent to your email.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
});

//send emil
app.post("/check-attendance", async (req, res) => {
  const { classroomId, studentId } = req.body;

  try {
    if (!classroomId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Classroom ID and Student ID are required.",
      });
    }

    // ตรวจสอบว่านิสิตอยู่ในห้องเรียนนี้หรือไม่
    const student = await db.getStudentInClassroom(classroomId, studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Invalid Classroom ID or Student ID.",
      });
    }

    // สร้างข้อมูลสำหรับส่งอีเมล
    const mailOption = {
      email: student.email, // อีเมลของนิสิต
      subject: "Attendance Confirmation",
      message: `You have successfully checked in for classroom .`,
    };

    // ส่งอีเมลยืนยันการเช็คชื่อ
    await sendEmail(mailOption);

    res.json({
      success: true,
      message: "Attendance check successful! Email has been sent.",
    });
  } catch (error) {
    console.error("Error processing attendance:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
});

// Check if email exists
app.post("/check_email", async (req, res) => {
  const email = req.body.email;

  try {
    const existsInBothTables = await db.check_email(email);
    res.json({ emailExistsInBothTables: existsInBothTables });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Reset password
app.post("/resetPassword", async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { password, token, userId } = req.body;
    const userToken = await db.get_password_reset_token(userId);

    if (!userToken || userToken.length === 0) {
      res.json({
        success: false,
        message: "Some problem occurred!",
      });
    } else {
      const currDateTime = new Date();
      const expiresAt = new Date(userToken[0].expires_at);
      if (currDateTime > expiresAt) {
        res.json({
          success: false,
          message: "Reset Password link has expired!",
        });
      } else if (userToken[0].token !== token) {
        res.json({
          success: false,
          message: "Reset Password link is invalid!",
        });
      } else {
        await db.update_password_reset_token(userId);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userTable = await db.check_user_in_teacher_or_nisit(userId);
        if (userTable === "teacher") {
          await db.update_user_password_teacher(userId, hashedPassword);
        } else if (userTable === "nisit") {
          await db.update_user_password_nisit(userId, hashedPassword);
        } else {
          return res.json({
            success: false,
            message: "User not found!",
          });
        }

        res.json({
          success: true,
          message: "Your password reset was successfully!",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "An error occurred during password reset.",
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
