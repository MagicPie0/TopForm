import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import { toggleLanguage } from "../languageModel/languageSlice";
import en from "../languageModel/en.json";
import hu from "../languageModel/hu.json";
import { Diamond, ArrowBack } from "@mui/icons-material";
import { motion } from "framer-motion";

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu;

  // User data state
  const [userData, setUserData] = useState({
    profileImage: null,
    name: "",
    username: "",
    email: ""
  });
  
  // Password states
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // UI states
  const [visibility, setVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleBack = () => navigate(-1);

  const handleUpdate = async () => {
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setError(texts.errors?.passwordMismatch || "Passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("https://localhost:7196/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword || null,
          newUsername: userData.username || null,
          newPassword: passwords.newPassword || null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        const data = await response.json();
        setError(data.message || texts.errors?.updateFailed || "Update failed");
      }
    } catch (error) {
      setError(texts.errors?.generalError || "An error occurred");
    }
  };

  const fetchProfileImage = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://localhost:7196/api/user/get-profile-picture",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setUserData(prev => ({...prev, profileImage: imageUrl}));
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];
      setUserData(prev => ({...prev, profileImage: reader.result}));
      
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "https://localhost:7196/api/user/upload-profile-picture",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ base64Image }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || texts.errors?.imageUploadFailed || "Image upload failed");
        }
      } catch (error) {
        setError(texts.errors?.imageUploadFailed || "Image upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLanguageToggle = () => {
    dispatch(toggleLanguage());
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({...prev, [name]: value}));
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({...prev, [name]: value}));
  };

  const toggleVisibility = (field) => {
    setVisibility(prev => ({...prev, [field]: !prev[field]}));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          navigate("/login");
          return;
        }

        const [detailsResponse] = await Promise.all([
          fetch("https://localhost:7196/api/user/details", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }),
          fetchProfileImage()
        ]);

        if (!detailsResponse.ok) {
          throw new Error(texts.errors?.fetchFailed || "Failed to fetch data");
        }

        const data = await detailsResponse.json();
        setUserData(prev => ({
          ...prev,
          name: data.name || "",
          username: data.username || "",
          email: data.email || ""
        }));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [language, navigate, texts]);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212'
      }}>
        <CircularProgress sx={{ color: '#d4af37' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: '#fff',
      fontFamily: '"Montserrat", sans-serif',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'rgba(26, 26, 26, 0.8)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              color: '#d4af37',
              borderColor: '#d4af37',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)'
              }
            }}
            onClick={handleBack}
          >
            {texts.buttons?.back || "Back"}
          </Button>
        </motion.div>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#d4af37'
          }}
        >
          {texts.headers?.settings || "Settings"}
        </Typography>

        <Box sx={{ display: 'flex', gap: '10px' }}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="outlined"
              onClick={handleLanguageToggle}
              sx={{
                color: '#d4af37',
                borderColor: '#d4af37',
                minWidth: '60px',
                '&:hover': {
                  borderColor: '#d4af37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)'
                }
              }}
            >
              {language}
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: { xs: '20px', md: '40px' },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Profile Section */}
        <Card sx={{
          mb: 4,
          borderRadius: '8px',
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <Box sx={{
            background: 'linear-gradient(90deg, #8B0000, #d4af37)',
            padding: 2,
            textAlign: 'center',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.1em', color: 'white' }}>
              {texts.headers?.profile || "Profile"}
            </Typography>
          </Box>
          
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Avatar
                src={userData.profileImage}
                sx={{
                  width: 100,
                  height: 100,
                  border: '3px solid #d4af37',
                  boxShadow: '0 0 10px rgba(139, 0, 0, 0.2)',
                  mr: { sm: 3 },
                  mb: { xs: 2, sm: 0 }
                }}
              >
                {!userData.profileImage && (
                  <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {userData.username?.charAt(0) || '?'}
                  </Typography>
                )}
              </Avatar>
              
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  <Diamond sx={{ fontSize: '1rem', mr: 1, color: '#d4af37' }} /> 
                  {userData.username}
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: '#d4af37',
                  textTransform: 'uppercase'
                }}>
                  {userData.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {userData.email}
                </Typography>
              </Box>
            </Box>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{
                  background: 'linear-gradient(90deg, #8B0000, #d4af37)',
                  color: '#fff',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  borderRadius: '8px',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #d4af37, #8B0000)',
                    boxShadow: '0 0 10px rgba(139, 0, 0, 0.3)'
                  }
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                {texts.buttons?.changeImage || "Change Image"}
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Username Section */}
        <Card sx={{
          mb: 4,
          borderRadius: '8px',
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <CardContent>
            <TextField
              label={texts.labels?.username || "Username"}
              type="text"
              name="username"
              value={userData.username}
              onChange={handleUserDataChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d4af37',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(212, 175, 55, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card sx={{
          mb: 4,
          borderRadius: '8px',
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <Box sx={{
            background: 'linear-gradient(90deg, #8B0000, #d4af37)',
            padding: 2,
            textAlign: 'center',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
              {texts.headers?.changePassword || "Change Password"}
            </Typography>
          </Box>
          
          <CardContent>
            <TextField
              label={texts.labels?.oldPassword || "Old Password"}
              name="oldPassword"
              type={visibility.oldPassword ? "text" : "password"}
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility('oldPassword')}
                      sx={{ color: 'rgba(212, 175, 55, 0.7)' }}
                    >
                      {visibility.oldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d4af37',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(212, 175, 55, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                }
              }}
            />

            <TextField
              label={texts.labels?.newPassword || "New Password"}
              name="newPassword"
              type={visibility.newPassword ? "text" : "password"}
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility('newPassword')}
                      sx={{ color: 'rgba(212, 175, 55, 0.7)' }}
                    >
                      {visibility.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d4af37',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(212, 175, 55, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                }
              }}
            />

            <TextField
              label={texts.labels?.confirmPassword || "Confirm Password"}
              name="confirmPassword"
              type={visibility.confirmPassword ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility('confirmPassword')}
                      sx={{ color: 'rgba(212, 175, 55, 0.7)' }}
                    >
                      {visibility.confirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d4af37',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(212, 175, 55, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #8B0000, #d4af37)',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.05em',
              borderRadius: '8px',
              py: 2,
              mb: 2,
              '&:hover': {
                background: 'linear-gradient(90deg, #d4af37, #8B0000)',
                boxShadow: '0 0 10px rgba(139, 0, 0, 0.3)'
              }
            }}
            onClick={handleUpdate}
          >
            {texts.buttons?.saveSettings || "Save Settings"}
          </Button>
        </motion.div>
      </Box>

      {/* Snackbars for feedback */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {texts.success?.updateSuccess || "Settings updated successfully"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;