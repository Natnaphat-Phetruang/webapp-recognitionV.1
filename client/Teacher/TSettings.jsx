// TSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";

const TeacherSettings = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3333/teachers/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeacher(response.data);
        setFormData({
          fname: response.data.fname,
          lname: response.data.lname,
          email: response.data.email,
        });
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงหรือไม่
    if (formData.fname === teacher.fname && formData.lname === teacher.lname) {
      alert("ไม่มีการเปลี่ยนแปลงข้อมูล");
      return; // ไม่ทำการอัปเดตหากไม่มีการเปลี่ยนแปลง
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3333/teachers`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // อัปเดตข้อมูลอาจารย์ใน state หลังจากแก้ไขสำเร็จ
      setTeacher({ ...teacher, ...formData });
      setEditMode(false);
      alert("อัปเดตข้อมูลอาจารย์เรียบร้อยแล้ว");
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      fname: teacher.fname,
      lname: teacher.lname,
      email: teacher.email,
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
      <Container maxWidth="md" style={{ marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom>
          การตั้งค่าข้อมูลส่วนตัว
        </Typography>
        <Paper style={{ padding: "20px" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* ชื่อ */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fname"
                  label="ชื่อ"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                  InputProps={{ readOnly: !editMode }} // อ่านได้เฉพาะเมื่อแก้ไข
                />
              </Grid>
              {/* นามสกุล */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lname"
                  label="นามสกุล"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                  InputProps={{ readOnly: !editMode }}
                />
              </Grid>
              {/* อีเมล */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  label="อีเมล"
                  value={formData.email}
                  InputProps={{ readOnly: true }} // ฟิลด์ email ไม่สามารถแก้ไขได้
                  sx={{ backgroundColor: "lightgrey" }}
                />
              </Grid>
              {/* ปุ่มแก้ไข/อัปเดต */}
              <Grid item xs={12}>
                {editMode ? (
                  <>
                    <Button variant="contained" color="primary" type="submit">
                      อัปเดต
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                      style={{ marginLeft: "10px" }}
                    >
                      ยกเลิก
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEdit}
                  >
                    แก้ไข
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default TeacherSettings;
