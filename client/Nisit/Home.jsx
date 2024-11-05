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
    title: "วิธีอัพโหลดรูปภาพ",
    group: "นิสิต",
    type: "ทั่วไป",
    content: `
    1.หน้าอัพโหลดรูปภาพ
    -กดเมนู "Upload" เพื่อเข้าสู่หน้าการอัพโหลดรูปภาพ
    -กดปุ่ม ADD FILE เพื่อเลือกไฟล์รูปภาพจากอุปกรณ์ของคุณ
    -หากเลือกไฟล์ผิดหรือไม่ใช่ภาพที่ต้องการอัพโหลด ให้กดปุ่ม สีแดง ข้างรูปภาพนั้นเพื่อยกเลิกการเลือก
    -เมื่อเพิ่มไฟล์ภาพที่ต้องการครบถ้วนแล้ว ให้กดปุ่ม UPLOAD เพื่อทำการอัพโหลดรูปภาพ
    -ระบบจะแสดงสถานะการอัพโหลด เช่น อัพโหลดสำเร็จ หรือ อัพโหลดไม่สำเร็จ
    `,
    lastUpdate: "วันอังคาร, 21 มิถุนายน 2567",
    author: "ผู้ดูแลระบบ",
  },
  {
    title: "หน้าแสดงห้องเรียน",
    group: "นิสิต",
    type: "ทั่วไป",
    content: `1.หน้าเข้าร่วมห้องเรียน
    -กดเมนู Join เพื่อเข้าสู่หน้าการเข้าร่วมห้องเรียน
    -กรอก รหัสห้องเรียน (Code) สำหรับเข้าร่วมห้องเรียน ที่ได้รับแจ้งจากอาจารย์เมื่อกรอกข้อมูลครบถ้วนแล้ว    ให้ กดปุ่ม เข้าร่วม
    -ระบบจะแสดงสถานะการเข้าร่วมห้อง เช่น เข้าร่วมสำเร็จ หรือ เข้าร่วมห้องนี้ไปแล้ว
    
    
    `,
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
