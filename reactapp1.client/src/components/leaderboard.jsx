import React, { useState, useEffect } from "react";
import "../Design/leaderboardStyle.css";
import Profil from "./Icons/ProfilPicDark.png";
import UserDetailsPopup from "./userDetailsPopup";
import quotes from "../workout/quotes.json";
import { TextField, Box, Typography, Paper } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useLeaderboardData } from "../scripts/leaderboard.js";

import Advanced from "../rank_icons/advanced.png";
import Apex from "../rank_icons/apex.png";
import Beginner from "../rank_icons/beginner.png";
import Champion from "../rank_icons/champion.png";
import Elite from "../rank_icons/elite.png";
import Intermediate from "../rank_icons/intermediate.png";
import LegendPic from "../rank_icons/legend.png";
import Master from "../rank_icons/master.png";
import Pro from "../rank_icons/pro.png";
import Titan from "../rank_icons/titan.png";

const Leaderboard = () => {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [quote, setQuote] = useState("");
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [selectedUserForPopup, setSelectedUserForPopup] = useState(null); // Popup-hoz
  const [selectedUserForChart, setSelectedUserForChart] = useState(null); // Diagramhoz
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [profilePics, setProfilePics] = useState({}); // Az összes felhasználó profilképeinek tárolása
  const [error, setError] = useState(null);

  const {
    mutate: loadLeaderboardData,
    isLoading,
    isError,
    error: mutationError,
    data: fetchedLeaderboardData,
  } = useLeaderboardData();

  useEffect(() => {
    if (fetchedLeaderboardData) {
      console.log("Feltöltött leaderboard adatok:", fetchedLeaderboardData);
      setLeaderboardData(fetchedLeaderboardData);
    }
  }, [fetchedLeaderboardData]);

  // Diagram adatok a kiválasztott felhasználóhoz
  const chartData = selectedUserForChart
    ? [
        {
          name: selectedUserForChart.username,
          arm: selectedUserForChart.muscleGroup?.kg1 || 0,
          chest: selectedUserForChart.muscleGroup?.kg2 || 0,
          leg: selectedUserForChart.muscleGroup?.kg3 || 0,
          calf: selectedUserForChart.muscleGroup?.kg4 || 0,
        },
      ]
    : [];

  const rankImages = {
    Beginner: Beginner,
    Advanced: Advanced,
    Intermediate: Intermediate,
    Pro: Pro,
    Champion: Champion,
    Master: Master,
    Elite: Elite,
    Apex: Apex,
    Titan: Titan,
    Legend: LegendPic,
  };

  const getRankImages = (rank) => {
    if (!rank || !rank.rankName) {
      return rankImages.Beginner; // Alapértelmezett kép
    }
    switch (rank.rankName) {
      case "Beginner":
        return rankImages.Beginner;
      case "Advanced":
        return rankImages.Advanced;
      case "Intermediate":
        return rankImages.Intermediate;
      case "Pro":
        return rankImages.Pro;
      case "Champion":
        return rankImages.Champion;
      case "Master":
        return rankImages.Master;
      case "Elite":
        return rankImages.Elite;
      case "Apex":
        return rankImages.Apex;
      case "Titan":
        return rankImages.Titan;
      case "Legend":
        return rankImages.Legend;
      default:
        return rankImages.Beginner; // Alapértelmezett kép
    }
  };

  useEffect(() => {
    console.log("Chart Data:", chartData); // Ellenőrizzük a diagram adatokat
  }, [chartData]);

  // Véletlenszerű idézet generálása
  const generateQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };

  // Hírek lekérése
  const fetchNews = async () => {
    const apiKey = "daa169968ac14f62ae944e343c6a7e26";
    const url = `https://newsapi.org/v2/everything?q=fitness&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.articles) {
        setNews(data.articles.slice(0, 5));
      }
    } catch (error) {
      console.error("Hiba a hírek lekérésekor:", error);
    }
  };

  // Ranglista adatok betöltése
  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // Idézet és hírek betöltése
  useEffect(() => {
    generateQuote();
    fetchNews();
  }, []);

  // Keresés kezelése
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      const result = leaderboardData.find((user) =>
        user.username.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResult(result || null);
      console.log(result);
      setSelectedUserForChart(result || null); // Csak a diagramhoz beállítjuk a felhasználót
    } else {
      setSearchResult(null);
      setSelectedUserForChart(null);
    }
  };
  const getProfilePicture = (user) => {
    if (!user || !user.profilPic) return Profil; // Ha nincs adat, alapértelmezett kép
    const mimeType = user.profilPic.startsWith("/9j/") ? "jpeg" : "png"; // Base64 ellenőrzés
    return `data:image/${mimeType};base64,${user.profilPic}`;
  };
  //Szortírozás
  useEffect(() => {
    if (fetchedLeaderboardData) {
      console.log("Feltöltött leaderboard adatok:", fetchedLeaderboardData);
      
      const sortedData = [...fetchedLeaderboardData].sort((a, b) => {
        // Safely get points from rank objects, default to 0 if null/undefined
        const pointsA = a.rank?.points ? Number(a.rank.points) : 0;
        const pointsB = b.rank?.points ? Number(b.rank.points) : 0;
        
        return pointsB - pointsA;
      });
  
      setLeaderboardData(sortedData);
      console.log("Rendezett ranglista:", sortedData);
    }
  }, [fetchedLeaderboardData]);

  return (
    <div className="leaderboard-container">
      {/* Dobogó */}
      <div className="podium">
        <img
          src={
            leaderboardData[1] ? getProfilePicture(leaderboardData[1]) : Profil
          }
          alt={leaderboardData[1]?.username || "User"}
          className="podium-profile-pic-silver"
        />
        <div className="podium-item rank-2">
          <span className="podium-profilename-silver">
            {leaderboardData[1]?.username || "User2"}
          </span>
          <span className="podium-span-silver">2nd place</span>
        </div>
        <img
          src={
            leaderboardData[0] ? getProfilePicture(leaderboardData[0]) : Profil
          }
          alt={leaderboardData[0]?.username || "User"}
          className="podium-profile-pic-gold"
        />
        <div className="podium-item rank-1">
          <span className="podium-profilename-gold">
            {leaderboardData[0]?.username || "User1"}
          </span>
          <span className="podium-span-gold">1st place</span>
        </div>
        <img
          src={
            leaderboardData[2] ? getProfilePicture(leaderboardData[2]) : Profil
          }
          alt={leaderboardData[2]?.username || "User"}
          className="podium-profile-pic-bronze"
        />
        <div className="podium-item rank-3">
          <span className="podium-profilename-bronze">
            {leaderboardData[2]?.username || "User3"}
          </span>
          <span className="podium-span-bronze">3rd place</span>
        </div>
      </div>

      {/* Ranglista */}
      <div className="leaderboard">
        <div className="user-list">
          {leaderboardData.map((user) => (
            <div
              key={user.id}
              className={`user-item ${
                hoveredUser === user.id ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredUser(user.id)}
              onMouseLeave={() => setHoveredUser(null)}
              onClick={() => {
                setSelectedUserForPopup(user); // Csak a popup-hoz beállítjuk a felhasználót
              }}>
              <img
                src={getProfilePicture(user) || Profil} // Használjuk közvetlenül a 'user' objektumot
                alt={user.username}
                className="profile-pic"
              />
              <span className="user-name">{user.username}</span>
              <img
                src={getRankImages(user.rank)} // Javítva: getRankImages
                alt="rank icon"
                className="rank-icon"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Keresés */}
      <div className="search-container">
        <Box className="search-bar">
          <TextField
            fullWidth
            label="Keresés a ranglistán..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Box>
        <Paper
          className="search-result"
          elevation={3}
          sx={{ padding: 2, marginTop: 2 }}>
          {searchResult ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              <img
                className="search-pic"
                src={getProfilePicture(searchResult) || Profil} // Használjuk közvetlenül a 'user' objektumot
                alt={searchResult.username}
                style={{ width: 100, height: 100, borderRadius: "50%" }}
              />
              <Typography
                className="search-name"
                variant="h5"
                sx={{ marginTop: 1 }}>
                Name: {searchResult.username}
              </Typography>
              <Typography
                className="search-username"
                variant="span"
                sx={{ marginTop: 1 }}>
                Username: {searchResult.username}
              </Typography>
              <img
                className="search-rank"
                src={getRankImages(searchResult.rank)} // Javítva: getRankImages
                alt="rank icon"
                style={{ width: 100, height: 100, marginTop: 1 }}
              />
              {/* Diagram */}
              <Box className="chart-box" sx={{ marginTop: 4, padding: 2 }}>
                <BarChart
                  width={500}
                  height={300}
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="arm" fill="#252525" name="Kar" />
                  <Bar dataKey="chest" fill="silver" name="Mell" />
                  <Bar dataKey="leg" fill="#cd7f32" name="Láb" />
                  <Bar dataKey="calf" fill="#e0cd95" name="Vádli" />
                </BarChart>
              </Box>
            </Box>
          ) : (
            <Typography
              className="search-term"
              variant="body1"
              color="textSecondary">
              {searchTerm
                ? "Nincs találat a keresésre."
                : "Kezdj el keresni a ranglistán!"}
            </Typography>
          )}
        </Paper>
      </div>

      {/* Hírek */}
      <div className="news-container">
        <div className="news-box">
          <h3>Friss kondi hírek</h3>
          {news.length > 0 ? (
            news.map((article, index) => (
              <div key={index} className="news-item">
                <h4>{article.title}</h4>
                <p>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Tovább olvasom
                </a>
                <small>Forrás: {article.source.name}</small>
              </div>
            ))
          ) : (
            <p>Nincsenek elérhető kondi hírek.</p>
          )}
        </div>
      </div>

      {/* Idézet */}
      <div className="quote-box">
        <p>{quote}</p>
      </div>

      {/* Popup megjelenítése */}
      {selectedUserForPopup && (
        <UserDetailsPopup
          user={selectedUserForPopup}
          onClose={() => setSelectedUserForPopup(null)}
        />
      )}
    </div>
  );
};

export default Leaderboard;
