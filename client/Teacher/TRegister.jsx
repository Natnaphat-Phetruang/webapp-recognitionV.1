import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

const RegisterTeacher = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    emailError: "",
    lengthError: "",
    uppercaseError: "",
    specialCharError: "",
  });
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
  });

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@ku\.th$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const lengthValid = password.length >= 6;
    const uppercaseValid = /[A-Z]/.test(password);
    const specialCharValid = /[\W_]/.test(password);

    let lengthError = "";
    let uppercaseError = "";
    let specialCharError = "";

    if (!lengthValid) {
      lengthError = "Password must be at least 6 characters.";
    } else if (!uppercaseValid) {
      uppercaseError = "Password must contain at least one uppercase letter.";
    } else if (!specialCharValid) {
      specialCharError =
        "Password must contain at least one special character.";
    }

    setErrors({
      lengthError,
      uppercaseError,
      specialCharError,
    });

    return lengthValid && uppercaseValid && specialCharValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isPasswordMatch = password === confirmPassword;
    const emailValid = validateEmail(email);
    if (!emailValid) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        emailError: "Please use your @ku.th email address.",
      }));
      return;
    }

    if (!validatePassword(password)) {
      return;
    } else if (!isPasswordMatch) {
      setErrors({
        ...errors,
        matchError: "Passwords do not match. Please check again.",
      });
      return;
    }

    try {
      // กำหนดข้อมูลที่ต้องการส่ง
      const jsonData = {
        email,
        password,
        fname: formData.fname,
        lname: formData.lname,
      };

      // เรียก API สำหรับการลงทะเบียนอาจารย์
      const registerResponse = await axios.post(
        "http://localhost:3333/registerteacher",
        jsonData
      );
      const registerData = registerResponse.data;

      if (registerData.status === "success") {
        toast.success("Register successfully", {
          autoClose: 900,
          position: "top-center",
        });
        setTimeout(() => {
          navigate("/Login");
        }, 1500);
      } else {
        toast.error("Registration failed: " + registerData.message, {
          autoClose: 1000,
          position: "top-center",
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.message;

        if (serverMessage === "Email already exists") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            emailError: "This email address is already in use.",
          }));
        } else {
          toast.error(serverMessage, {
            autoClose: 1000,
            position: "top-center",
          });
        }
      } else {
        toast.error("An error occurred during registration", {
          autoClose: 1000,
          position: "top-center",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 3, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Row 1 */}
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  name="fname"
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                  value={formData.fname}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  name="lname"
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                  value={formData.lname}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 2 */}
              <Grid item xs={12}>
                <TextField
                  label="Email @ku.th"
                  name="email"
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.emailError}
                  helperText={errors.emailError}
                />
              </Grid>

              {/* Row 3 */}
              <Grid item xs={12}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    label="Password"
                    name="password"
                    type={visible ? "text" : "password"}
                    fullWidth
                    required
                    variant="outlined"
                    margin="dense"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={
                      !!errors.lengthError ||
                      !!errors.uppercaseError ||
                      !!errors.specialCharError
                    }
                    helperText={
                      errors.lengthError ||
                      errors.uppercaseError ||
                      errors.specialCharError
                    }
                    InputProps={{
                      endAdornment: (
                        <div
                          onClick={() => setVisible(!visible)}
                          style={{ cursor: "pointer" }}
                        >
                          {visible ? (
                            <EyeOutlined className="icon" />
                          ) : (
                            <EyeInvisibleOutlined className="icon" />
                          )}
                        </div>
                      ),
                    }}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    label="Confirm Password"
                    name="confirmpassword"
                    type={visible ? "text" : "password"}
                    fullWidth
                    required
                    variant="outlined"
                    margin="dense"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!errors.matchError}
                    helperText={errors.matchError}
                    InputProps={{
                      endAdornment: (
                        <div
                          onClick={() => setVisible(!visible)}
                          style={{ cursor: "pointer" }}
                        >
                          {visible ? (
                            <EyeOutlined className="icon" />
                          ) : (
                            <EyeInvisibleOutlined className="icon" />
                          )}
                        </div>
                      ),
                    }}
                  />
                </div>
              </Grid>

              {errors.emailError && (
                <Grid item xs={12}>
                  <Alert severity="error">{errors.emailError}</Alert>
                </Grid>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
          </form>
          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Link to="/Login" style={{ textDecoration: "none", color: "blue" }}>
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterTeacher;
