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
  CardContent,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [difficulty, setDifficulty] = useState("közepes");
  const [isGenerating, setIsGenerating] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { mutate: saveWorkout, isLoading, isError, error } = useWorkout();
  const { data, isLoading: isFetching } = useFetchWorkout(
    selectedDate ? selectedDate.format("YYYY-MM-DD") : null
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleAIClick = () => {
    setAiDialogOpen(true);
  };

  const handleMuscleGroupToggle = (group) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const extractWeight = (info) => {
    if (!info) return "";
    const weightMatch = info.match(/(\d+)\s*kg/i);
    return weightMatch
      ? weightMatch[1]
      : info.toLowerCase().includes("test")
      ? "BW"
      : "";
  };

  const normalizeCategory = (cat) =>
    Object.keys(exercises).find(
      (k) => k.toLowerCase() === cat?.toLowerCase()
    ) || Object.keys(exercises)[0];

  const calculateRecommendedWeight = (category, exercise, reps) => {
    const WEIGHT_RANGES = {
      kar: { min: 5, max: 20 },
      mell: { min: 20, max: 100 },
      hát: { min: 15, max: 80 },
      láb: { min: 30, max: 120 },
    };

    const range = WEIGHT_RANGES[category] || { min: 10, max: 50 };
    const baseWeight = Math.round((range.min + range.max) / 2 / 5) * 5;

    return reps < 8
      ? baseWeight * 1.2
      : reps > 12
      ? baseWeight * 0.8
      : baseWeight;
  };

  const createDefaultExercise = () => ({
    category: Object.keys(exercises)[0],
    edzesTipus: exercises[Object.keys(exercises)[0]][0],
    suly: "0", 
    ismetles: "10",
    sorozatok: Array.from({ length: 3 }, () => ({ suly: "0", ismetles: "10" })),
  });

  const handleGenerateWorkout = async () => {
    if (selectedMuscleGroups.length === 0) {
      setSnackbar({
        open: true,
        message: "Válassz legalább egy izomcsoportot!",
        severity: "warning",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = generatePrompt(selectedMuscleGroups, difficulty);
      const response = await fetch(
        "https://localhost:7196/api/GenerateWorkout/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            InputText: prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedWorkout = parseAIResponse(data);

      setWorkout(generatedWorkout);
      setShowWorkoutContainer(true);
      setIsViewingSavedWorkout(false);
      setHasUnsavedChanges(true);
      setAiDialogOpen(false);

      setSnackbar({
        open: true,
        message: "AI generálás sikeres!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error during AI workout generation:", error);
      setSnackbar({
        open: true,
        message: `Hiba történt: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrompt = (muscleGroups, difficulty) => {
    let prompt = `Készíts egy ${difficulty} szintű edzéstervet a következő izomcsoportokra: ${muscleGroups.join(
      ", "
    )}.\n\n`;
    prompt +=
      "Kizárólag a következő gyakorlatokat használhatod az edzéstervben:\n\n";

    for (const category of muscleGroups) {
      if (exercises[category]) {
        prompt += `${category}: ${exercises[category].join(", ")}\n`;
      }
    }

    prompt +=
      "\nA válasz minden sora egy gyakorlatot tartalmazzon, a következő formátumban:\n";
    prompt +=
      "Izomcsoport: Gyakorlatnév - IsmétlésszámxSorozatszám (súly kg)\n\n";
    prompt += "Példák:\n";

    let exampleCount = 0;
    for (const category of muscleGroups) {
      if (
        exercises[category] &&
        exercises[category].length > 0 &&
        exampleCount < 3
      ) {
        const exercise = exercises[category][0];
        let reps, sets, weight;

        if (difficulty === "kezdő") {
          reps = "8";
          sets = "3";
          weight = "10";
        } else if (difficulty === "közepes") {
          reps = "10";
          sets = "3";
          weight = "20";
        } else {
          reps = "12";
          sets = "4";
          weight = "30";
        }

        prompt += `${category}: ${exercise} - ${reps}x${sets} (${weight} kg)\n`;
        exampleCount++;
      }
    }

    prompt += "\nHasználj kizárólag a fenti listában szereplő gyakorlatokat!\n";

    if (difficulty === "kezdő") {
      prompt +=
        "Kezdőknek több pihenővel, kevesebb sorozattal (2-3) és közepes ismétléssel (8-10) tervezz.\n";
    } else if (difficulty === "közepes") {
      prompt +=
        "Közepes szinten 3-4 sorozatot és 10-12 ismétlést tervezz gyakorlatonként.\n";
    } else if (difficulty === "haladó") {
      prompt +=
        "Haladóknak összetett gyakorlatokat, 4-5 sorozatot és 8-15 ismétlést tervezz.\n";
    }

    prompt += "Csak a kiválasztott izomcsoportokra adj gyakorlatokat.\n";
    prompt += "Edzésterv:";
    return prompt;
  };

  const parseAIResponse = (response) => {
    if (!response?.generatedText) {
      console.error("Invalid AI response format", response);
      return {
        category: validateCategory(category, exerciseName),
        edzesTipus: validateExercise(exerciseName, category),
        suly: weight || "0", 
        ismetles: reps.toString() || "0", 
        sorozatok: Array.from({ length: sets }, () => ({
          suly: weight || "0", 
          ismetles: reps.toString() || "0", 
        })),
      };
    }

    const lines = response.generatedText
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, 6);

    if (lines.length === 0) {
      return [createDefaultExercise()];
    }

    return lines.map((line) => {
      let match = line.match(
        /(.+?):\s*(.+?)\s*-\s*(\d+)x(\d+)(?:\s*\(([^)]+)\))?/i
      );

      if (!match) {
        match = line.match(/(.+?)\s*-\s*(\d+)x(\d+)(?:\s*\(([^)]+)\))?/i);
        if (match) {
          match = [
            "",
            findCategory(line),
            match[1],
            match[2],
            match[3],
            match[4],
          ];
        } else {
          return handleMalformedLine(line);
        }
      }

      const [category, exerciseName, reps, sets, weightInfo] = [
        normalizeCategory(match[1]),
        match[2].trim(),
        parseInt(match[3]) || 10,
        parseInt(match[4]) || 3,
        match[5] || "",
      ];

      let weight = extractWeight(weightInfo);
      if (!weight) {
        weight = calculateRecommendedWeight(category, exerciseName, reps);
      }

      return {
        category: validateCategory(category, exerciseName),
        edzesTipus: validateExercise(exerciseName, category),
        suly: weight,
        ismetles: reps.toString(),
        sorozatok: Array.from({ length: sets }, () => ({
          suly: weight,
          ismetles: reps.toString(),
        })),
      };
    });
  };

  const validateCategory = (category, exerciseName) => {
    if (!Object.keys(exercises).includes(category.toLowerCase())) {
      let foundCategory = null;
      for (const [cat, exerciseList] of Object.entries(exercises)) {
        if (exerciseList.includes(exerciseName)) {
          foundCategory = cat;
          break;
        }
      }
      return foundCategory || Object.keys(exercises)[0];
    }
    return category;
  };

  const validateExercise = (exerciseName, category) => {
    const validExercises = exercises[category];
    const validExercise = validExercises.find(
      (ex) => ex.toLowerCase() === exerciseName.toLowerCase()
    );
    return validExercise || validExercises[0];
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.workout && parsedDraft.workout.length > 0) {
          setWorkout(parsedDraft.workout);
          setShowWorkoutContainer(true);
          setIsViewingSavedWorkout(false);
          setHasUnsavedChanges(true);
        }
      } catch (e) {
        console.error("Failed to parse saved draft data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (workout.length > 0 && !isViewingSavedWorkout && hasUnsavedChanges) {
      const draftData = {
        workout: workout,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [workout, isViewingSavedWorkout, hasUnsavedChanges]);

  useEffect(() => {
    if (isViewingSavedWorkout || workout.length === 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isViewingSavedWorkout, workout]);

  useEffect(() => {
    if (selectedDate && !isFetching) {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setSnackbar({
          open: true,
          message: `Nincs mentett edzés a kiválasztott dátumra: ${selectedDate.format(
            "YYYY-MM-DD"
          )}`,
          severity: "info",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Edzés betöltve: ${selectedDate.format("YYYY-MM-DD")}`,
          severity: "success",
        });
      }
    }
  }, [data, isFetching, selectedDate]);

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
    setWorkout([
      {
        category: "",
        edzesTipus: "",
        suly: "",
        ismetles: "",
        sorozatok: [],
      },
    ]);
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
          const weights = Array.isArray(detail.weights)
            ? detail.weights
            : [detail.weights || 0];
          const reps = Array.isArray(detail.reps)
            ? detail.reps
            : [detail.reps || 0];
          const sets = Array.isArray(detail.sets)
            ? detail.sets
            : [detail.sets || 0];
          const numSets = sets.length > 0 ? sets[0] : 1;

          const sorozatok = Array.from({ length: numSets }, (_, i) => ({
            suly: weights[i] || weights[0] || 0,
            ismetles: reps[i] || reps[0] || 0,
          }));

          const muscleGroups =
            detail.muscleGroups || GetMuscleGroups(detail.exerciseName);

          return {
            category: Array.isArray(muscleGroups)
              ? muscleGroups.join(", ")
              : muscleGroups || "Unknown",
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
    const processedValue = (field === "suly" || field === "ismetles") && value === "" ? "0" : value;
    
    const updatedWorkout = [...workout];
    updatedWorkout[index][field] = processedValue;
    setWorkout(updatedWorkout);
    setHasUnsavedChanges(true);
  };
  const handleSorozatChange = (cardIndex, sorozatIndex, field, value) => {
    const processedValue = (field === "suly" || field === "ismetles") && value === "" ? "0" : value;
    
    setWorkout((prev) =>
      prev.map((card, index) =>
        index === cardIndex
          ? {
              ...card,
              sorozatok: card.sorozatok.map((sorozat, i) =>
                i === sorozatIndex ? { ...sorozat, [field]: processedValue } : sorozat
              ),
            }
          : card
      )
    );
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (workout.length === 0) {
      setSnackbar({
        open: true,
        message: "Nincs workout adat a mentéshez!",
        severity: "error",
      });
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
      setSnackbar({
        open: true,
        message: "Néhány mező üres! Kérlek, töltsd ki az összes mezőt.",
        severity: "warning",
      });
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

    saveWorkout(workoutData, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: "Edzés sikeresen mentve!",
          severity: "success",
        });
        setHasUnsavedChanges(false);
        setWorkout([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY); 
        setShowWorkoutContainer(false);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: `Hiba történt: ${error.message || "Ismeretlen hiba"}`,
          severity: "error",
        });
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        color: "#fff",
        fontFamily: '"Montserrat", sans-serif',
        position: "relative",
        padding: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
          pb: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            background: "linear-gradient(90deg, #d4af37, #8B0000)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          EDZÉSNAPLÓ
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="AI Edzéstervező" placement="bottom">
            <Button
              variant="contained"
              onClick={handleAIClick}
              startIcon={<AutoFixHigh />}
              sx={{
                background: "linear-gradient(90deg, #4a148c, #7b1fa2)",
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(90deg, #7b1fa2, #4a148c)",
                },
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
                  color: "#d4af37",
                  borderColor: "#d4af37",
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                    borderColor: "#d4af37",
                  },
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
                  color: "#d4af37",
                  borderColor: "#d4af37",
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                    borderColor: "#d4af37",
                  },
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
              slotProps={{
                textField: {
                  sx: {
                    "& .MuiInputBase-root": {
                      color: "#fff",
                      "& fieldset": {
                        borderColor: "#d4af37",
                      },
                      "&:hover fieldset": {
                        borderColor: "#d4af37",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                    },
                  },
                  variant: "outlined",
                  size: "small",
                },
                inputAdornment: {
                  sx: {
                    "& .MuiSvgIcon-root": {
                      color: "white",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {isFetching && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1">Edzés betöltése...</Typography>
        </Box>
      )}

      {showWorkoutContainer && workout.length > 0 && (
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            padding: 2,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#d4af37",
              borderRadius: "3px",
            },
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
                <Card
                  sx={{
                    width: 320,
                    background: "rgba(26, 26, 26, 0.8)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    borderRadius: "8px",
                    position: "relative",
                    color: "white",
                    paddingTop: "25px", 

                    "&:hover": {
                      boxShadow: "0 0 20px rgba(212, 175, 55, 0.2)",
                    },
                  }}
                >
                  {!isViewingSavedWorkout && (
                    <IconButton
                      onClick={() => removeCard(cardIndex)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "#d4af37",
                        zIndex: 1,
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
                            handleInputChange(
                              cardIndex,
                              "category",
                              e.target.value
                            )
                          }
                          displayEmpty
                          fullWidth
                          sx={{
                            mb: 2,
                            "& .MuiSelect-select": {
                              fontSize: "0.875rem",
                              color: "#fff",
                              backgroundColor: isViewingSavedWorkout
                                ? "#2c2c2c"
                                : "transparent",
                            },
                            "&.Mui-disabled .MuiSelect-select": {
                              WebkitTextFillColor: "#fff !important",
                              backgroundColor: "#2c2c2c", 
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: isViewingSavedWorkout
                                ? "#555"
                                : "#d4af37", 
                            },
                            "& .MuiSelect-icon": {
                              color: "#fff",
                            },
                          }}
                          disabled={isViewingSavedWorkout}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: "#1a1a1a",
                              },
                            },
                          }}
                        >
                          <MenuItem
                            value=""
                            disabled
                            sx={{ color: "#fff", bgcolor: "#1a1a1a" }}
                          >
                            <Typography sx={{ color: "white" }}>
                              Kategória
                            </Typography>
                          </MenuItem>
                          {Object.keys(exercises).map((category) => (
                            <MenuItem
                              key={category}
                              value={category}
                              sx={{
                                fontSize: "0.875rem",
                                color: "#fff",
                                bgcolor: "#1a1a1a",
                                "&:hover": {
                                  bgcolor: "rgba(212, 175, 55, 0.1)",
                                },
                              }}
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
                              handleInputChange(
                                cardIndex,
                                "edzesTipus",
                                e.target.value
                              )
                            }
                            displayEmpty
                            fullWidth
                            sx={{
                              mb: 2,
                              "& .MuiSelect-select": {
                                fontSize: "0.875rem",
                                color: "#fff",
                                backgroundColor: isViewingSavedWorkout
                                  ? "#2c2c2c"
                                  : "transparent",
                              },
                              "&.Mui-disabled .MuiSelect-select": {
                                WebkitTextFillColor: "#fff !important",
                                backgroundColor: "#2c2c2c",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: isViewingSavedWorkout
                                  ? "#555"
                                  : "#d4af37",
                              },
                              "& .MuiSelect-icon": {
                                color: "#fff",
                              },
                            }}
                            disabled={isViewingSavedWorkout}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  backgroundColor: "#1a1a1a",
                                },
                              },
                            }}
                          >
                            <MenuItem
                              value=""
                              disabled
                              sx={{ color: "#fff", bgcolor: "#1a1a1a" }}
                            >
                              <Typography sx={{ color: "white" }}>
                                Gyakorlat
                              </Typography>
                            </MenuItem>
                            {exercises[card.category]?.map((exercise) => (
                              <MenuItem
                                key={exercise}
                                value={exercise}
                                sx={{
                                  fontSize: "0.875rem",
                                  color: "#fff",
                                  bgcolor: "#1a1a1a",
                                  "&:hover": {
                                    bgcolor: "rgba(212, 175, 55, 0.1)",
                                  },
                                }}
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
                          color: "#d4af37",
                          borderColor: "#d4af37",
                          "&:hover": {
                            backgroundColor: "rgba(212, 175, 55, 0.1)",
                          },
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
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
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
                              handleSorozatChange(
                                cardIndex,
                                sorozatIndex,
                                "ismetles",
                                e.target.value
                              )
                            }
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: "4px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              color: "#fff",
                              minWidth: 0,
                            }}
                            disabled={isViewingSavedWorkout}
                          />
                          <input
                            type="number"
                            placeholder="Súly (kg)"
                            value={sorozat.suly || ""}
                            onChange={(e) =>
                              handleSorozatChange(
                                cardIndex,
                                sorozatIndex,
                                "suly",
                                e.target.value
                              )
                            }
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: "4px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              color: "#fff",
                              minWidth: 0,
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
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleAddCard}
                  sx={{
                    minWidth: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "2px dashed #d4af37",
                    color: "#d4af37",
                    "&:hover": {
                      backgroundColor: "rgba(212, 175, 55, 0.1)",
                    },
                  }}
                >
                  <Add fontSize="large" />
                </Button>
              </motion.div>
            </Box>
          )}

          {workout.length > 0 && !isViewingSavedWorkout && (
            <Box
              sx={{
                position: "sticky",
                bottom: 20,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                mt: 3,
                zIndex: 1,
              }}
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  startIcon={<Save />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    background: "linear-gradient(90deg, #8B0000, #d4af37)",
                    color: "#fff",
                    "&:hover": {
                      boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
                    },
                  }}
                >
                  {isLoading ? "Mentés..." : "Edzés mentése"}
                </Button>
              </motion.div>
            </Box>
          )}
        </Box>
      )}

      {!showWorkoutContainer && !isFetching && selectedDate && !data && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6">
            Nincs elmentett edzés erre a napra:{" "}
            {selectedDate.format("YYYY-MM-DD")}
          </Typography>
          <Button
            onClick={newWorkout}
            variant="contained"
            sx={{
              mt: 2,
              background: "linear-gradient(90deg, #d4af37, #8B0000)",
              color: "#fff",
            }}
          >
            Új edzés létrehozása
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            backgroundColor:
              snackbar.severity === "success"
                ? "rgba(46, 125, 50, 0.9)"
                : snackbar.severity === "error"
                ? "rgba(211, 47, 47, 0.9)"
                : snackbar.severity === "warning"
                ? "rgba(237, 108, 2, 0.9)"
                : "rgba(2, 136, 209, 0.9)",
            color: "#fff",
            fontWeight: 500,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            color: "#fff",
            minWidth: "400px",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "transparent",
            color: "#d4af37",
            borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
            fontSize: "1.2rem",
          }}
        >
          AI Edzéstervező
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#d4af37", mb: 2 }}
          >
            Válaszd ki az izomcsoportokat:
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 3,
            }}
          >
            {Object.keys(exercises).map((group) => (
              <Button
                key={group}
                variant={
                  selectedMuscleGroups.includes(group)
                    ? "contained"
                    : "outlined"
                }
                onClick={() => handleMuscleGroupToggle(group)}
                sx={{
                  color: selectedMuscleGroups.includes(group)
                    ? "#000"
                    : "#d4af37",
                  bgcolor: selectedMuscleGroups.includes(group)
                    ? "#d4af37"
                    : "transparent",
                  borderColor: "#d4af37",
                  "&:hover": {
                    bgcolor: selectedMuscleGroups.includes(group)
                      ? "#c19b2e"
                      : "rgba(212, 175, 55, 0.1)",
                    borderColor: "#d4af37",
                  },
                  fontSize: "0.8rem",
                  px: 1,
                  py: 0.5,
                }}
              >
                {group}
              </Button>
            ))}
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#d4af37", mb: 2 }}
          >
            Nehézségi szint:
          </Typography>
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            fullWidth
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d4af37",
              },
              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
              mb: 3,
              "& .MuiSelect-select": {
                backgroundColor: "#2a2a2a", 
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#1a1a1a", 
                  "& .MuiMenuItem-root": {
                    color: "#fff", 
                    "&:hover": {
                      bgcolor: "rgba(212, 175, 55, 0.2)",
                    },
                    "&.Mui-selected": {
                      bgcolor: "rgba(212, 175, 55, 0.4)", 
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="kezdő" sx={{ color: "#fff" }}>
              Kezdő
            </MenuItem>
            <MenuItem value="közepes" sx={{ color: "#fff" }}>
              Közepes
            </MenuItem>
            <MenuItem value="haladó" sx={{ color: "#fff" }}>
              Haladó
            </MenuItem>
          </Select>
        </DialogContent>
        <DialogActions
          sx={{
            bgcolor: "transparent",
            borderTop: "1px solid rgba(212, 175, 55, 0.3)",
            p: 2,
          }}
        >
          <Button
            onClick={() => setAiDialogOpen(false)}
            sx={{
              color: "#d4af37",
              "&:hover": {
                bgcolor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={handleGenerateWorkout}
            disabled={isGenerating || selectedMuscleGroups.length === 0}
            sx={{
              bgcolor: "#d4af37",
              color: "#000",
              "&:hover": {
                bgcolor: "#c19b2e",
              },
              "&:disabled": {
                bgcolor: "rgba(212, 175, 55, 0.3)",
                color: "rgba(255,255,255,0.5)",
              },
              px: 3,
            }}
          >
            {isGenerating ? "Generálás..." : "Generálás"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutApp;