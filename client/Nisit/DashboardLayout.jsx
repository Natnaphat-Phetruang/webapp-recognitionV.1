import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
// import Headbar from "./Headbar";
// import { Box } from "@mui/material";

function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // หากไม่มี token หรือ token หมดอายุ ให้ไปที่หน้า login
    if (!token) {
      navigate("/Login");
    }

    // อาจเพิ่มการตรวจสอบ token ว่ายังถูกต้องอยู่
    // เช่น ตรวจสอบ JWT token expiration
  }, [navigate]);

  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
