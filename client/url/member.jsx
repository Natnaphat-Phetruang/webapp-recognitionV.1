import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Typography,
  Stack,
  Snackbar,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // เพิ่ม useNavigate

const MemClassroom = () => {
  const { classroomId = 12 } = useParams();
  const navigate = useNavigate(); // สร้าง instance ของ useNavigate
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [history, setHistory] = useState([]);

  // ฟังก์ชันดึงข้อมูลสมาชิกห้องเรียนและประวัติ
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3333/api/classroom/${classroomId}/members-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const membersWithUniqueId = response.data.members.map(
        (member, index) => ({
          ...member,
          id: member.id || index + 1,
        })
      );

      setStudents(membersWithUniqueId);
      setHistory(response.data.history);
    } catch (error) {
      console.error("Error fetching classroom members and history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [classroomId]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3333/classroom/members/${id}`);
      setStudents((prev) => prev.filter((student) => student.id !== id));
      setSnackbarMessage("ลบสมาชิกสำเร็จ!");
      setOpenSnackbar(true);
      setFoundStudent(null);
    } catch (error) {
      console.error("Error deleting member:", error);
      setSnackbarMessage("เกิดข้อผิดพลาดในการลบสมาชิก");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const student = students.find((s) => s.StudentId === searchKeyword);
    if (student) {
      setFoundStudent(student);
      setSnackbarMessage(`ค้นพบรหัสนิสิต: ${student.StudentId}`);
      setOpenSnackbar(true);
    } else {
      setFoundStudent(null);
      setSnackbarMessage("ไม่พบรหัสนิสิตที่ค้นหา");
      setOpenSnackbar(true);
    }
  };

  const handleReset = () => {
    setFoundStudent(null);
    setSearchKeyword("");
  };

  const handleHistoryPage = () => {
    navigate(`/dashboard-teacher/classroom/${classroomId}/attendance-history`); // เปลี่ยนเส้นทางไปหน้าประวัติ
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "studentId", headerName: "Student ID", width: 130 },
    { field: "fname", headerName: "First Name", width: 130 },
    { field: "lname", headerName: "Last Name", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "major", headerName: "Major", width: 150 },
    { field: "faculty", headerName: "Faculty", width: 150 },
    { field: "joined_at", headerName: "Joined At", width: 180 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: "translateY(-50px)",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        p: 3,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
        <Typography variant="h4">
          รายชื่อนิสิตในห้องเรียน {classroomId}
        </Typography>
        <TextField
          variant="outlined"
          placeholder="ค้นหารหัสนิสิต..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            style: {
              borderColor: "black",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "black",
              },
              "&:hover fieldset": {
                borderColor: "black",
              },
              "&.Mui-focused fieldset": {
                borderColor: "black",
              },
            },
          }}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </Button>
        {searchKeyword && (
          <Button
            variant="contained"
            color="error"
            onClick={handleReset}
            disabled={loading}
          >
            Back
          </Button>
        )}
        <Button variant="contained" onClick={fetchMembers} disabled={loading}>
          {loading ? "กำลังโหลด..." : "Refresh "}
        </Button>
        <Button
          variant="contained"
          onClick={handleHistoryPage}
          disabled={loading}
        >
          เช็คประวัติ
        </Button>
      </Stack>

      <Box sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          sx={{
            "& .MuiDataGrid-cell": {
              borderColor: "#000000DE", // กำหนดสีเส้นตารางของเซลล์
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#000000DE", // สีพื้นหลังของหัวตาราง
              color: "#000000DE",
              borderColor: "#000000DE", // กำหนดสีเส้นตารางของหัวตาราง
            },
            "& .MuiDataGrid-columnSeparator": {
              color: "#000000DE", // กำหนดสีเส้นแยกของหัวตาราง
            },
          }}
          rows={foundStudent ? [foundStudent] : students}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection={false}
        />
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />

      {history.length > 0 && (
        <Box sx={{ height: 300, width: "100%", marginTop: 4 }}>
          <Typography variant="h5" gutterBottom>
            ประวัติการเข้าชั้นเรียน
          </Typography>
          <DataGrid
            rows={history.map((item, index) => ({ id: index + 1, ...item }))}
            columns={[
              { field: "id", headerName: "ID", width: 70 },
              { field: "student_id", headerName: "Student ID", width: 130 },
              { field: "fname", headerName: "First Name", width: 130 },
              { field: "lname", headerName: "Last Name", width: 130 },
              { field: "date", headerName: "Date", width: 150 },
              { field: "status", headerName: "Status", width: 150 },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Box>
      )}
    </Box>
  );
};

export default MemClassroom;
