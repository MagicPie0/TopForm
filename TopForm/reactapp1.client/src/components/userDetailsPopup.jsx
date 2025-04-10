import React from "react";
import "../Design/leaderboardPopUp.css";
import Profil from "./Icons/ProfilPicDark.png";
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

const UserDetailsPopup = ({ user, onClose }) => {
  if (!user) return null;

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
      return rankImages.Beginner; 
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
        return rankImages.Beginner; 
    }
  };
  const getProfilePicture = (user) => {
    if (!user || !user.profilPic) return Profil;
    const mimeType = user.profilPic.startsWith("/9j/") ? "jpeg" : "png";
    return `data:image/${mimeType};base64,${user.profilPic}`;
  };
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <div className="popup-header">
          <img
            src={getProfilePicture(user) || Profil}
            className="popup-profile-pic"
          />
          <h2>{user.username}</h2>
          <img
            src={getRankImages(user.rank)}
            alt="rank icon"
            className="popup-rank-icon"
          />
        </div>
        <div className="popup-body">
          <h3>Erőmérő adatok:</h3>
          <ul>
            <li>
              <strong>Kar:</strong> {user.muscleGroup?.kg1 || 0} kg
            </li>
            <li>
              <strong>Mell:</strong> {user.muscleGroup?.kg2 || 0} kg
            </li>
            <li>
              <strong>Comb:</strong> {user.muscleGroup?.kg3 || 0} kg
            </li>
            <li>
              <strong>Vádli:</strong> {user.muscleGroup?.kg4 || 0} kg
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPopup;
