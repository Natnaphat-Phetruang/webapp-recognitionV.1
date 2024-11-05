import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { database } from "./firebaseClient"; 
import { ref, get } from "firebase/database"; 
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage"; 

const TestDataFetch = () => {
  const [classroomId, setClassroomId] = useState(""); 
  const [studentId, setStudentId] = useState(""); 
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    if (!classroomId || !studentId) {
      setError("กรุณากรอก Classroom ID และ Student ID.");
      return;
    }

    setLoading(true);
    setError(null); // Reset error message

    try {
      const studentRef = ref(
        database,
        `rooms/${classroomId}/members/${studentId}`
      );
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        const studentData = snapshot.val();
        setStudent(studentData);

        // ดึง URL ของภาพจาก Firebase Storage
        const storage = getStorage();
        const imageRef = storageRef(storage, `${studentId}.jpg`); 
        const imageUrl = await getDownloadURL(imageRef);
        setStudent((prev) => ({ ...prev, studentImage: imageUrl })); 
      } else {
        setError("ไม่พบข้อมูลนักเรียนนี้.");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <Typography variant="h5">กรอกข้อมูลนักเรียน</Typography>

      {/* ช่องกรอก Classroom ID */}
      <TextField
        label="Classroom ID"
        variant="outlined"
        value={classroomId}
        onChange={(e) => setClassroomId(e.target.value)}
        sx={{ marginBottom: 2, width: "100%" }}
      />

      {/* ช่องกรอก Student ID */}
      <TextField
        label="Student ID"
        variant="outlined"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        sx={{ marginBottom: 2, width: "100%" }}
      />

      <Button variant="contained" color="primary" onClick={fetchStudentData}>
        ดึงข้อมูลนักเรียน
      </Button>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {student && (
        <Paper elevation={3} sx={{ flex: "1", padding: 3, marginTop: 3 }}>
          <Typography variant="h5" gutterBottom align="center">
            ข้อมูลนักศึกษาล่าสุด
          </Typography>

          {/* Student Image */}
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
              <strong>รหัสนักศึกษา:</strong> {studentId}
            </Typography>
            <Typography variant="body1">
              <strong>สาขา:</strong> {student.major}
            </Typography>
            <Typography variant="body1">
              <strong>จำนวนครั้งที่เข้าเรียน:</strong>{" "}
              {student.total_attendance}
            </Typography>
            <Typography variant="body1">
              <strong>สถานะ:</strong>{" "}
              <span style={{ color: getStatusColor(student.standing) }}>
                {student.standing}
              </span>
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TestDataFetch;
