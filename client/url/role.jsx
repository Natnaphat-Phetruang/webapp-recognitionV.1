import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem("role", selectedRole); // บันทึก role ไปยัง localStorage
    navigate("/"); // กลับไปยังหน้าหลักหลังจากเลือก role เสร็จ
  };

  return (
    <div>
      <h2>เลือกบทบาทของคุณ:</h2>
      <button onClick={() => handleRoleSelect("teacher")}>Teacher</button>
      <button onClick={() => handleRoleSelect("student")}>Student</button>
    </div>
  );
}

export default RoleSelection;
