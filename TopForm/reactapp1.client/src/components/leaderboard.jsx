import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  Typography, 
  TextField, 
  Card, 
  Button, 
  Divider, 
  Grid,
  Avatar,
  IconButton,
  Chip,
  useTheme
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, Close, Refresh, OpenInNew, Diamond, Whatshot, Star } from "@mui/icons-material";
import UserDetailsPopup from "./userDetailsPopup";
import quotes from "../workout/quotes.json";
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
import Profil from "./Icons/ProfilPicDark.png";

const Leaderboard = () => {
  const theme = useTheme();
  const [quote, setQuote] = useState("");
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [selectedUserForPopup, setSelectedUserForPopup] = useState(null);
  const [selectedUserForChart, setSelectedUserForChart] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [error, setError] = useState(null);

  const {
    mutate: loadLeaderboardData,
    isLoading,
    isError,
    error: mutationError,
    data: fetchedLeaderboardData,
  } = useLeaderboardData();

  const rankImages = {
    Beginner,
    Advanced,
    Intermediate,
    Pro,
    Champion,
    Master,
    Elite,
    Apex,
    Titan,
    Legend: LegendPic,
  };

  useEffect(() => {
    if (fetchedLeaderboardData) {
      const sortedData = [...fetchedLeaderboardData].sort((a, b) => {
        const pointsA = Number(a.rank?.points || 0);
        const pointsB = Number(b.rank?.points || 0);
        return pointsB - pointsA;
      });
      setLeaderboardData(sortedData);
    }
  }, [fetchedLeaderboardData]);

  const chartData = selectedUserForChart
    ? [{
        name: selectedUserForChart.username,
        arm: selectedUserForChart.muscleGroup?.kg1 || 0,
        chest: selectedUserForChart.muscleGroup?.kg2 || 0,
        leg: selectedUserForChart.muscleGroup?.kg3 || 0,
        calf: selectedUserForChart.muscleGroup?.kg4 || 0,
      }]
    : [];

  const getRankImages = (rank) => {
    if (!rank || !rank.rankName) return rankImages.Beginner;
    return rankImages[rank.rankName] || rankImages.Beginner;
  };

  const getProfilePicture = (user) => {
    if (!user?.profilPic) return Profil;
    const mimeType = user.profilPic.startsWith("/9j/") ? "jpeg" : "png";
    return `data:image/${mimeType};base64,${user.profilPic}`;
  };

  const generateQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };

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
      setError("Nem sikerült betölteni a híreket");
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  useEffect(() => {
    generateQuote();
    fetchNews();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      const result = leaderboardData.find((user) =>
        user.username.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResult(result || null);
      setSelectedUserForChart(result || null);
    } else {
      setSearchResult(null);
      setSelectedUserForChart(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResult(null);
    setSelectedUserForChart(null);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: `
        linear-gradient(145deg, #000000 0%, #1a1a1a 100%),
        url('/premium-gym-bg.jpg') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
      color: '#fff',
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        zIndex: 0
      }
    }}>
      <Box sx={{
        flex: 1,
        p: { xs: 2, md: 4 },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" sx={{ 
            color: "#d4af37",
            fontWeight: 700,
            mb: 1,
            textTransform: "uppercase",
            textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
          }}>
            Ranglista <Diamond sx={{ color: '#d4af37', fontSize: '1.2em' }} />
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: "rgba(255,255,255,0.7)",
            mb: 4,
            fontSize: '1.1rem'
          }}>
            Versenyzz másokkal hogy megszerezd az első helyet!
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Keresés a ranglistán..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <Search sx={{ color: "#d4af37", mr: 1 }} />,
                  endAdornment: searchTerm && (
                    <IconButton onClick={clearSearch} size="small">
                      <Close sx={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }} />
                    </IconButton>
                  ),
                  style: {
                    color: '#fff',
                    backgroundColor: 'rgba(26, 26, 26, 0.7)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '0',
                    fontSize: '0.95rem',
                    padding: '12px 16px'
                  },
                }}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root.Mui-focused': {
                    borderColor: '#d4af37',
                    boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)'
                  }
                }}
              />
            </motion.div>

            <Box sx={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: { xs: 2, sm: 4 },
              height: 280,
              mb: 6
            }}>
              {[1, 0, 2].map((pos) => {
                const user = leaderboardData[pos];
                const heights = [260, 220, 200];
                const placeColors = ["#d4af37", "#C0C0C0", "#CD7F32"];
                const color = placeColors[pos];
                
                return (
                  <motion.div
                    key={pos}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card sx={{
                      width: { xs: 100, sm: 120 },
                      height: heights[pos],
                      background: `linear-gradient(to bottom, ${color} 0%, ${color}00 100%)`,
                      backgroundBlendMode: 'overlay',
                      backgroundColor: 'rgba(30, 30, 30, 0.8)',
                      borderRadius: '12px 12px 0 0',
                      border: `1px solid ${color}`,
                      boxShadow: `0 10px 20px -5px ${color}40`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      p: 2,
                      position: 'relative',
                      overflow: 'visible',
                      '&::before': {
                        content: `"${pos + 1}"`,
                        position: 'absolute',
                        top: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: pos === 0 ? '#000' : '#fff',
                        fontWeight: 'bold',
                        fontSize: 20
                      }
                    }}>
                      <Box sx={{ 
                        position: 'absolute',
                        top: -35,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        border: `3px solid ${color}`,
                        backgroundColor: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }}>
                        <Avatar
                          src={user ? getProfilePicture(user) : Profil}
                          sx={{ 
                            width: '100%', 
                            height: '100%',
                          }}
                        />
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ 
                        color: '#fff',
                        fontWeight: 600,
                        mt: 6,
                        mb: 1,
                        textAlign: 'center'
                      }}>
                        {user?.username || "—"}
                      </Typography>
                      
                      <Chip 
                        label={`${pos + 1}. helyezett`}
                        size="small"
                        sx={{ 
                          backgroundColor: color,
                          color: pos === 0 ? '#000' : '#fff',
                          fontWeight: 600,
                          mb: 1
                        }}
                      />
                    </Card>
                  </motion.div>
                );
              })}
            </Box>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ 
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '0',
                p: 0,
                mb: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3,
                  borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent)'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#d4af37',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}>
                    GLOBÁLIS RANGLISTA <Whatshot sx={{ color: '#FF4500', ml: 1 }} />
                  </Typography>
                  <Button 
                    startIcon={<Refresh />}
                    onClick={loadLeaderboardData}
                    sx={{ 
                      color: '#d4af37',
                      fontSize: 12,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(212, 175, 55, 0.1)'
                      }
                    }}
                  >
                    Frissítés
                  </Button>
                </Box>
                
                <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                  {leaderboardData.map((user, index) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Box
                        onClick={() => {
                          setSelectedUserForPopup(user);
                          setSelectedUserForChart(user);
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(212, 175, 55, 0.05)',
                            borderLeft: '3px solid #d4af37'
                          },
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        <Typography sx={{ 
                          width: 40,
                          color: index < 3 ? '#d4af37' : 'rgba(255,255,255,0.7)',
                          fontWeight: index < 3 ? 700 : 400,
                          fontSize: 15
                        }}>
                          {index + 1}.
                        </Typography>
                        
                        <Avatar
                          src={getProfilePicture(user)}
                          sx={{ 
                            width: 42,
                            height: 42,
                            mr: 2,
                            border: '1px solid rgba(212, 175, 55, 0.5)'
                          }}
                        />
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ 
                            fontWeight: 500,
                            color: '#fff'
                          }}>
                            {user.username}
                          </Typography>
                          <Typography sx={{ 
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.6)'
                          }}>
                            {user.rank?.rankName || "Kezdő"} szint
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography sx={{ 
                            color: '#d4af37',
                            fontWeight: 600,
                            fontSize: 14
                          }}>
                            {user.rank?.points || 0}
                          </Typography>
                          <img
                            src={getRankImages(user.rank)}
                            alt="rank"
                            style={{ width: 24, height: 24 }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Card>
            </motion.div>

            {selectedUserForChart && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '0',
                  p: 3,
                  mb: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3, 
                    mb: 3 
                  }}>
                    <Avatar
                      src={getProfilePicture(selectedUserForChart)}
                      sx={{ 
                        width: 80,
                        height: 80,
                        border: '3px solid #d4af37',
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
                      }}
                    />
                    <Box>
                      <Typography variant="h5" sx={{ 
                        color: '#d4af37',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}>
                        {selectedUserForChart.username}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        mt: 0.5
                      }}>
                        Teljesítmény statisztikák
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ 
                    borderColor: 'rgba(212, 175, 55, 0.2)',
                    my: 2,
                    borderWidth: '1px'
                  }} />
                  
                  <Typography variant="h6" sx={{ 
                    color: '#d4af37',
                    mb: 2,
                    fontWeight: 600
                  }}>
                    IZOMCSOPORT ERŐNLÉT
                  </Typography>
                  
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(255,255,255,0.1)" 
                        />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.7)"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.7)"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a',
                            borderColor: '#d4af37',
                            borderRadius: 4,
                            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="arm" 
                          fill="#d4af37" 
                          name="Kar" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="chest" 
                          fill="#8B0000" 
                          name="Mell" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="leg" 
                          fill="#555" 
                          name="Láb" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="calf" 
                          fill="#999" 
                          name="Vádli" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </motion.div>
            )}
          </Grid>

          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card sx={{ 
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '0',
                p: 3,
                mb: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#d4af37',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}>
                    FITNESS HÍREK
                  </Typography>
                  <Button 
                    size="small"
                    onClick={fetchNews}
                    startIcon={<Refresh fontSize="small" />}
                    sx={{ 
                      color: '#d4af37',
                      fontSize: 12,
                      textTransform: 'none'
                    }}
                  >
                    Frissítés
                  </Button>
                </Box>
                
                {error ? (
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    py: 2
                  }}>
                    {error}
                  </Typography>
                ) : news.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {news.map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -2 }}
                      >
                        <Card sx={{ 
                          backgroundColor: 'rgba(40, 40, 40, 0.6)',
                          border: '1px solid rgba(212, 175, 55, 0.1)',
                          borderRadius: '0',
                          p: 2,
                          transition: 'all 0.3s ease'
                        }}>
                          <Typography variant="subtitle1" sx={{ 
                            color: '#fff',
                            fontWeight: 500,
                            mb: 1
                          }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 13,
                            mb: 1.5
                          }}>
                            {item.description?.substring(0, 120)}...
                          </Typography>
                          <Button
                            href={item.url}
                            target="_blank"
                            size="small"
                            endIcon={<OpenInNew fontSize="small" />}
                            sx={{ 
                              color: '#d4af37',
                              fontSize: 12,
                              textTransform: 'none',
                              p: 0,
                              '&:hover': {
                                backgroundColor: 'rgba(212, 175, 55, 0.1)'
                              }
                            }}
                          >
                            Tovább olvasom
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    py: 2
                  }}>
                    Hírek betöltése...
                  </Typography>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card sx={{ 
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '0',
                p: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)',
                  zIndex: 0
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#d4af37',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 700
                  }}>
                    NAPI MOTIVÁCIÓ <Whatshot sx={{ color: '#FF4500' }} />
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: '#fff',
                    fontStyle: 'italic',
                    mb: 3,
                    fontSize: 18,
                    lineHeight: 1.5,
                    position: 'relative',
                    pl: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: 3,
                      background: '#d4af37',
                      borderRadius: 3
                    }
                  }}>
                    "{quote}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      onClick={generateQuote}
                      size="small"
                      startIcon={<Refresh fontSize="small" />}
                      sx={{ 
                        color: '#d4af37',
                        fontSize: 12,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(212, 175, 55, 0.1)'
                        }
                      }}
                    >
                      Új idézet
                    </Button>
                    
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.3)',
                      alignSelf: 'flex-end'
                    }}>
                      #FitnessMotiváció
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {selectedUserForPopup && (
        <UserDetailsPopup
          user={selectedUserForPopup}
          onClose={() => setSelectedUserForPopup(null)}
        />
      )}
    </Box>
  );
};

export default Leaderboard;