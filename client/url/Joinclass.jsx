import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { database } from "./firebaseClient";
import { ref, set } from "firebase/database";

function JoinClassroom({ setShowJoin }) {
  const [classCode, setClassCode] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleJoinClassroom = async () => {
    if (classCode.trim() === "") {
      setErrorMessage("กรุณาใส่รหัสห้องเรียนที่ถูกต้อง");
      return;
    }

    console.log("Class Code:", classCode);

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("ไม่พบ Token กรุณาเข้าสู่ระบบอีกครั้ง");
      return;
    }

    console.log("Token:", token);

    try {
      // Decode JWT token เพื่อดึง userId
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      console.log("Decoded Token:", decodedToken);
      console.log("User ID:", userId);

      // ดึง studentId, fname, lname จาก XAMPP โดยใช้ userId
      const studentResponse = await axios.get(
        `http://localhost:3333/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const studentData = studentResponse.data;
      const studentId = studentData.studentId; // studentId ใช้ในการเก็บข้อมูลใน Firebase
      const fname = studentData.fname;
      const lname = studentData.lname;

      console.log("Student Data:", studentData);

      // ส่งข้อมูลเข้าร่วมห้องเรียนไปที่ API
      const response = await axios.post(
        "http://localhost:3333/api/join-classroom",
        { code: classCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Join Classroom Response:", response.data);

      if (response.status === 201) {
        const classroomData = response.data.classroom;

        if (!classroomData) {
          setErrorMessage("ไม่พบข้อมูลห้องเรียนใน response ที่ได้รับ");
          return;
        }

        const { id, startTime, endTime } = classroomData;

        if (!id) {
          setErrorMessage(
            "ไม่พบ ID ห้องเรียน กรุณาตรวจสอบรหัสห้องเรียนอีกครั้ง"
          );
          return;
        }
        setErrorMessage(
          `เข้าร่วมห้องเรียนด้วยรหัส '${classCode}' เรียบร้อยแล้ว!`
        );
        alert(`เข้าร่วมห้องเรียนด้วยรหัส '${classCode}' เรียบร้อยแล้ว!`);

        setShowJoin(false);
        navigate("dashboard-nisit/room");

        // อัปเดตข้อมูลใน Firebase
        const studentRef = ref(
          database,
          `rooms/${id}/members/${studentId}` // ใช้ studentId ในการเก็บข้อมูลใน Firebase
        );
        await set(studentRef, {
          fname: fname,
          lname: lname,
          startTime: startTime,
          endTime: endTime,
          last_attendance_time: "",
          standing: "",
          total_attendance: 0,
        });

        console.log("Firebase updated successfully for student:", studentId);
      }
    } catch (error) {
      console.error(
        "Error joining classroom:",
        error.response?.data || error.message
      );

      // แสดงข้อความจาก API ในกรณีที่มี error
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        // setErrorMessage(
        //   "เกิดข้อผิดพลาดในการเข้าร่วมห้องเรียน กรุณาลองใหม่อีกครั้ง"
        // );
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "10vh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <ClassIcon
          sx={{
            fontSize: 50,
            color: "#3f51b5",
            marginBottom: 2,
          }}
        />
        <Typography variant="h5" gutterBottom>
          เข้าร่วมห้องเรียน
        </Typography>
        <TextField
          variant="outlined"
          label="รหัสห้องเรียน"
          fullWidth
          value={classCode}
          onChange={(e) => {
            setClassCode(e.target.value);
            setErrorMessage("");
          }}
          sx={{
            marginBottom: 3,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleJoinClassroom}
          sx={{
            backgroundColor: "#3f51b5",
            "&:hover": {
              backgroundColor: "#303f9f",
            },
          }}
        >
          เข้าร่วม
        </Button>
        {errorMessage && (
          <Typography color="error" variant="body2" mt={2}>
            {errorMessage}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default JoinClassroom;
