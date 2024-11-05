import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress, Paper, Fade } from "@mui/material";
import { useParams } from "react-router-dom";
import { database } from "./firebaseClient";
import { ref, onValue } from "firebase/database"; // เปลี่ยนจาก get เป็น onValue
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";

const Cam = () => {
  const { classroomId } = useParams();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [student, setStudent] = useState(null);
  const wsRef = useRef(null);
  const lastUpdateRef = useRef(null);
  const studentListener = useRef(null); // เพิ่ม ref สำหรับเก็บ firebase listener

  const setupRealtimeListener = (studentId) => {
    
    if (studentListener.current) {
      studentListener.current();
    }

    const studentRef = ref(
      database,
      `rooms/${classroomId}/members/${studentId}`
    );

    // สร้าง listener ใหม่
    studentListener.current = onValue(
      studentRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const studentData = snapshot.val();

          try {
            // ดึง URL ของภาพจาก Firebase Storage
            const storage = getStorage();
            const imageRef = storageRef(storage, `${studentId}.jpg`);
            const imageUrl = await getDownloadURL(imageRef);
            studentData.studentImage = imageUrl;
          } catch (err) {
            console.error("Error fetching student image:", err);
          }

          setStudent({
            ...studentData,
            studentId: studentId,
          });

          // แสดง notification
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);

          // ส่งเฉพาะข้อมูลที่จำเป็นไปยัง attendance_history
          const attendanceData = {
            total_attendance: studentData.total_attendance,
            last_attendance_time: studentData.last_attendance_time,
            standing: studentData.standing,
          };

          // ส่งข้อมูลไปยัง attendance_history
          insertAttendanceHistory(attendanceData, studentId);
        }
      },
      (error) => {
        console.error("Error fetching student data:", error);
      }
    );
  };

  const insertAttendanceHistory = async (attendanceData, studentId) => {
  
    if (!studentId || !attendanceData) {
      console.error("Missing required data for attendance history");
      return;
    }

    const data = {
      classroomId,
      studentId,
      total_attendance: attendanceData.total_attendance,
      last_attendance_time: attendanceData.last_attendance_time,
      standing: attendanceData.standing,
    };

    console.log("ข้อมูลที่จะส่งไปยัง API:", data);

    try {
      const response = await fetch(
        "http://localhost:3333/api/attendance_history",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (response.ok) {
        console.log("Attendance history recorded successfully");
      } else {
        console.error("Failed to record attendance history");
      }
    } catch (error) {
      console.error("Error recording attendance history:", error);
    }
  };

  useEffect(() => {
    if (!classroomId) {
      setError("ไม่พบรหัสห้องเรียน");
      setLoading(false);
      return;
    }

    const connectWebSocket = () => {
      const token = localStorage.getItem("token");
      wsRef.current = new WebSocket(
        `ws://127.0.0.1:8000/ws/${classroomId}?token=${token}`
      );

      wsRef.current.onopen = () => {
        console.log("WebSocket connection successful");
        setLoading(false);
        setError(null);
      };

      wsRef.current.onmessage = async (event) => {
        try {
          // ตรวจสอบว่าข้อมูลเป็น base64 image หรือ JSON
          if (typeof event.data === "string" && event.data.startsWith("/9j/")) {
            setImage(`data:image/jpeg;base64,${event.data}`);
          } else {
            const data = JSON.parse(event.data);
            console.log("Received data:", data);

            if (data.image) {
              setImage(`data:image/jpeg;base64,${data.image}`);
            }

            // เมื่อได้รับ studentId ให้เริ่มการดึงข้อมูลแบบ realtime
            if (data.studentId) {
              setupRealtimeListener(data.studentId);
              lastUpdateRef.current = new Date(data.last_attendance_time);
            }
          }
        } catch (e) {
          console.error("Error processing WebSocket data:", e);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + error.message);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setTimeout(connectWebSocket, 1000);
      };
    };

    connectWebSocket();

   
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
   
      if (studentListener.current) {
        studentListener.current();
      }
    };
  }, [classroomId]);

  const getStatusColor = (standing) => {
    switch (standing) {
      case "มาตรงเวลา":
        return "#66FF00";
      case "มาสาย":
        return "#FF8C00";
      case "ขาดเรียน":
        return "#FF0000";
      default:
        return "#757575";
    }
  };
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "ไม่มีข้อมูล";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#f0f0f0",
          p: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        backgroundColor: "#f0f0f0",
        minHeight: "100vh",
        gap: 3,
      }}
    >
      <Fade in={showNotification}>
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            top: 20,
            padding: 2,
            backgroundColor: "#4caf50",
            color: "white",
            zIndex: 1000,
          }}
        >
          <Typography>บันทึกการเข้าเรียนสำเร็จ!</Typography>
        </Paper>
      </Fade>

      <Box
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: 1200,
          gap: 3,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Paper elevation={3} sx={{ flex: 1, padding: 2 }}>
          <Typography variant="h5" gutterBottom align="center">
            กล้อง
          </Typography>
          {image ? (
            <img
              src={image}
              alt="Live Feed"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
                objectFit: "contain",
              }}
            />
          ) : (
            <Box
              sx={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography>ไม่พบภาพ</Typography>
            </Box>
          )}
        </Paper>

        {student && (
          <Paper elevation={3} sx={{ flex: 1, padding: 2 }}>
            <Typography variant="h5" gutterBottom align="center">
              ข้อมูลนักศึกษา
            </Typography>

            {student.studentImage && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <img
                  src={student.studentImage}
                  alt="Student"
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #1976d2",
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: "grid", gap: 2 }}>
              <Typography variant="body1">
                <strong>ชื่อ-นามสกุล:</strong> {student.fname} {student.lname}
              </Typography>
              <Typography variant="body1">
                <strong>รหัสนักศึกษา:</strong> {student.studentId}
              </Typography>
              <Typography variant="body1">
                <strong>หลักสูตร:</strong> {student.major}
              </Typography>
              <Typography variant="body1">
                <strong>ปีการศึกษา:</strong> {student.year}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: getStatusColor(student.standing),
                }}
              >
                <strong>สถานะ:</strong> {student.standing}
              </Typography>
              <Typography variant="body1">
                <strong>จำนวนการเข้าเรียน:</strong> {student.total_attendance}
              </Typography>
              <Typography variant="body1">
                <strong>เวลาเข้าเรียนล่าสุด:</strong>{" "}
                {formatDateTime(student.last_attendance_time)}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Cam;
