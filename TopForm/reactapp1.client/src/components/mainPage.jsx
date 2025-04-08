import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon,
  Divider, 
  Box, 
  CssBaseline, 
  Tooltip,
  Typography,
  useTheme,
  Avatar,
  Badge
} from '@mui/material';
import {
  Home as HomeIcon,
  ExitToApp as ExitToAppIcon,
  Notes as NotesIcon,
  Restaurant as RestaurantIcon,
  EmojiEvents as EmojiEventsIcon,
  AccountCircle,
  Settings,
  Diamond,
  Whatshot,
  Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MainPageLayout = () => {
  const theme = useTheme();
const navigate = useNavigate();
  const menuItems = [
    { 
      path: 'home', 
      label: "Főoldal", 
      icon: <HomeIcon />,
      badge: null
    },
    { 
      path: 'workout', 
      label: "Edzésnapló", 
      icon: <NotesIcon />,
      badge: <Diamond sx={{ color: "#d4af37", ml: 1, fontSize: "1rem" }} />
    },
    { 
      path: 'diet', 
      label: "Étrendnapló", 
      icon: <RestaurantIcon />,
      badge: <Star sx={{ color: "#d4af37", ml: 1, fontSize: "1rem" }} />
    },
    { 
      path: 'leaderboard', 
      label: "Ranglista", 
      icon: <EmojiEventsIcon />,
      badge: <Whatshot sx={{ color: "#FF4500", ml: 1, fontSize: "1rem" }} />
    },
  ];

  const handleLogout = () => {
    // Remove JWT token from localStorage
    if(localStorage.getItem('jwt')){
      localStorage.removeItem('jwt');
    }
    // Redirect to login page
    navigate('/login');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      background: `
        linear-gradient(145deg, #000000 0%, #1a1a1a 100%),
        url('/premium-gym-bg.jpg') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
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
      <CssBaseline />
      
      <Drawer
        variant="permanent"
        sx={{
          width: 80,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 80,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderRight: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backdropFilter: 'blur(10px)',
            '&:hover': {
              width: 240,
              '& .menu-text': {
                opacity: 1,
                width: 'auto',
                ml: 2,
              },
            },
          },
        }}
      >
        <Box>


          <List sx={{ mt: 2 }}>
            {menuItems.map((item) => (
              <React.Fragment key={item.path}>
                <Tooltip title={item.label} placement="right" arrow>
                  <ListItem
                    button
                    component={Link}
                    to={item.path}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      py: 1.5,
                      px: '12px',
                      '&:hover': {
                        color: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: 'inherit', 
                      minWidth: '40px',
                      '& svg': {
                        fontSize: '1.5rem'
                      }
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <Typography
                      className="menu-text"
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        width: 0,
                        overflow: 'hidden',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        transition: theme.transitions.create(['opacity', 'width', 'margin'], {
                          duration: theme.transitions.duration.standard,
                        }),
                      }}
                    >
                      {item.label}
                      {item.badge}
                    </Typography>
                  </ListItem>
                </Tooltip>
                <Divider sx={{ 
                  my: 0.5, 
                  mx: 2,
                  borderColor: 'rgba(212, 175, 55, 0.1)' 
                }} />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Bottom Section - Profile and Logout */}
        <Box sx={{ pb: 2 }}>

          {/* Logout Button */}
          <Tooltip title="Log out" placement="right" arrow>
            <ListItem
              button
              onClick={handleLogout}  // Changed from component={Link} to onClick
              sx={{
                color: 'rgba(255,255,255,0.7)',
                py: 1.5,
                px: '12px',
                '&:hover': {
                  color: '#8B0000',
                  backgroundColor: 'rgba(139, 0, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: '40px',
                '& svg': {
                  fontSize: '1.5rem'
                }
              }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <Typography
                className="menu-text"
                variant="body2"
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  width: 0,
                  overflow: 'hidden',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  transition: theme.transitions.create(['opacity', 'width', 'margin'], {
                    duration: theme.transitions.duration.standard,
                  }),
                }}
              >
                Kijelentkezés
              </Typography>
            </ListItem>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
          zIndex: 1,
          '& a': {
            color: '#d4af37',
            '&:hover': {
              color: '#f5d020',
            }
          }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainPageLayout;