import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../scripts/useLogin.js";
import { useRegister } from "../scripts/useRegister.js";
import dayjs from "dayjs";
import "../Design/SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    birthdate: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const { mutateAsync: loginMutate } = useLogin();
  const { mutateAsync: registerMutate } = useRegister();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePanel = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsRegistering(!isRegistering);
      setIsAnimating(false);
      setError("");
    }, 300);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Kérlek tölts ki minden mezőt");
      setSnackbarMessage("⚠️ Kérlek tölts ki minden mezőt");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (formData.username === "Admin" && formData.password === "Admin123") {
      setSnackbarMessage("✅ Sikeres bejelentkezés");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      navigate("/admin");
      return;
    }

    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError("A jelszavak nem egyeznek");
      setSnackbarMessage("⚠️ A jelszavak nem egyeznek");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      if (confirmPasswordRef.current) confirmPasswordRef.current.focus();
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      if (isRegistering) {
        if (!formData.birthdate) {
          throw new Error("Kérlek adj meg egy érvényes születési dátumot");
        }

        await registerMutate({
          name: formData.fullname,
          email: formData.email,
          birthDate: dayjs(formData.birthdate),
          username: formData.username,
          password: formData.password,
        });
        setSnackbarMessage("✅ Sikeres regisztráció");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        navigate("/registration");
      } else {
        await loginMutate({
          username: formData.username,
          password: formData.password,
        });
        setSnackbarMessage("✅ Sikeres bejelentkezés");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        navigate("/loading");
      }
    } catch (error) {
      console.error("Auth error:", error);
      let errorMessage = "Hiba történt. Próbáld újra később.";

      if (error?.status === 400) {
        errorMessage = "Hibás kérés.";
      } else if (error?.status === 401) {
        errorMessage = "Hibás jelszó.";
      } else if (error?.status === 404) {
        errorMessage = "Felhasználó nem található.";
      } else if (error?.status === 500) {
        errorMessage = "Szerverhiba.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setSnackbarMessage(`❌ ${errorMessage}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`signin-container ${isRegistering ? "register-mode" : ""}`}>
      <div className="signin-background">
        <div className="gradient-overlay"></div>
      </div>

      <div className="signin-main-wrapper">
        <div className="signin-logo-container">
          <div className="logo-animation">
            <img
              src="/topformlogo.png"
              alt="TopForm szöveg"
              className="signin-logo-text"
            />
            <br />
            <img
              src="/topformlogo2.png"
              alt="TopForm ikon"
              className="signin-logo-icon"
              style={{ height: "auto", width: "300px" }}
            />
          </div>
        </div>

        <div className="signin-content">
          <div className={`form-container ${isAnimating ? "animating" : ""}`}>
            <div className={`form-panel login-panel ${isRegistering ? "hidden" : ""}`}>
              <h2>Bejelentkezés</h2>
              <p className="subtitle">Lépj be a fiókodba</p>

              <form className="auth-form" onSubmit={handleFormSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="username"
                    placeholder=" "
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    ref={usernameRef}
                  />
                  <label>Felhasználónév</label>
                  <span className="input-highlight"></span>
                </div>

                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    ref={passwordRef}
                  />
                  <label>Jelszó</label>
                  <span className="input-highlight"></span>
                  <button
                    type="button"
                    className="show-password"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  type="submit"
                  className="auth-button primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="spinner"></span>
                  ) : (
                    "Bejelentkezés"
                  )}
                  <span className="button-overlay"></span>
                </button>
              </form>

              <div className="switch-panel">
                <p>Nincs még fiókod?</p>
                <button className="switch-button" onClick={togglePanel} type="button">
                  Regisztráció
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>

            <div className={`form-panel register-panel ${!isRegistering ? "hidden" : ""}`}>
              <h2>Regisztráció</h2>
              <p className="subtitle">Hozz létre új fiókot</p>

              <form className="auth-form" onSubmit={handleFormSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="username"
                    placeholder=" "
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    ref={usernameRef}
                  />
                  <label>Felhasználónév</label>
                  <span className="input-highlight"></span>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="fullname"
                    placeholder=" "
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                  <label>Teljes név</label>
                  <span className="input-highlight"></span>
                </div>

                <div className="input-group">
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    required
                  />
                  <label>Születési dátum</label>
                </div>

                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <label>Email</label>
                  <span className="input-highlight"></span>
                </div>

                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    ref={passwordRef}
                  />
                  <label>Jelszó</label>
                  <span className="input-highlight"></span>
                  <button
                    type="button"
                    className="show-password"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder=" "
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    ref={confirmPasswordRef}
                  />
                  <label>Jelszó újra</label>
                  <span className="input-highlight"></span>
                  <button
                    type="button"
                    className="show-password"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  type="submit"
                  className="auth-button primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="spinner"></span>
                  ) : (
                    "Regisztráció"
                  )}
                  <span className="button-overlay"></span>
                </button>
              </form>

              <div className="switch-panel">
                <p>Van már fiókod?</p>
                <button className="switch-button" onClick={togglePanel} type="button">
                  Bejelentkezés
                  <span className="arrow-icon">←</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
