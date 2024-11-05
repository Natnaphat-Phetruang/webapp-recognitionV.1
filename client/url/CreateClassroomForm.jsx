// CreateClassroomForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
} from "@mui/material";

function CreateClassroomForm() {
  // ลบ setShowForm ออกจาก props
  const [formData, setFormData] = useState({
    subject: "",
    group: "",
    room: "",
    type: "Lecture",
    days: [],
    startTime: "",
    endTime: "",
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        days: checked
          ? [...prevData.days, value]
          : prevData.days.filter((day) => day !== value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const { subject, group, room, days, startTime, endTime } = formData;
    if (
      !subject ||
      !group ||
      !room ||
      days.length === 0 ||
      !startTime ||
      !endTime
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    return true;
  };

  const getFullDayName = (abbreviation) => {
    const dayMap = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
    };
    return dayMap[abbreviation];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const generateRandomCode = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const classroomCode = generateRandomCode();
    const token = localStorage.getItem("token");
    let teacherId;
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        teacherId = decodedToken.id || decodedToken.userId;
        if (!teacherId) {
          throw new Error("Token does not contain 'id' or 'userId'");
        }
      } catch (error) {
        console.error("Invalid token", error);
        alert("โทเคนไม่ถูกต้อง กรุณาล็อกอินใหม่");
        return;
      }
    } else {
      alert("ไม่พบโทเคน กรุณาล็อกอินใหม่");
      return;
    }

    const fullDays = formData.days.map(getFullDayName);

    const newClassroom = {
      ...formData,
      code: classroomCode,
      teacher_id: teacherId,
      days: fullDays,
    };

    try {
      const response = await axios.post(
        "http://localhost:3333/api/classroom",
        newClassroom,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        alert(
          `ห้องเรียน '${formData.subject}' ถูกสร้างแล้ว! รหัสห้องเรียนคือ: ${classroomCode}`
        );
        // ลบ setShowForm(false); ที่นี่
        const classroomId = response.data.classroomId;
        navigate(`/dashboard-teacher/room/${classroomId}`);
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างห้องเรียน");
      }
    } catch (error) {
      console.error(
        "Error creating classroom:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างห้องเรียน"
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "0vh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{ padding: 3, margin: "0 auto", width: "400px" }}
      >
        <Typography variant="h5" gutterBottom>
          Create a Classroom
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="ชื่อวิชา"
            fullWidth
            margin="normal"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
          <TextField
            label="หมู่เรียน"
            fullWidth
            margin="normal"
            name="group"
            value={formData.group}
            onChange={handleChange}
            required
          />
          <TextField
            label="ห้องเรียน"
            fullWidth
            margin="normal"
            name="room"
            value={formData.room}
            onChange={handleChange}
            required
          />
          <Typography variant="body1" gutterBottom>
            ประเภท:
          </Typography>
          <RadioGroup
            row
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <FormControlLabel
              value="Lecture"
              control={<Radio />}
              label="Lecture"
            />
            <FormControlLabel value="Lab" control={<Radio />} label="Lab" />
          </RadioGroup>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <TextField
              label="เวลาเริ่ม"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              required
            />
            <TextField
              label="เวลาสิ้นสุด"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              required
            />
          </Box>
          <Typography variant="body1" gutterBottom sx={{ marginTop: 2 }}>
            วันเรียน:
          </Typography>
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={formData.days.includes(day)}
                  onChange={handleChange}
                  name="days"
                  value={day}
                />
              }
              label={day}
            />
          ))}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            สร้างห้องเรียน
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateClassroomForm;
