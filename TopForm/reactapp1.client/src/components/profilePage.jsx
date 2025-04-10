import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Box, 
  Typography, 
  Avatar, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { ArrowBack, FitnessCenter, Star, Whatshot, Equalizer } from '@mui/icons-material';
import { useFetcProfile } from '../scripts/useFetchProfile';
import muscleGroups from '../workout/workout.json';
import { motion } from 'framer-motion';

const getMuscleGroupForExercise = (exerciseName) => {
  for (const [group, exercises] of Object.entries(muscleGroups)) {
    if (exercises.includes(exerciseName)) {
      return group;
    }
  }
  return null;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading, isError } = useFetcProfile();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' 
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    if (isError) {
      showSnackbar('Hiba történt a profiladatok betöltésekor', 'error');
    }
  }, [isError]);


  const processWorkoutData = () => {
    if (!profileData?.workouts) {
      return { data: [], status: 'warning', message: 'Nincs edzés adat a megjelenítéshez' };
    }
  
    try {
      const initialMuscleData = {};
      profileData.muscles?.groups?.forEach(group => {
        initialMuscleData[group.name.toLowerCase()] = group.kg;
      });
  
      const muscleGroupMap = {};
      if (Object.keys(initialMuscleData).length > 0) {
        muscleGroupMap['Initial'] = initialMuscleData;
      }
  
      profileData.workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          const muscleGroup = getMuscleGroupForExercise(exercise.name);
          if (muscleGroup) {
            if (!muscleGroupMap[workout.date]) {
              muscleGroupMap[workout.date] = {};
            }
            if (!muscleGroupMap[workout.date][muscleGroup] || 
                exercise.maxWeight > muscleGroupMap[workout.date][muscleGroup]) {
              muscleGroupMap[workout.date][muscleGroup] = exercise.maxWeight;
            }
          }
        });
      });
  
      const dates = Object.keys(muscleGroupMap).filter(d => d !== 'Initial');
      dates.sort((a, b) => new Date(a) - new Date(b));
  
      const chartData = [];
      if (muscleGroupMap['Initial']) {
        chartData.push({ date: 'Initial', ...muscleGroupMap['Initial'] });
      }
  
      dates.forEach(date => {
        chartData.push({ date, ...muscleGroupMap[date] });
      });
  
      let status = 'info';
      let message = 'Csak kezdeti adatok érhetőek el';
      if (chartData.length > 1) {
        status = 'success';
        message = 'Edzés előrehaladás betöltve';
      }
  
      return { data: chartData, status, message };
    } catch (error) {
      return { data: [], status: 'error', message: 'Hiba történt az edzésadatok feldolgozásakor' };
    }
  };
  


  const [workoutChartData, setWorkoutChartData] = useState([]);

  useEffect(() => {
    const { data, status, message } = processWorkoutData();
    setWorkoutChartData(data);
  }, [profileData]);
  
  

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
        color: '#d4af37'
      }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
        color: '#8B0000'
      }}>
        <Typography variant="h4">Error loading profile data</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        linear-gradient(145deg, #000000 0%, #1a1a1a 100%),
        url('/premium-gym-bg.jpg') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
      color: '#fff',
      fontFamily: '"Montserrat", sans-serif',
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: { xs: '80px 20px', md: '100px 40px' },
        position: 'relative',
        zIndex: 1
      }}>
        <Card sx={{
          mb: 6,
          borderRadius: '0',
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            background: 'linear-gradient(90deg, #8B0000, #d4af37)',
            padding: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
              PROFIL ADATOK
            </Typography>
          </Box>
          
          <Grid container spacing={4} sx={{ p: 4 }}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {profileData?.user?.ProfilePicture ? (
                <Avatar
                  src={`data:image/jpeg;base64,${profileData.user.ProfilePicture}`}
                  sx={{
                    width: 180,
                    height: 180,
                    border: '3px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                    mb: 3
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 180,
                    height: 180,
                    border: '3px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                    mb: 3,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    fontSize: '3rem'
                  }}
                >
                  {profileData?.user?.Username?.charAt(0) || '?'}
                </Avatar>
              )}
              
              <Typography variant="h5" sx={{ 
                color: '#d4af37',
                fontWeight: 700,
                mb: 1,
                textTransform: 'uppercase'
              }}>
                {profileData?.user?.Username || 'Username'}
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {profileData?.user?.Email || 'Email'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  color: '#d4af37',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                  pb: 1,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Star sx={{ mr: 1, color: '#d4af37' }} /> SZEMÉLYES ADATOK
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Név: {profileData?.user?.Name || 'N/A'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" sx={{ 
                  color: '#d4af37',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                  pb: 1,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Whatshot sx={{ mr: 1, color: '#d4af37' }} /> RANGSOR
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Szint: {profileData?.rank?.Name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Pontok: {profileData?.rank?.Points || '0'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Card>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              borderRadius: '0',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <Box sx={{
                background: 'linear-gradient(90deg, #8B0000, #d4af37)',
                padding: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                  IZOMCSOPORTOK
                </Typography>
              </Box>
              
              <CardContent>
                <Typography variant="subtitle1" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  mb: 2,
                  fontStyle: 'italic'
                }}>
                  Aktuális maximális súlyok
                </Typography>
                
                <List>
                  {profileData?.muscles?.groups?.map((group, index) => (
                    <ListItem 
                      key={group.name}
                      sx={{
                        borderBottom: index !== profileData.muscles.groups.length - 1 ? 
                          '1px solid rgba(212, 175, 55, 0.1)' : 'none',
                        py: 2
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ color: '#d4af37', fontWeight: 500 }}>
                            {group.name.toUpperCase()}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {group.kg} kg
                          </Typography>
                        }
                      />
                      <FitnessCenter sx={{ color: 'rgba(212, 175, 55, 0.7)' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card sx={{
              borderRadius: '0',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <Box sx={{
                background: 'linear-gradient(90deg, #8B0000, #d4af37)',
                padding: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                  EDZÉS FEJLŐDÉS
                </Typography>
              </Box>
              
              <CardContent>
                <Typography variant="subtitle1" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  mb: 3,
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Equalizer sx={{ mr: 1, color: '#d4af37' }} /> Testrészenkénti súlyprogresszió
                </Typography>
                
                <Box sx={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={workoutChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.2)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#d4af37"
                        tick={{ fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <YAxis 
                        stroke="#d4af37"
                        tick={{ fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(26, 26, 26, 0.9)',
                          border: '1px solid #d4af37',
                          borderRadius: '0',
                          color: '#fff'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: '20px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="arm" 
                        stroke="#ed0a0a" 
                        name="Kar" 
                        activeDot={{ r: 8, stroke: '#d4af37', strokeWidth: 2 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="chest" 
                        stroke="#0a7ded" 
                        name="Mell" 
                        activeDot={{ r: 8, stroke: '#d4af37', strokeWidth: 2 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="thigh" 
                        stroke="#0aed58" 
                        name="Comb" 
                        activeDot={{ r: 8, stroke: '#d4af37', strokeWidth: 2 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calf" 
                        stroke="#edb80a" 
                        name="Vádli" 
                        activeDot={{ r: 8, stroke: '#d4af37', strokeWidth: 2 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiPaper-root': {
            background: snackbar.severity === 'error' 
              ? 'linear-gradient(90deg, #8B0000, #d4af37)'
              : snackbar.severity === 'warning'
                ? 'linear-gradient(90deg, #FFA500, #d4af37)'
                : snackbar.severity === 'success'
                  ? 'linear-gradient(90deg, #006400, #d4af37)'
                  : 'linear-gradient(90deg, #1a1a1a, #d4af37)',
            color: '#fff',
            fontWeight: 600,
            borderRadius: '0',
            boxShadow: '0 4px 30px rgba(212, 175, 55, 0.4)',
            borderBottom: '2px solid #d4af37',
            minWidth: '300px',
            textAlign: 'center'
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: 'transparent',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
          iconMapping={{
            success: <Star fontSize="inherit" />,
            error: <Whatshot fontSize="inherit" />,
            warning: <FitnessCenter fontSize="inherit" />,
            info: <Equalizer fontSize="inherit" />
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;