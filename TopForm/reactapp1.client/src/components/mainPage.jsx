import React from 'react';
import { Link, Outlet } from 'react-router-dom';
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
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  ExitToApp as ExitToAppIcon,
  Notes as NotesIcon,
  Restaurant as RestaurantIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import backgroundDark from '../background/background-dark.png';

const MainPageLayout = () => {
  const theme = useTheme();

  const menuItems = [
    { path: 'home', label: "Home", icon: <HomeIcon /> },
    { path: 'workout', label: "Workout", icon: <NotesIcon /> },
    { path: 'diet', label: "Diet", icon: <RestaurantIcon /> },
    { path: 'leaderboard', label: "Leaderboard", icon: <EmojiEventsIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Collapsible Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 64,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 64,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '&:hover': {
              width: 200,
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
          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.path}>
                <Tooltip title={item.label} placement="right" arrow>
                  <ListItem
                    button
                    component={Link}
                    to={item.path}
                    sx={{
                      color: theme.palette.text.secondary,
                      py: 1.5,
                      px: '12px',
                      '&:hover': {
                        color: theme.palette.primary.main,
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <Typography
                      className="menu-text"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        width: 0,
                        overflow: 'hidden',
                        transition: theme.transitions.create(['opacity', 'width', 'margin'], {
                          duration: theme.transitions.duration.standard,
                        }),
                      }}
                    >
                      {item.label}
                    </Typography>
                  </ListItem>
                </Tooltip>
                <Divider sx={{ my: 0.5, mx: 2 }} />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Logout Button - Fixed at Bottom */}
        <Box sx={{ pb: 2 }}>
          <Tooltip title="Log out" placement="right" arrow>
            <ListItem
              button
              component={Link}
              to="/"
              sx={{
                color: theme.palette.text.secondary,
                py: 1.5,
                px: '12px',
                '&:hover': {
                  color: theme.palette.error.main,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <Typography
                className="menu-text"
                variant="body2"
                sx={{
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  width: 0,
                  overflow: 'hidden',
                  transition: theme.transitions.create(['opacity', 'width', 'margin'], {
                    duration: theme.transitions.duration.standard,
                  }),
                }}
              >
                Logout
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundDark})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'auto',
          color: '#ffffff',
          '& a': {
            color: theme.palette.primary.light,
            '&:hover': {
              color: theme.palette.primary.main,
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