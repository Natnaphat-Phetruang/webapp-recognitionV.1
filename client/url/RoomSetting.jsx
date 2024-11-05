import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  MenuItem,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const RoomSetting = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    room: "",
    subject: "",
    group: "",
    startTime: "",
    endTime: "",
    days: [],
    type: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchClassroom = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      if (decodedToken.role) {
        setRole(decodedToken.role);
      }

      const response = await axios.get(
        `http://localhost:3333/api/classroom/${classroomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClassroom(response.data);
      setFormData({
        room: response.data.room,
        subject: response.data.subject,
        group: response.data.group,
        startTime: response.data.startTime,
        endTime: response.data.endTime,
        days: response.data.days,
        type: response.data.type,
      });
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroom();
  }, [classroomId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDayChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      days: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3333/api/classroom/${classroomId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbarMessage("อัปเดตห้องเรียนเรียบร้อยแล้ว");
      setSnackbarOpen(true);
      await fetchClassroom();
    } catch (error) {
      setError("Error updating data");
    }
  };

  const handleBack = () => {
    if (role === "nisit") {
      navigate("/dashboard-nisit/room");
    } else if (role === "teacher") {
      navigate("/dashboard-teacher/room");
    }
  };

  const handleOpenCamera = () => {
    navigate(`/dashboard-teacher/classroom/${classroomId}/camera`);
  };

  const handleCheckHistory = () => {
    navigate(`/dashboard-teacher/classroom/${classroomId}/members-history`);
  };

  if (loading) {
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
          mb: 9,
          p: 10,
          padding: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <p>{error}</p>;
  if (!classroom) return <p>No classroom data available.</p>;

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
        mb: 9,
        p: 10,
      }}
    >
      <Container maxWidth="md" style={{ marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom>
          แก้ไขห้องเรียน
        </Typography>
        <Paper style={{ padding: "20px", marginBottom: "20px" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="room"
                  label="ห้องเรียน"
                  value={formData.room}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="subject"
                  label="วิชาที่สอน"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="group"
                  label="หมู่เรียน"
                  value={formData.group}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="startTime"
                  label="เวลาเริ่ม"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="endTime"
                  label="เวลาสิ้นสุด"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="days"
                  label="วันเรียน"
                  value={formData.days}
                  onChange={handleDayChange}
                  SelectProps={{
                    multiple: true,
                  }}
                  required
                >
                  {daysOfWeek.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="type"
                  label="ประเภท"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Lecture">Lecture</MenuItem>
                  <MenuItem value="Lab">Lab</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit">
                  อัปเดต
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                  style={{ marginLeft: "10px" }}
                >
                  กลับ
                </Button>
              </Grid>
              <Grid
                item
                xs={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleOpenCamera}
                >
                  เปิดกล้อง
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleCheckHistory}
                >
                  เช็คนิสิตเเละประวัติ
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 10 }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoomSetting;
