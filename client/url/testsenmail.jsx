import React, { useState } from "react";
import axios from "axios"; // ใช้ axios สำหรับเรียก API

const AttendanceSimulation = () => {
  const [classroomId, setClassroomId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classroomId || !studentId) {
      setMessage("Please fill in both Classroom ID and Student ID.");
      return;
    }

    try {
      // เรียก API เพื่อตรวจสอบและส่งอีเมล
      const response = await axios.post(
        "http://localhost:3333/check-attendance",
        {
          classroomId,
          studentId,
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred while checking attendance.");
      }
    }

    setClassroomId("");
    setStudentId("");
  };

  return (
    <div>
      <h1>Attendance Simulation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Classroom ID:
            <input
              type="text"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Student ID:
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Check Attendance</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AttendanceSimulation;
