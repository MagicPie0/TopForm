import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleLanguage } from "../languageModel/languageSlice";
import en from "../languageModel/en.json";
import hu from "../languageModel/hu.json";
import {
  TextField,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import lightModeImage from "../darkMode/light-mode.png";
import darkModeImage from "../darkMode/dark-mode.png";
import "../Design/loginRegStyle.css";
import { initializeCanvasDots } from "../scripts/CanvasDots.js";
import { useLogin } from "../scripts/useLogin.js";
import { useRegister } from "../scripts/useRegister.js";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu; // Nyelv alapján betöltött szövegek

  // Állapotok a különböző mezők és funkciók kezeléséhez
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(dayjs());
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  // Mutációk a bejelentkezéshez és regisztrációhoz
  const { mutateAsync: loginMutate } = useLogin();
  const { mutateAsync: registerMutate } = useRegister();

  // Referenciák a mezők kezeléséhez
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const dateRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordAgainRef = useRef(null);

  // Form váltása bejelentkezés és regisztráció között
  const toggleForm = () => setIsRegistering((prev) => !prev);
  // Jelszó láthatóságának váltása
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Hibák állapota a mezők kezeléséhez
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    date: "",
    username: "",
    password: "",
    passwordAgain: "",
  });

  // Form beküldése
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    let newErrors = {};

    // Ellenőrizzük a mezőket, és ha a regisztrációt választották, a jelszót
    if (isRegistering) {
      // Jelszó és jelszó újraellenőrzés összehasonlítása
      if (password !== passwordAgain) {
        newErrors.passwordAgain = texts.errors.passwordsMismatch; // Szöveg a jelszó nem egyezéshez
      }
    }

    // Ha vannak hibák, állítsuk be azokat és fókuszáljunk az első hibás mezőre
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);

      const firstErrorField = Object.keys(newErrors)[0];
      switch (firstErrorField) {
        case "name":
          nameRef.current.focus();
          break;
        case "email":
          emailRef.current.focus();
          break;
        case "date":
          dateRef.current.focus();
          break;
        case "username":
          usernameRef.current.focus();
          break;
        case "password":
          passwordRef.current.focus();
          break;
        case "passwordAgain":
          passwordAgainRef.current.focus();
          break;
      }

      setSnackbarMessage(`⚠️ ${texts.errors.requiredFields}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setError("");
    setFieldErrors({});
    setIsProcessing(true);

    try {
      // Regisztráció vagy bejelentkezés
      if (isRegistering) {
        await registerMutate({
          name,
          email,
          birthDate: date,
          username,
          password,
        });
        navigate("/registration");
      } else {
        await loginMutate({ username, password });
        navigate("/mainPage");
      }
    } catch (error) {
      console.log(error.status);
      let errorField = error.status === 401 ? "password" : "username";

      let errorMessage = error?.response?.data?.message || "Hibás adatok.";

      // Hibák kezelése státuszkód alapján
      if (error.status) {
        if (error.status === 400) {
          errorMessage = "Hibás kérés.";
        } else if (error.status === 401) {
          errorMessage = "Hibás a jelszó.";
        } else if (error.status === 404) {
          errorMessage = "A felhasználó nem található.";
        } else if (error.status === 500) {
          errorMessage = "Szerver hiba.";
        }
      }

      setError(errorMessage);
      setSnackbarMessage(`❌ ${errorMessage}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);

      // Hibás mező fókuszálása
      if (errorField) {
        setFieldErrors((prev) => ({ ...prev, [errorField]: errorMessage }));
        if (errorField === "username") {
          usernameRef.current.focus();
        } else if (errorField === "password") {
          passwordRef.current.focus();
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Snackbar bezárása
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // CanvasDots inicializálása és tisztítása
  useEffect(() => {
    const cleanup = initializeCanvasDots(isDarkMode);

    return () => {
      if (cleanup) cleanup();
    };
  }, [isDarkMode]);

  return (
    <div className={`bg ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Nyelv váltó gomb */}
      <button
        className="languageButton"
        onClick={() => dispatch(toggleLanguage())}>
        {language}
      </button>

      {/* Mód váltó gomb */}
      <button className="modeButton" onClick={() => setIsDarkMode(!isDarkMode)}>
        <img
          src={isDarkMode ? darkModeImage : lightModeImage}
          alt="Mode Icon"
        />
      </button>

      <div
        className={`form-container ${isRegistering ? "register-mode" : ""} ${
          isDarkMode ? "dark-mode" : "light-mode"
        }`}>
        {/* Form fejléc */}
        <div className="form-header">
          <span
            className={`form-toggle ${!isRegistering ? "active" : ""}`}
            onClick={toggleForm}>
            {texts.forms.login}
          </span>
          <span
            className={`form-toggle ${isRegistering ? "active" : ""}`}
            onClick={toggleForm}>
            {texts.forms.register}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit}>
          {isRegistering && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <TextField
                name="nameInput"
                label={texts.fields.name}
                variant="outlined"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={isDarkMode ? "textField-dark" : "textField-light"}
                inputRef={nameRef}
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
              />
              <TextField
                name="emailInput"
                label={texts.fields.email}
                variant="outlined"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={isDarkMode ? "textField-dark" : "textField-light"}
                inputRef={emailRef}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
  label={texts.fields.birthDate}
  value={date}
  onChange={(newValue) => setDate(newValue)}
  slotProps={{
    textField: {
      variant: "outlined",
      fullWidth: true,
      required: true,
      error: !!fieldErrors.date,
      helperText: fieldErrors.date,
      inputRef: dateRef,
      InputProps: {
        endAdornment: (
          <InputAdornment position="end">
            <CalendarTodayIcon sx={{ color: isDarkMode ? "white" : "black" }} />
          </InputAdornment>
        ),
      },
      sx: {
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: isDarkMode ? "black" : "white",
          },
          "&.Mui-focused fieldset": {
            borderColor: isDarkMode ? "black" : "white",
          },
        },
        "& .MuiInputBase-input": {
          color: isDarkMode ? "black" : "white",
        },
        "& .MuiInputLabel-root": {
          color: isDarkMode ? "black" : "white",
        },
        "& .MuiSvgIcon-root": {
          color: isDarkMode ? "black" : "white",
        },
      },
    },
  }}
/>

              </LocalizationProvider>
            </Box>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="usernameInput"
              label={texts.fields.username}
              variant="outlined"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={isDarkMode ? "textField-dark" : "textField-light"}
              inputRef={usernameRef}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
            />
            <TextField
              name="passwordInput"
              label={texts.fields.password}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={isDarkMode ? "textField-dark" : "textField-light"}
              inputRef={passwordRef}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
            {isRegistering && (
              <TextField
                name="passwordAgainInput"
                label={texts.fields.passwordAgain}
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                required
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
                className={isDarkMode ? "textField-dark" : "textField-light"}
                inputRef={passwordAgainRef}
                error={!!fieldErrors.passwordAgain}
                helperText={fieldErrors.passwordAgain}
              />
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              type="submit"
              fullWidth
              disabled={isProcessing}>
              {isProcessing ? (
                <CircularProgress
                  size={24}
                  sx={{
                    color: isDarkMode ? "black" : "white",
                  }}
                />
              ) : isRegistering ? (
                texts.buttons.register
              ) : (
                texts.buttons.login
              )}
            </Button>
          </Box>
        </form>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 5 }} // 40 pixel margin top
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%", fontSize: "1.2rem" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
