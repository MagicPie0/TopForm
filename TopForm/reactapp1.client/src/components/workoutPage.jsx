import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Tooltip,
  MenuItem,
  Select,
  Grid,
  Box,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { motion } from "framer-motion";
import { Close, Add, Save, AutoFixHigh } from "@mui/icons-material";
import exercises from "../workout/workout.json";
import { useWorkout } from "../scripts/useWorkout";
import { useFetchWorkout } from "../scripts/useFetchWorkout";

const LOCAL_STORAGE_KEY = "workoutAppData";

const WorkoutApp = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [workout, setWorkout] = useState([]);
  const containerRef = useRef(null);
  const [showWorkoutContainer, setShowWorkoutContainer] = useState(false);
  const [isViewingSavedWorkout, setIsViewingSavedWorkout] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { mutate: saveWorkout, isLoading, isError, error } = useWorkout();
  const { data, isLoading: isFetching } = useFetchWorkout(
    selectedDate ? selectedDate.format("YYYY-MM-DD") : null
  );

  // AI funkció kezelése
  const handleAIClick = () => {
    // Ide jön az AI logika
    alert("AI edzéstervezés hamarosan elérhető lesz!");
  };

  // Load saved workout from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.workout && parsedData.workout.length > 0 && parsedData.workout.category != undefined) {
          setWorkout(parsedData.workout);
          setShowWorkoutContainer(true);
          setIsViewingSavedWorkout(false);
          setHasUnsavedChanges(true);
        }
      } catch (e) {
        console.error("Failed to parse saved workout data", e);
      }
    }
  }, []);

  // Save workout to localStorage
  useEffect(() => {
    if (workout.length > 0 && !isViewingSavedWorkout && hasUnsavedChanges) {
      const dataToSave = {
        workout: workout,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [workout, isViewingSavedWorkout, hasUnsavedChanges]);

  const GetMuscleGroups = (exerciseName) => {
    if (!exerciseName) return [];
    const muscleGroups = [];
    Object.entries(exercises).forEach(([group, exercises]) => {
      if (exercises.includes(exerciseName)) {
        muscleGroups.push(group);
      }
    });
    return muscleGroups;
  };

  const newWorkout = () => {
    setShowWorkoutContainer(true);
    setIsViewingSavedWorkout(false);
    setHasUnsavedChanges(true);
    setWorkout([{
      category: "",
      edzesTipus: "",
      suly: "",
      ismetles: "",
      sorozatok: [],
    }]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleCancelView = () => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.workout && parsedData.workout.length > 0) {
          setWorkout(parsedData.workout);
          setShowWorkoutContainer(true);
          setIsViewingSavedWorkout(false);
          setHasUnsavedChanges(true);
          setSelectedDate(null);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved workout data", e);
      }
    }

    setShowWorkoutContainer(false);
    setIsViewingSavedWorkout(false);
    setSelectedDate(null);
  };

  useEffect(() => {
    if (!selectedDate) return;

    if (data) {
      if (Array.isArray(data) && data.length > 0) {
        const allWorkoutDetails = data.flatMap(
          (workoutItem) => workoutItem.workoutDetails || []
        );

        const formattedWorkout = allWorkoutDetails.map((detail) => {
          const weights = Array.isArray(detail.weights) ? detail.weights : [detail.weights || 0];
          const reps = Array.isArray(detail.reps) ? detail.reps : [detail.reps || 0];
          const sets = Array.isArray(detail.sets) ? detail.sets : [detail.sets || 0];
          const numSets = sets.length > 0 ? sets[0] : 1;

          const sorozatok = Array.from({ length: numSets }, (_, i) => ({
            suly: weights[i] || weights[0] || 0,
            ismetles: reps[i] || reps[0] || 0,
          }));

          return {
            category: detail.muscleGroups?.join(", ") || "Unknown",
            edzesTipus: detail.exerciseName || "Unknown",
            suly: weights.join(", "),
            ismetles: reps.join(", "),
            sorozatok: sorozatok,
          };
        });

        setWorkout(formattedWorkout);
        setShowWorkoutContainer(true);
        setIsViewingSavedWorkout(true);
        setHasUnsavedChanges(false);
      } else {
        setWorkout([]);
        setShowWorkoutContainer(false);
        setIsViewingSavedWorkout(false);
      }
    }
  }, [data]);

  const handleAddCard = () => {
    if (workout.length === 0) {
      setShowWorkoutContainer(true);
    }
    setWorkout((prevCards) => [
      ...prevCards,
      { category: "", edzesTipus: "", suly: "", ismetles: "", sorozatok: [] },
    ]);
  };

  const removeCard = (index) => {
    setWorkout(workout.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const updatedWorkout = [...workout];
    updatedWorkout[index][field] = value;
    setWorkout(updatedWorkout);
  };

  const handleSorozatChange = (cardIndex, sorozatIndex, field, value) => {
    setWorkout((prev) =>
      prev.map((card, index) =>
        index === cardIndex
          ? {
            ...card,
            sorozatok: card.sorozatok.map((sorozat, i) =>
              i === sorozatIndex ? { ...sorozat, [field]: value } : sorozat
            ),
          }
          : card
      )
    );
  };

  const addSorozat = (cardIndex) => {
    setWorkout((prev) =>
      prev.map((card, index) =>
        index === cardIndex
          ? {
            ...card,
            sorozatok: [
              ...(card.sorozatok || []),
              { ismetles: "", suly: "" },
            ],
          }
          : card
      )
    );
  };

  const handleSave = () => {
    if (workout.length === 0) {
      console.error("Nincs workout adat a mentéshez!");
      return;
    }

    const isValid = workout.every((card) => {
      const isCardValid =
        card.category &&
        card.edzesTipus &&
        card.sorozatok &&
        card.sorozatok.every((sorozat) => sorozat.ismetles && sorozat.suly);
      return isCardValid;
    });

    if (!isValid) {
      console.error("Néhány mező üres! Kérlek, töltsd ki az összes mezőt.");
      return;
    }

    const workoutData = {
      workoutNames: workout.map((card) => card.edzesTipus || ""),
      weightsKg: workout.flatMap((card) =>
        card.sorozatok?.map((sorozat) => sorozat.suly?.toString() || "")
      ),
      reps: workout.flatMap((card) =>
        card.sorozatok?.map((sorozat) => sorozat.ismetles?.toString() || "")
      ),
      sets: workout.map((card) => (card.sorozatok?.length || 0).toString()),
    };

    saveWorkout(workoutData);
    setHasUnsavedChanges(false);
    setWorkout([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      color: '#fff',
      fontFamily: '"Montserrat", sans-serif',
      position: 'relative',
      padding: 4
    }}>
      {/* Fejléc */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        pb: 2
      }}>
        <Typography variant="h4" sx={{
          background: 'linear-gradient(90deg, #d4af37, #8B0000)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700
        }}>
          EDZÉSNAPLÓ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* AI gomb hozzáadva */}
          <Tooltip title="AI Edzéstervező" placement="bottom">
            <Button
              variant="contained"
              onClick={handleAIClick}
              startIcon={<AutoFixHigh />}
              sx={{
                background: 'linear-gradient(90deg, #4a148c, #7b1fa2)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(90deg, #7b1fa2, #4a148c)'
                }
              }}
            >
              AI
            </Button>
          </Tooltip>

          {!isViewingSavedWorkout && (
            <Tooltip title="Új edzés" placement="bottom">
              <Button
                variant="outlined"
                onClick={newWorkout}
                sx={{
                  color: '#d4af37',
                  borderColor: '#d4af37',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderColor: '#d4af37'
                  }
                }}
              >
                Új Edzés
              </Button>
            </Tooltip>
          )}
          {isViewingSavedWorkout && (
            <Tooltip title="Mégse" placement="bottom">
              <Button
                variant="outlined"
                onClick={handleCancelView}
                sx={{
                  color: '#d4af37',
                  borderColor: '#d4af37',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderColor: '#d4af37'
                  }
                }}
              >
                Mégse
              </Button>
            </Tooltip>
          )}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || null)}
              renderInput={({ inputRef, inputProps }) => (
                <Box sx={{
                  position: 'relative',
                  '& .MuiInputBase-root': {
                    color: '#fff',
                    '& fieldset': {
                      borderColor: '#d4af37'
                    },
                    '&:hover fieldset': {
                      borderColor: '#d4af37'
                    }
                  }
                }}>
                  <input
                    ref={inputRef}
                    {...inputProps}
                    style={{
                      width: '180px',
                      padding: '10px',
                      background: 'rgba(26, 26, 26, 0.7)',
                      border: '1px solid #d4af37',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                  />
                </Box>
              )}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {/* Edzés kártyák */}
      {(showWorkoutContainer && workout.length > 0) && (
        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            padding: 2,
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#d4af37',
              borderRadius: '3px'
            }
          }}
        >
          {Array.isArray(workout) &&
            workout.map((card, cardIndex) => (
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: cardIndex * 0.1 }}
              >
                <Card sx={{
                  width: 320,
                  background: 'rgba(26, 26, 26, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '8px',
                  position: 'relative',
                  color: 'white',
                  paddingTop: '25px', // Adj egy kis paddinget, hogy az X gomb ne fedje el a tartalmat

                  '&:hover': {
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                  }
                }}>
                  {!isViewingSavedWorkout && (
                    <IconButton
                      onClick={() => removeCard(cardIndex)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#d4af37',
                        zIndex: 1, // Biztosítja, hogy a gomb a kategória fölött legyen

                      }}
                    >
                      <Close />
                    </IconButton>
                  )}

                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Select
                          value={card.category || ""}
                          onChange={(e) =>
                            handleInputChange(cardIndex, "category", e.target.value)
                          }
                          displayEmpty
                          fullWidth
                          sx={{
                            mb: 2,
                            '& .MuiSelect-select': {
                              color: '#fff',
                              fontSize: '0.875rem'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d4af37'
                            },
                            '& .MuiSelect-icon': {
                              color: '#fff', // <- ez konkrétan a nyíl ikon
                            },
                          }}
                          disabled={isViewingSavedWorkout}
                        >
                          <MenuItem value="" disabled>
                            <Typography variant="body2" color="white">
                              Kategória
                            </Typography>
                          </MenuItem>
                          {Object.keys(exercises).map((category) => (
                            <MenuItem
                              key={category}
                              value={category}
                              sx={{ fontSize: '0.875rem'}}
                            >
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {card.category && (
                          <Select
                            value={card.edzesTipus || ""}
                            onChange={(e) =>
                              handleInputChange(cardIndex, "edzesTipus", e.target.value)
                            }
                            displayEmpty
                            fullWidth
                            sx={{
                              mb: 2,
                              '& .MuiSelect-select': {
                                color: '#fff',
                                fontSize: '0.875rem'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d4af37'
                              },
                              '& .MuiSelect-icon': {
                                color: '#fff', // <- ez konkrétan a nyíl ikon
                              },
                            }}
                            disabled={isViewingSavedWorkout}
                          >
                            <MenuItem value="" disabled>
                              <Typography variant="body2" color="white">
                                Gyakorlat
                              </Typography>
                            </MenuItem>
                            {exercises[card.category].map((exercise) => (
                              <MenuItem
                                key={exercise}
                                value={exercise}
                                sx={{ fontSize: '0.875rem' }}
                              >
                                {exercise}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </Grid>
                    </Grid>

                    {!isViewingSavedWorkout && (
                      <Button
                        onClick={() => addSorozat(cardIndex)}
                        startIcon={<Add />}
                        sx={{
                          mt: 1,
                          color: '#d4af37',
                          borderColor: '#d4af37',
                          '&:hover': {
                            backgroundColor: 'rgba(212, 175, 55, 0.1)'
                          }
                        }}
                        variant="outlined"
                        size="small"
                      >
                        Sorozat
                      </Button>
                    )}

                    <Box sx={{ mt: 2 }}>
                      {card.sorozatok?.map((sorozat, sorozatIndex) => (
                        <Box
                          key={sorozatIndex}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                          }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 24 }}>
                            {sorozatIndex + 1}.
                          </Typography>
                          <input
                            type="number"
                            placeholder="Ismétlés"
                            value={sorozat.ismetles || ""}
                            onChange={(e) =>
                              handleSorozatChange(cardIndex, sorozatIndex, "ismetles", e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              color: '#fff',
                              minWidth: 0
                            }}
                            disabled={isViewingSavedWorkout}
                          />
                          <input
                            type="number"
                            placeholder="Súly (kg)"
                            value={sorozat.suly || ""}
                            onChange={(e) =>
                              handleSorozatChange(cardIndex, sorozatIndex, "suly", e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              color: '#fff',
                              minWidth: 0
                            }}
                            disabled={isViewingSavedWorkout}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

          {workout.length > 0 && !isViewingSavedWorkout && (
            <Box sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              mt: 2
            }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleAddCard}
                  sx={{
                    minWidth: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '2px dashed #d4af37',
                    color: '#d4af37',
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.1)'
                    }
                  }}
                >
                  <Add fontSize="large" />
                </Button>
              </motion.div>
            </Box>
          )}

          {workout.length > 0 && !isViewingSavedWorkout && (
            <Box sx={{
              position: 'sticky',
              bottom: 20,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              mt: 3,
              zIndex: 1
            }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  startIcon={<Save />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(90deg, #8B0000, #d4af37)',
                    color: '#fff',
                    '&:hover': {
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
                    }
                  }}
                >
                  {isLoading ? "Mentés..." : "Edzés mentése"}
                </Button>
              </motion.div>
            </Box>
          )}
        </Box>
      )}

      {isError && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#8B0000',
          color: '#fff',
          px: 3,
          py: 2,
          borderRadius: '4px',
          zIndex: 10
        }}>
          Hiba történt: {error.message}
        </Box>
      )}
    </Box>
  );
};

export default WorkoutApp;