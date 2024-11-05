import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  BedOutlined,
  DocumentScannerOutlined,
} from "@mui/icons-material";
import DescriptionIcon from "@mui/icons-material/Description";

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 36,
      height: 36,
      border: "2px solid white", // เพิ่มขอบสีขาว
      borderRadius: "100%", // เพื่อให้แน่ใจว่ามันเป็นวงกลม
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

function App() {
  const [user, setUser] = useState();
  const [isOpen, setIsOpen] = useState(true); // สถานะการเปิด/ปิด Sidebar
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUserData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3333/Authen",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        if (data.status === "success") {
          setUser(data.decoded);
        } else {
          Swal.fire("Error", "Failed to fetch user data.", "error");
          localStorage.removeItem("token");
          navigate("/Login");
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire(
          "Error",
          "An error occurred. Please try again later.",
          "error"
        );
      }
    };

    fetchUserData();
  }, [navigate]);

  const drawer = (
    <div>
      {
        <Box
          sx={{
            padding: 0,
            backgroundColor: "#61616",
            display: "flex",
            alignItems: "center",
            borderRadius: 10,
          }}
        ></Box>
        /* <Box
        sx={{
          padding: 1,
          backgroundColor: "#616161",
          display: "flex",
          alignItems: "center",
        }}
      >
        {user ? (
          <>
            <Avatar {...stringAvatar(`${user.fname} ${user.lname}`)} />
            <Box ml={2}>
              <Typography variant="h6">{user.fname}</Typography>
              <Typography variant="subtitle1">{user.lname}</Typography>
            </Box>
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Box> */
      }
      <List>
        {["Document", "Room", "CreateRoom", "Settings", "Logout"].map(
          (text) => {
            let icon;
            let path = `/dashboard-teacher${text.toLowerCase()}`;
            let onClickHandler = () => navigate(path);

            switch (text) {
              case "Document":
                icon = <DescriptionIcon />;
                path = "/dashboard-teacher/THome";
                break;

              case "Room":
                icon = <BedOutlined />;
                path = "/dashboard-teacher/room";
                break;
              case "CreateRoom":
                icon = <DashboardIcon />;
                path = "/dashboard-teacher/createclassroom";
                break;
              case "Settings":
                icon = <SettingsIcon />;
                path = "/dashboard-teacher/TSettings";
                break;
              case "Logout":
                icon = <LogoutIcon />;
                onClickHandler = handleLogout;
                break;
              default:
                break;
            }
            return (
              <ListItem
                button
                key={text}
                onClick={onClickHandler}
                selected={location.pathname === path}
                sx={{
                  "&:hover": {
                    backgroundColor: "#3f51b5",
                    color: "#ffffff",
                    transition: "0.3s",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#ffffff",
                    color: "#000",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            );
          }
        )}
      </List>
    </div>
  );
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#212121",
          color: "#ffffff",
          width: { sm: `calc(100%)` }, // กำหนดความกว้างของ AppBar โดยหักลบความกว้างของ Sidebar
          ml: { sm: `15vw` }, // ความกว้างของ Sidebar
        }}
      >
        <Toolbar>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 35 }}>
              <Avatar {...stringAvatar(`${user.fname} ${user.lname}`)} />
              <Box
                ml={1}
                sx={{
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant="h9" component="div">
                  {user.fname} {user.lname}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                  ml: 2,
                  color: "white",
                }}
              >
                {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
          )}

          {/* ปุ่มแสดง/ซ่อน Sidebar */}

          {/* ชื่อของเว็บไซต์ */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            TEACHER WEBSITE
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary" // เปลี่ยนเป็น temporary
        sx={{
          "& .MuiDrawer-paper": {
            width: "15vw", // กำหนดความกว้างของกระดาษ
            height: "100vh", // กำหนดความสูงให้เต็มหน้าจอ
            boxSizing: "border-box",
            backgroundColor: "#212121",
            color: "#ffffff",
          },
        }}
        open={isOpen}
        onClose={() => setIsOpen(false)} // ปิด Drawer เมื่อกดข้าม
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* เนื้อหาของหน้าอื่น ๆ สามารถใส่ที่นี่ */}
        <Typography paragraph></Typography>
      </Box>
    </Box>
  );
}

export default App;
