import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Typography,
  Stack,
  Snackbar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // นำเข้า useNavigate

const HistoryPage = () => {
  const { classroomId = 12 } = useParams();
  const navigate = useNavigate(); // สร้าง navigate
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [status, setStatus] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const handleSearch = () => {
    const student = students.find((s) => s.StudentId === searchKeyword);
    if (student) {
      setFoundStudent(student);
      setSnackbarMessage(`ค้นพบรหัสนิสิต: ${student.StudentId}`);
    } else {
      setFoundStudent(null);
      setSnackbarMessage("ไม่พบรหัสนิสิตที่ค้นหา");
    }
    setOpenSnackbar(true);
  };

  const handleReset = () => {
    setFoundStudent(null);
    setSearchKeyword("");
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3333/api/classroom/${classroomId}/members-history`
      );
      const membersWithUniqueId = response.data.map((member, index) => ({
        ...member,
        id: member.id || index + 1,
      }));
      setStudents(membersWithUniqueId);
    } catch (error) {
      console.error("Error fetching classroom members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [classroomId]);

  const handleEdit = (student) => {
    setEditStudent(student);
    setStatus(student.status);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:3333/update/classroom/members/${editStudent.id}`,
        {
          status: status,
        }
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editStudent.id ? { ...s, status: status } : s
        )
      );
      setSnackbarMessage("อัปเดตสถานะสำเร็จ!");
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbarMessage("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      setOpenSnackbar(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { field: "studentId", headerName: "Student ID", width: 130 },
    { field: "fname", headerName: "Frist Name", width: 130 },
    { field: "lname", headerName: "Last name", width: 130 },
    { field: "major", headerName: "Major", width: 150 },
    { field: "faculty", headerName: "Faculty", width: 150 },
    { field: "date_time", headerName: "Last At", width: 180 },
    { field: "status", headerName: "Status", width: 100 },
    { field: "total_attendance", headerName: "Times", width: 80 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="warning"
          onClick={() => handleEdit(params.row)}
        >
          Edit
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
      <Typography variant="h5" align="left" gutterBottom>
        ประวัติภายในห้องเรียน {classroomId}
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        marginBottom={2}
        sx={{
          "@media print": {
            display: "none",
          },
        }}
      >
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
            Clear
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)} // นำทางกลับไปหน้าก่อนหน้า
        >
          กลับ
        </Button>

        <Button variant="contained" onClick={fetchMembers} disabled={loading}>
          {loading ? "กำลังโหลด..." : "Refresh"}
        </Button>
        <Button variant="contained" color="secondary" onClick={handlePrint}>
          Download
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>แก้ไขสถานะนิสิต</DialogTitle>
        <DialogContent>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="ลากิจ">ลากิจ</MenuItem>
            <MenuItem value="ลาป่วย">ลาป่วย</MenuItem>
            <MenuItem value="มาตรงเวลา">มาตรงเวลา</MenuItem>
            <MenuItem value="มาสาย">มาสาย</MenuItem>
            <MenuItem value="ขาดเรียน">ขาดเรียน</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default HistoryPage;
