import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import { toggleLanguage } from "../languageModel/languageSlice"; // Nyelvi slice
import en from "../languageModel/en.json"; // Angol szöveg
import hu from "../languageModel/hu.json"; // Magyar szöveg
import "../Design/settingStyle.css";

const Settings = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const language = useSelector((state) => state.language);
    const texts = language === "EN" ? en : hu; // Nyelv alapján betöltött szövegek

    const [profileImage, setProfileImage] = useState(null);
    const [name, setName] = useState("");
    const [originalUserName, setOriginalUserName] = useState("userName");
    const [newUserName, setNewUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleBack = () => navigate(-1);

    const handleUpdate = async () => {
        if (newPassword && newPassword !== confirmPassword) {
          console.log("New password and confirm password must match.");
          return;
        }
      
        if (!newUserName && !newPassword) {
          console.log("At least one field (username or password) must be updated.");
          return;
        }
      
        try {
          const token = localStorage.getItem("jwt");
          const response = await fetch("https://localhost:7196/api/user/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              oldPassword: oldPassword || null, // Ha üres, akkor null
              newUsername: newUserName || null, // Ha üres, akkor null
              newPassword: newPassword || null, // Ha üres, akkor null
            }),
          });
      
          if (response.ok) {
            console.log("Profile updated successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } else {
            const data = await response.json();
            console.log(data.message || "Failed to update profile.");
          }
        } catch (error) {
          console.log("An error occurred. Please try again.");
        }
      };

    const fetchProfileImage = async () => {
        try {
            const response = await fetch(
                "https://localhost:7196/api/user/get-profile-picture",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                }
            );
            console.log("Token:", localStorage.getItem("jwt"));

            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const imageBlob = await response.blob(); // A képet blob formátumban kapjuk vissza
            const imageUrl = URL.createObjectURL(imageBlob); // Blob URL-t készítünk
            setProfileImage(imageUrl);

            console.log("Image fetched successfully!");
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    // Hívjuk meg a képet a komponens betöltésekor
    useEffect(() => {
        fetchProfileImage();
    }, []);

    const handleProfileImageChange = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            console.error("No file selected");
            return;
        }

        // FileReader segítségével konvertáljuk a fájlt base64 formátumba
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result.split(",")[1]; // Az 'data:image/jpeg;base64,' rész levágása
            setProfileImage(reader.result);
            console.log(reader.result);
            try {
                const response = await fetch(
                    "https://localhost:7196/api/user/upload-profile-picture",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                        },
                        body: JSON.stringify({ base64Image }), // JSON-ben küldjük el a base64 képet
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Error uploading image: ${JSON.stringify(errorData)}`);
                } else {
                    console.log("Image uploaded successfully!");
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
            }
        };
        reader.readAsDataURL(file); // A fájlt base64 formátumban olvassa be
    };

    const handleLanguageToggle = () => {
        dispatch(toggleLanguage()); // Nyelv váltása Redux segítségével
    };

    // A szerverről felhasználói adatok lekérése
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            fetch("https://localhost:7196/api/user/details", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // A token itt van átadva
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("User details: ", data);
                    if (data) {
                        setName(data.name); // A válaszban 'name' és 'email' kell hogy szerepeljen
                        setUserEmail(data.email);

                        if (data.username) {
                            setOriginalUserName(data.username); // Az alapértelmezett felhasználónév beállítása
                            setNewUserName(data.username); // Az új felhasználónév beállítása
                            console.log("Username:", data.username);
                        } else {
                            console.error("Username is missing in the response");
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user details:", error);
                });
        }
    }, []);

    return (
        <Box
            sx={{
                backgroundColor: isDarkMode ? "#121212" : "white",
                color: isDarkMode ? "white" : "black",
                display: "flex",
                flexDirection: "column",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                maxWidth: "100vw",
                maxHeight: "100vh",
            }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: isDarkMode ? "#1c1c1c" : "white",
                }}>
                <Button
                    variant="text"
                    sx={{
                        color: isDarkMode ? "white" : "black",
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "bold",
                    }}
                    onClick={handleBack}>
                    {texts.buttons.back}
                </Button>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Button
                        variant="text"
                        onClick={handleLanguageToggle}
                        className="languageButtonSettings"
                        sx={{
                            color: isDarkMode ? "white" : "black",
                        }}>
                        {language}
                    </Button>

                    <Button
                        variant="text"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        sx={{
                            textTransform: "none",
                            color: isDarkMode ? "white" : "black",
                        }}>
                        {isDarkMode ? "Dark Mode" : "Light Mode"}
                    </Button>
                </div>

                <Typography
                    variant="h6"
                    sx={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>
                    {texts.headers.settings}
                </Typography>
            </Box>

            <Box sx={{ padding: "24px", flexGrow: 1, overflowY: "hidden" }}>
                <Box
                    sx={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
                    <Box
                        sx={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: "16px",
                        }}>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                }}
                            />
                        ) : (
                            <Typography variant="body1" sx={{ color: "#888" }}>
                                {texts.labels.noImage}
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ color: "#888" }}>
                            {originalUserName}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#888" }}>
                            {userEmail}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ marginBottom: "24px" }}>
                    <Button
                        variant="contained"
                        component="label"
                        sx={{
                            color: "white",
                            backgroundColor: "red",
                            textTransform: "none",
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: "darkred",
                            },
                        }}>
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleProfileImageChange}
                        />
                        {texts.buttons.changeImage}
                    </Button>
                </Box>

                <Box sx={{ marginBottom: "24px" }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                        {texts.headers.profile}
                    </Typography>
                    <TextField
                        label={texts.labels.username}
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />

                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                        {texts.headers.changePassword}
                    </Typography>

                    <TextField
                        label={texts.labels.oldPassword}
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        inputProps={{
                            autocomplete: "new-password", // Letiltja az automatikus kitöltést
                          }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowOldPassword(!showOldPassword)}>
                                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label={texts.labels.newPassword}
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label={texts.labels.confirmPassword}
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }>
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Button
                    variant="contained"
                    sx={{
                        color: "white",
                        backgroundColor: "red",
                        textTransform: "none",
                        fontWeight: "bold",
                        bottom: 15,
                        "&:hover": {
                            backgroundColor: "darkred",
                        },
                    }}
                    onClick={handleUpdate}>
                    {texts.buttons.saveSettings}
                </Button>
            </Box>
        </Box>
    );
};

export default Settings;
