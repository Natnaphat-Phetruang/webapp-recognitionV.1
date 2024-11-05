import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/system";
import { AccessTime } from "@mui/icons-material";

// Styled components
const AnnouncementCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#f9f9f9",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: "#ff4081",
  color: "#fff",
  width: theme.spacing(7),
  height: theme.spacing(7),
}));

// Mock data for announcements
const announcements = [
  {
    title: "วิธีสร้างห้องเรียน",
    group: "อาจารย์",
    type: "ทั่วไป",
    content: `
1. กดไปที่ "หน้าสร้างห้องเรียน"  
กดเมนู Create Room เพื่อเข้าสู่การสร้างห้องเรียนใหม่
กรอกข้อมูลให้ครบถ้วนตามที่ระบบกำหนดเพื่อใช้ในการสร้างห้องเรียน

2.กดปุ่ม "สร้างห้อง"  
เมื่อกรอกข้อมูลครบถ้วนแล้ว ให้กดปุ่ม สร้างห้องรับรหัสห้องเรียน (Code)  
ระบบจะแสดงรหัสห้องเรียน (Code) สำหรับนิสิต  
คัดลอกรหัสและแจ้งให้นิสิตใช้รหัสนี้ในการเข้าร่วมห้องเรียน
    `,
    lastUpdate: "วันอังคาร, 21 มิถุนายน 2567",
    author: "ผู้ดูแลระบบ",
  },
  {
    title: "หน้าแสดงห้องเรียน",
    group: "อาจารย์",
    type: "ทั่วไป",
    content: `1.กดที่เมนู "Room" เพื่อแสดงรายการห้องเรียนทั้งหมดที่คุณได้สร้างไว้สามารถ ลบห้องเรียน ได้หากไม่ต้องการใช้งานอีกต่อไป

    2.กดที่ชื่อห้องเรียนเพื่อดูรายละเอียดเพิ่มเติมของห้องเรียนนั้นๆ จะพบกับข้อมูลรายละเอียดของห้องเรียนที่ถูกสร้างไว้สามารถ แก้ไขข้อมูลห้องเรียน ได้ในกรณีที่กรอกข้อมูลผิดพลาด
    
    3.มีปุ่มสำหรับ "เปิดกล้อง" เพื่อใช้ในการสแกนใบหน้าของนิสิต
    
    4.มีปุ่มสำหรับ "เช็คสมาชิกที่เข้าห้องเรียน" และ ตรวจสอบประวัติการเข้าชั้นเรียน ของนิสิต`,
    lastUpdate: "วันอังคาร, 21 มิถุนายน 2567",
    author: "ผู้ดูแลระบบ",
  },
  {
    title: "หน้าสแกนหน้าของนิสิต",
    group: "อาจารย์",
    type: "ทั่วไป",
    content: `1.เมื่อกดปุ่ม "เปิดกล้อง" ระบบจะแสดงหน้าต่างสำหรับสแกนใบหน้าของนิสิต
    ดำเนินการสแกนใบหน้าของนิสิตตามขั้นตอนที่แสดงบนหน้าจอ
    
    
    




    `,
    lastUpdate: "วันอังคาร, 21 มิถุนายน 2567",
    author: "ผู้ดูแลระบบ",
  },
  {
    title: "เช็ครายชื่อนิสิตและตรวจสอบประวัติการเข้าห้องเรียน",
    group: "อาจารย์",
    type: "ทั่วไป",
    content: `1.เช็คสมาชิกที่เข้าห้องเรียน
    เมื่อกดปุ่ม "เช็คสมาชิกที่เข้าห้องเรียน" ระบบจะแสดงรายชื่อนิสิตที่เข้าร่วมแล้วสามารถตรวจสอบรายชื่อและสถานะของนิสิตที่เข้าห้องเรียนได้

    2.จัดการกับนิสิต หากนิสิตไม่ได้ออกจากชั้นเรียนเอง สามารถลบรายชื่อนิสิตออกจากห้องเรียนได้
    
    3.ดูประวัติการเข้าชั้นเรียน
    กดปุ่ม "หน้าถัดไป" เพื่อดูประวัติการเข้าชั้นเรียนของนิสิตสามารถเช็คประวัติการเข้าชั้นเรียนและแก้ไขสถานะของนิสิตที่ลาได้`,
    lastUpdate: "วันอังคาร, 21 มิถุนายน 2567",
    author: "ผู้ดูแลระบบ",
  },
  {
    title: "การตั้งค่า",
    group: "อาจารย์",
    type: "ทั่วไป",
    content: `1.กดที่เมนู Settings เพื่อแก้ไขข้อมูลของอาจารย์ เช่น ชื่อ หรือข้อมูลอื่น ๆ

    2.กดปุ่ม แก้ไข แล้วพิมพ์ข้อมูลใหม่ในช่องที่ต้องการแก้ไขเมื่อแก้ไขเสร็จกด Update ข้อมูล
    
    
    



`,
    lastUpdate: "วันอังคาร, 21 มิถุนายน 2567",
    author: "ผู้ดูแลระบบ",
  },
];

// จำนวนประกาศต่อหน้า
const ITEMS_PER_PAGE = 1;

function Announcement() {
  const [page, setPage] = useState(1); // สถานะของหน้า

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // คำนวณ index เริ่มและสิ้นสุดสำหรับประกาศแต่ละหน้า
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAnnouncements = announcements.slice(startIndex, endIndex);

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
        mt: -5,
        p: 5,
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          {paginatedAnnouncements.map((announcement, index) => (
            <AnnouncementCard key={index}>
              {" "}
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <StyledAvatar>
                    <Typography variant="h6">💬</Typography>
                  </StyledAvatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" fontWeight="bold">
                    คู่มือการใช้งาน
                  </Typography>
                </Grid>
              </Grid>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#f7faf7",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#333" }}
                >
                  {announcement.title}
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{ color: "#4caf50", mb: 1 }}
                >
                  {announcement.group}{" "}
                  <Chip label={announcement.type} size="small" />
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-line", mt: 1 }}
                >
                  {announcement.content}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <AccessTime
                    fontSize="small"
                    sx={{
                      mr: 0.5,
                      color: "#999",
                      transform: "translateY(30px)",
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mr: -60, mt: 0, transform: "translateY(30px)" }}
                  >
                    อัปเดตล่าสุดเมื่อ {announcement.lastUpdate}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  โดย {announcement.author || "ไม่ระบุ"}
                </Typography>
              </Box>
            </AnnouncementCard>
          ))}

          {/* Pagination Component */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Pagination
              count={Math.ceil(announcements.length / ITEMS_PER_PAGE)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Announcement;
