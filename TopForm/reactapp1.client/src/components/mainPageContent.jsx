import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Divider,
  Grid,
  Snackbar,
  IconButton,
  useTheme,
  Grow,
  Button,
} from "@mui/material";
import {
  AccountCircle,
  Settings,
  FitnessCenter,
  Restaurant,
  Leaderboard,
  Close,
  Diamond,
  Star,
  Whatshot,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const MainPageContent = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState("");
  const [loginNotification, setLoginNotification] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken?.Name) {
        setUserName(decodedToken.Name);
        setLoginNotification(true);
      }
    }
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleCloseNotification = () => setLoginNotification(false);

  const features = [
    {
      title: "EDZÉSTERVEK",
      description:
        "Professzionális személyi edzők által tervezett, AI-alapú programok.",
      icon: <FitnessCenter fontSize="large" />,
      path: "/mainPage/workout",
      gradient: "linear-gradient(135deg, #d4af37, #f5d020)",
      badge: <Diamond sx={{ color: "#d4af37", ml: 1 }} />,
    },
    {
      title: "ÉTRENDTERVEK",
      description:
        "Táplálkozási szakértők által optimalizált étrendek, testtípus szerint.",
      icon: <Restaurant fontSize="large" />,
      path: "/mainPage/diet",
      gradient: "linear-gradient(135deg, #8B0000, #d4af37)",
      badge: <Star sx={{ color: "#d4af37", ml: 1 }} />,
    },
    {
      title: "RANGLISTA",
      description: "Versenyzz másokkal és szerezd meg az exkluzív jutalmakat!",
      icon: <Leaderboard fontSize="large" />,
      path: "/mainPage/leaderboard",
      gradient: "linear-gradient(135deg, #000000, #8B0000)",
      badge: <Whatshot sx={{ color: "#FF4500", ml: 1 }} />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `
        linear-gradient(145deg, #000000 0%, #1a1a1a 100%),
        url('/premium-gym-bg.jpg') no-repeat center center fixed
      `,
        backgroundSize: "cover",
        color: "#fff",
        fontFamily: '"Montserrat", sans-serif',
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      {/*Snackbar értesítés */}
      <Snackbar
        open={loginNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        message={`ÜDVÖZÖLJÜK, ${userName.toUpperCase()}!`}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseNotification}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          top: "6rem !important",
          right: "24px !important",
          left: "auto !important",
          transform: "none !important",
          "& .MuiSnackbarContent-root": {
            background: "linear-gradient(90deg, #d4af37, #8B0000)",
            color: "#fff",
            fontWeight: 700,
            borderRadius: "0",
            boxShadow: "0 4px 30px rgba(212, 175, 55, 0.4)",
            borderBottom: "2px solid #d4af37",
          },
        }}
      />

      {/* Profilmenü */}
      <Box sx={{ position: "fixed", top: 24, right: 24, zIndex: 1200 }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Avatar
            src="/vip-profile.png"
            sx={{
              width: 56,
              height: 56,
              cursor: "pointer",
              border: "2px solid #d4af37",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
              transition: "all 0.3s ease",
            }}
            onClick={handleMenuOpen}
          />
        </motion.div>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              width: 260,
              mt: 1.5,
              borderRadius: "0",
              background: "rgba(26, 26, 26, 0.95)",
              border: "1px solid #d4af37",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(10px)",
              "& .MuiMenuItem-root:hover": {
                background: "rgba(212, 175, 55, 0.1)",
              },
              color: "white",
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background: "linear-gradient(90deg, #8B0000, #d4af37)",
              color: "#fff",
              borderBottom: "1px solid #d4af37",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ display: "flex", alignItems: "center" }}
            >
              {userName}{" "}
              <Diamond sx={{ color: "#fff", ml: 1, fontSize: "1rem" }} />
            </Typography>
            <Typography variant="caption">TAG</Typography>
          </Box>
          <Divider sx={{ borderColor: "rgba(212, 175, 55, 0.3)" }} />
          <MenuItem
            component={Link}
            to="/mainPage/profil"
            onClick={handleMenuClose}
          >
            <ListItemIcon sx={{ color: "#d4af37" }}>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText>Profil</ListItemText>
          </MenuItem>
          <MenuItem
            component={Link}
            to="/mainPage/settings"
            onClick={handleMenuClose}
          >
            <ListItemIcon sx={{ color: "#d4af37" }}>
              <Settings />
            </ListItemIcon>
            <ListItemText sx={{ color: "#fffff" }}>Beállítások</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Tartalom */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          px: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ maxWidth: 1400, width: "100%", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logó rész - 2 képből áll */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 6,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Fő logó kép */}
                <Box
                  component="img"
                  src="/topformlogo.png"
                  alt="TopForm Logo"
                  sx={{
                    height: { xs: 80, sm: 100, md: 120 },
                    mb: 2,
                    filter: "drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))",
                  }}
                />
              </motion.div>

              {/* Ikon/melléklogó */}
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Box
                  component="img"
                  src="/topformlogo2.png"
                  alt="TopForm Icon"
                  sx={{
                    height: { xs: 40, sm: 50, md: 60 },
                    filter: "drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))",
                  }}
                />
              </motion.div>
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255,255,255,0.8)",
                mb: 6,
                fontSize: "1.2rem",
                letterSpacing: "0.1em",
                maxWidth: "800px",
                mx: "auto",
                textTransform: "uppercase",
              }}
            >
              A LEGMAGASABB SZÍNVONALÚ FITNESS PLATFORM
            </Typography>
          </motion.div>

          <Grid container spacing={6} justifyContent="center">
            {features.map((feature, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Grow in timeout={800 + i * 200}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      sx={{
                        borderRadius: "0",
                        background: "rgba(26, 26, 26, 0.7)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                        transition: "all 0.4s ease",
                        height: "100%",
                        overflow: "hidden",
                        position: "relative",
                        "&:hover": {
                          borderColor: "#d4af37",
                          boxShadow: "0 15px 40px rgba(212, 175, 55, 0.3)",
                          "& .card-hover-effect": {
                            left: "150%",
                            transition:
                              "left 0.7s cubic-bezier(0.19, 1, 0.22, 1)",
                          },
                          "& .card-glow": {
                            opacity: 0.1,
                          },
                        },
                      }}
                    >
                      {/* Animált háttér effekt */}
                      <Box
                        className="card-hover-effect"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "60%",
                          height: "100%",
                          background:
                            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(212,175,55,0.15) 50%, rgba(255,255,255,0) 100%)",
                          transform: "skewX(-25deg)",
                          zIndex: 1,
                          transition: "left 0.7s ease",
                        }}
                      />

                      {/* Másodlagos glow effekt */}
                      <Box
                        className="card-glow"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: feature.gradient,
                          opacity: 0,
                          transition: "opacity 0.4s ease",
                          zIndex: 0,
                        }}
                      />

                      {/* Tartalom */}
                      <Box
                        component={Link}
                        to={feature.path}
                        sx={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "block",
                          height: "100%",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        <Box
                          sx={{
                            background: feature.gradient,
                            padding: 3,
                            textAlign: "center",
                            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              borderRadius: "50%",
                              width: 90,
                              height: 90,
                              margin: "0 auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              mb: 2,
                              border: "2px solid rgba(212, 175, 55, 0.5)",
                              boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "rotate(15deg) scale(1.1)",
                                borderColor: "#d4af37",
                              },
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: "#fff",
                              letterSpacing: "0.05em",
                              fontSize: "1.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {feature.title} {feature.badge}
                          </Typography>
                        </Box>
                        <CardContent sx={{ padding: 4 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "rgba(255,255,255,0.8)",
                              lineHeight: 1.7,
                              fontSize: "1.1rem",
                              mb: 3,
                            }}
                          >
                            {feature.description}
                          </Typography>
                          <Button
                            variant="contained"
                            sx={{
                              background:
                                "linear-gradient(90deg, #8B0000, #d4af37)",
                              color: "#fff",
                              fontWeight: 700,
                              letterSpacing: "0.05em",
                              borderRadius: "0",
                              px: 4,
                              py: 1.5,
                              "&:hover": {
                                background:
                                  "linear-gradient(90deg, #d4af37, #8B0000)",
                                boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
                              },
                            }}
                          >
                            HOZZÁFÉRÉS
                          </Button>
                        </CardContent>
                      </Box>
                    </Card>
                  </motion.div>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/*Lábjegyzet */}
      <Box
        sx={{
          py: 3,
          textAlign: "center",
          background: "rgba(0, 0, 0, 0.7)",
          borderTop: "1px solid rgba(212, 175, 55, 0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.9rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          © {new Date().getFullYear()} TOPFORM. KIZÁRÓLAGOS JOGOK.
        </Typography>
      </Box>

      {/* Globális CSS animáció */}
      <style jsx global>{`
        @keyframes subtlePulse {
          0% {
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
          }
          100% {
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          }
        }
      `}</style>
    </Box>
  );
};

export default MainPageContent;
