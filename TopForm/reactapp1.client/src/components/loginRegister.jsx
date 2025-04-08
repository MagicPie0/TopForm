import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleLanguage } from "../languageModel/languageSlice";
import en from "../languageModel/en.json";
import hu from "../languageModel/hu.json";
import { useLogin } from "../scripts/useLogin.js";
import { useRegister } from "../scripts/useRegister.js";
import dayjs from "dayjs";
import "../Design/SignIn.css";
import { Height } from "@mui/icons-material";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu;

  // State for form data and UI
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
  // Add missing state for forgot password modal

  // Mutations for login and register
  const { mutateAsync: loginMutate } = useLogin();
  const { mutateAsync: registerMutate } = useRegister();

  // Refs for form fields
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
      setError(""); // Clear any errors when switching panels
    }, 300);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.username || !formData.password) {
      setError(
        texts.errors.emptyFields || "Please fill in all required fields"
      );
      setSnackbarMessage(
        `⚠️ ${texts.errors.emptyFields || "Please fill in all required fields"}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Validate passwords match if registering
    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError(texts.errors.passwordsMismatch);
      setSnackbarMessage(`⚠️ ${texts.errors.passwordsMismatch}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      if (confirmPasswordRef.current) confirmPasswordRef.current.focus();
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      if (isRegistering) {
        // Make sure birthdate is valid
        if (!formData.birthdate) {
          throw new Error(
            texts.errors.invalidBirthdate || "Please enter a valid birthdate"
          );
        }

        await registerMutate({
          name: formData.fullname,
          email: formData.email,
          birthDate: dayjs(formData.birthdate),
          username: formData.username,
          password: formData.password,
        });
        setSnackbarMessage(`✅ ${texts.success.registration}`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        navigate("/registration");
      } else {
        await loginMutate({
          username: formData.username,
          password: formData.password,
        });
        setSnackbarMessage(`✅ ${texts.success.login}`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        navigate("/mainPage");
      }
    } catch (error) {
      console.error("Auth error:", error);

      // Provide user-friendly error messages
      let errorMessage = texts.errors.general;

      if (error?.status === 400) {
        errorMessage = texts.errors.badRequest;
      } else if (error?.status === 401) {
        errorMessage = texts.errors.wrongPassword;
      } else if (error?.status === 404) {
        errorMessage = texts.errors.userNotFound;
      } else if (error?.status === 500) {
        errorMessage = texts.errors.serverError;
      } else if (error?.response?.data?.message) {
        // Use the server's message but ensure it's user-friendly
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Use error message from thrown Error objects
        errorMessage = error.message;
      }

      setError(errorMessage);
      setSnackbarMessage(`❌ ${errorMessage}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);

      // Don't clear the form data when an error occurs
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`signin-container ${isRegistering ? "register-mode" : ""}`}>
      {/* Animated Background */}
      <div className="signin-background">
        <div className="gradient-overlay"></div>
      </div>

      {/* Language Toggle Button */}
      <button
        className="languageButton"
        onClick={() => dispatch(toggleLanguage())}
      >
        {language}
      </button>

      {/* Main Content */}
      <div className="signin-content">
        {/* Logo Section */}
        <div className="signin-logo-container">
          <div className="logo-animation">
            <img
              src="/topformlogo2.png"
              alt="TopForm icon"
              className="signin-logo-icon"
            />
            <img
              src="/topformlogo.png"
              alt="TopForm text"
              className="signin-logo-text"
            />
          </div>
        </div>

        {/* Form Panels */}
        <div className={`form-container ${isAnimating ? "animating" : ""}`}>
          {/* Login Form */}
          <div
            className={`form-panel login-panel ${
              isRegistering ? "hidden" : ""
            }`}
          >
            <h2>{texts.forms.login}</h2>
            <p className="subtitle">{texts.forms.loginSubtitle}</p>

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
                <label>{texts.fields.username}</label>
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
                <label>{texts.fields.password}</label>
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
                  texts.buttons.login
                )}
                <span className="button-overlay"></span>
              </button>
            </form>

            <div className="switch-panel">
              <p>{texts.forms.noAccount}</p>
              <button
                className="switch-button"
                onClick={togglePanel}
                type="button"
              >
                {texts.buttons.register}
                <span className="arrow-icon">→</span>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <div
            className={`form-panel register-panel ${
              !isRegistering ? "hidden" : ""
            }`}
          >
            <h2>{texts.forms.register}</h2>
            <p className="subtitle">{texts.forms.registerSubtitle}</p>

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
                <label>{texts.fields.username}</label>
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
                <label>{texts.fields.name}</label>
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
                <label>{texts.fields.birthDate}</label>
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
                <label>{texts.fields.email}</label>
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
                <label>{texts.fields.password}</label>
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
                <label>{texts.fields.passwordAgain}</label>
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
                  texts.buttons.register
                )}
                <span className="button-overlay"></span>
              </button>
            </form>

            <div className="switch-panel">
              <p>{texts.forms.haveAccount}</p>
              <button
                className="switch-button"
                onClick={togglePanel}
                type="button"
              >
                {texts.buttons.login}
                <span className="arrow-icon">←</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
