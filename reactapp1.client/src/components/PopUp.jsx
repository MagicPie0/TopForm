import React, { useEffect, useState } from "react";
import { Box, IconButton, LinearProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const PopUp = ({ open, onClose, content, duration = 5000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) return;
  
    // Időzítő indítása, de az animációval csak az eltűnésre figyelünk
    let interval = null;
    const startTime = Date.now();
  
    interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
  
      if (remaining === 0) {
        clearInterval(interval);
        onClose(); // Automatikus bezárás
      }
    }, 100);
  
    return () => clearInterval(interval); // Időzítő tisztítása komponens elhagyásakor
  }, [open, duration, onClose]);
  

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "150px",
        right: "2px",
        height: "auto",
        width: "300px",
        borderRadius: "5px",
        bgcolor: "#FFF9C4",
        boxShadow: 24,
        p: 3,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 1000, // Magasabb réteg, hogy a tartalom előtt legyen
        transition: "opacity 0.5s ease-in-out", // Lassan tűnjön el a pop-up
        opacity: progress === 0 ? 0 : 1, // Ha a progress elérte a 0-t, akkor eltűnik
      }}
    >
      {/* Bezárás ikon */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: "3px",
          right: "3px",
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* Tartalom */}
      <div>{content}</div>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          marginTop: "5px", // Távolság a tartalomtól
          height: "5px",
          width: "100%",
          borderRadius: "2px",
          bgcolor: "rgba(255, 249, 196, 0.6)", // Beleolvadó háttérszín
          "& .MuiLinearProgress-bar": {
            bgcolor: "#FFD700", // Sárga futó csík
          },
        }}
      />
    </Box>
  );
};

export default PopUp;
