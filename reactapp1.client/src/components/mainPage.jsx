import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  Divider,
  Box,
  CssBaseline,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import MapIcon from "@mui/icons-material/Map";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Routes, Route, Navigate } from "react-router-dom";
import MainPageContent from "./mainPageContent";
import Settings from "./settings";
import { useSelector, useDispatch } from "react-redux";
import { toggleLanguage } from "../languageModel/languageSlice";
import en from "../languageModel/en.json";
import hu from "../languageModel/hu.json";
import Workout from "./workoutPage";
import Diet from "./dietPage";
import Profil from "./profilePage";
import Leaderboard from "./leaderboard";
import backgroundDark from "../background/background-dark.png";

const MainPage = () => {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu;

  return (
    <div>
    
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Oldalsó menü */}
      <Drawer
        sx={{
          width: 140,
          flexShrink: 0,
          overflow: "hidden",
          "& .MuiDrawer-paper": {
            width: 40,
            boxSizing: "border-box",
            backgroundColor: "#fff",
            color: "",
          },
        }}
        variant="permanent"
        anchor="left">
        <List sx={{ position: "relative", height: "100vh" }}>
          <Tooltip title={texts.menu.home} placement="right">
            <ListItem
              component={Link}
              to="/mainPage/home"
              sx={{
                color: "#222",
                padding: "10px 0px 10px 7px",
                marginBottom: "5px",
                "&:hover": {
                  color: "red",
                },
              }}>
              <HomeIcon />
            </ListItem>
          </Tooltip>

          <Divider sx={{ bgcolor: "black", marginY: "10px" }} />

          <Tooltip title={texts.menu.workout} placement="right">
            <ListItem
              component={Link}
              to="/mainPage/workout"
              sx={{
                color: "#222",
                padding: "10px 0px 10px 7px",
                marginBottom: "5px",
                "&:hover": {
                  color: "red",
                },
              }}>
              <StickyNote2Icon />
            </ListItem>
          </Tooltip>

          <Divider sx={{ bgcolor: "black", marginY: "10px" }} />

          <Tooltip title={texts.menu.diet} placement="right">
            <ListItem
              component={Link}
              to="/mainPage/diet"
              sx={{
                color: "#222",
                padding: "10px 0px 10px 7px",
                marginBottom: "5px",
                "&:hover": {
                  color: "red",
                },
              }}>
              <FastfoodIcon />
            </ListItem>
          </Tooltip>


          <Divider sx={{ bgcolor: "black", marginY: "10px" }} />

          <Tooltip title={texts.menu.leaderboard} placement="right">
            <ListItem
              component={Link}
              to="/mainPage/leaderboard"
              sx={{
                color: "#222",
                padding: "10px 0px 10px 7px",
                marginBottom: "5px",
                "&:hover": {
                  color: "red",
                },
              }}>
              <EmojiEventsIcon />
            </ListItem>
          </Tooltip>

          <Divider sx={{ bgcolor: "black", marginY: "10px" }} />

          <Tooltip title={texts.menu.logout} placement="right">
            <ListItem
              sx={{
                position: "absolute",
                bottom: 10,
                width: "100%",
                color: "#222",
                padding: "5px 0px 6px 7px",
                "&:hover": {
                  color: "red",
                },
              }}
              component={Link}
              to="/">
              <ExitToAppIcon />
            </ListItem>
          </Tooltip>
        </List>
      </Drawer>

      {/* Dinamikus tartalom */}
      <Box
        component="main"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          backgroundImage: `url(${backgroundDark})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          width: "calc(120vw)",
          ml: -40,
          p: 3,
          overflow: "visible", // Győződj meg róla, hogy túlnyúló tartalom is látszik
          "::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Sötétebb réteg
            zIndex: 1,
          },
          "& > *": {
            zIndex: 2, // Tartalom ne legyen sötét
          },
        }}>
        <Routes>
          <Route path="/" element={<Navigate to="/mainPage/home" replace />} />
          <Route path="home" element={<MainPageContent />} />
          <Route path="settings" element={<Settings />} />
          <Route path="workout" element={<Workout/>}/>
          <Route path="profil" element={<Profil/>}/>
          <Route path="diet" element={<Diet/>}/>
          <Route path="leaderboard" element={<Leaderboard/>}/>
        </Routes>
      </Box>
    </Box>
    </div>
  );
};

export default MainPage;