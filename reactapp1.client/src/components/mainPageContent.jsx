import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import "../Design/mainPageStyle.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StarsIcon from "@mui/icons-material/Stars";
import SettingsIcon from "@mui/icons-material/Settings";
import ProfilPic from "./Icons/ProfilPicLight.png";
import PopUp from "./PopUp";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import en from "../languageModel/en.json";
import hu from "../languageModel/hu.json";
import { jwtDecode } from "jwt-decode"; // importáljuk a jwt-decode könyvtárat

const MainPageContent = () => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [userName, setUserName] = useState("");

  // Redux állapotból nyelvi beállítás
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu;

  // Kiolvassuk a felhasználó nevét a localStorage-ból
  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      if (decodedToken && decodedToken.Name) {
        setUserName(decodedToken.Name);
      }
    }
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  useEffect(() => {
    if (isPopUpOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsPopUpOpen(false);
      }, 5000);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [isPopUpOpen]);

  const handleClose = () => {
    setIsPopUpOpen(false);
  };

  return (
    <Box sx={{ textAlign: "center", padding: 4 }}>
      <div className="header">Welcome to TopForm!</div>

      {/* Profil gomb */}
      <div
        className="menu-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <div className="menu-trigger">
          <Avatar
            alt="User Profile"
            src={ProfilPic}
            sx={{
              position: "absolute",
              top: "20px",
              right: "20px",
              height: "50px",
              width: "50px",
              borderRadius: "50%",
              ":hover": {
                opacity: "1",
                cursor: "pointer",
              },
            }}
          />
        </div>
        <div className={`dropdown-menu ${open ? "active" : "inactive"}`}>
          <h3>
            {userName} <br />
          </h3>
          <ul>
            <DropdownItem
              icon={<AccountCircleIcon />}
              text={<Link to="/profil">{texts.menu.profile}</Link>}
            />
            <DropdownItem
              icon={<SettingsIcon />}
              text={<Link to="/settings">{texts.menu.settings}</Link>}
            />
          </ul>
        </div>
      </div>

      <div className="card-container">
        {/* Kártyák */}
        <Link to="/mainPage/workout">
          <div className="card card1">
            <div className="card-content">
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "2.5rem" },
                }}
                className="title">
                Create Your Workout
              </Typography>
              <Typography
                variant="body"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                }}
                className="description">
                Design your own workout plan or let AI generate one based on
                your goals and preferences.
              </Typography>
            </div>
          </div>
        </Link>

        <Link to="/mainPage/diet">
          <div className="card card2">
            <div className="card-content">
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "2.5rem" },
                }}
                className="title">
                Fuel Your Body Right
              </Typography>
              <Typography
                variant="body"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                }}
                className="description">
                Get personalized diet plans or use AI to help you track your
                meals and make healthier choices.
              </Typography>
            </div>
          </div>
        </Link>

        <Link to="/mainPage/leaderboard">
          <div className="card card3">
            <div className="card-content">
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "2.5rem" },
                }}
                className="title">
                Compete and Conquer
              </Typography>
              <Typography
                variant="body"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.2rem" },
                }}
                className="description">
                Join the community, track your progress, and see where you stand
                on the leaderboard.
              </Typography>
            </div>
          </div>
        </Link>
      </div>
      <footer className="footer">© 2025 TopForm. All rights reserved.</footer>
    </Box>
  );
};

function DropdownItem(props) {
  return (
    <li className="dropdownItem">
      {props.icon && (
        <div
          style={{
            maxWidth: "20px",
            marginRight: "4px",
            marginTop: "6px",
            opacity: "0.5",
            transition: "var(--speed)",
          }}>
          {props.icon}
        </div>
      )}
      {props.text}
    </li>
  );
}

export default MainPageContent;
