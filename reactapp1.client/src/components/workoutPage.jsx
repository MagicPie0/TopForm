import React, { useState, useEffect, useRef } from "react";
import { Button, Tooltip, MenuItem, Select, Grid, Box } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import exercises from "../workout/workout.json";
import { useWorkout } from "../scripts/useWorkout";
import { useFetchWorkout } from "../scripts/useFetchWorkout";
import "../Design/workoutStyle.css";
import { parse } from "postcss";

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

  // Load saved workout from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.workout && parsedData.workout.length > 0 && parsedData.workout.category != undefined) {
          setWorkout(parsedData.workout);
          console.log(parsedData.workout.category)
          setShowWorkoutContainer(true);
          setIsViewingSavedWorkout(false);
          setHasUnsavedChanges(true); // Mark as unsaved changes
        }
      } catch (e) {
        console.error("Failed to parse saved workout data", e);
      }
    }
  }, []);

  // Save workout to localStorage whenever it changes
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
    setHasUnsavedChanges(true); // Mark as unsaved changes

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
    // When canceling, restore the draft workout if it exists
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
    
    // If no draft exists, just reset
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
        setHasUnsavedChanges(false); // This is a fetched workout, not unsaved changes
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
    setWorkout([]); // Üres tömbbel indul



    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      margin: "0",
      padding: "0",
      position: "relative",
      height: "100vh",
      width: "100vw",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        position: "absolute",
        top: "10px",
        left: "55%",
        transform: "translateX(-50%)",
        gap: "20px",
      }}>
        {!isViewingSavedWorkout && (
          <Tooltip title="New workout" placement="bottom">
            <Button
              variant="contained"
              color=""
              onClick={newWorkout}
              style={{
                fontSize: "16px",
                padding: "10px 20px",
                color: "red",
                border: "2px solid red",
                borderRadius: "8px",
              }}
            >
              New Workout
            </Button>
          </Tooltip>
        )}
        {isViewingSavedWorkout && (
          <Tooltip title="Cancel" placement="bottom">
            <Button
              variant="contained"
              color=""
              onClick={handleCancelView}
              style={{
                fontSize: "16px",
                padding: "10px 20px",
                color: "red",
                border: "2px solid red",
                borderRadius: "8px",
              }}
            >
              Cancel
            </Button>
          </Tooltip>
        )}
      </div>

      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 10,
        backgroundColor: "white",
        borderRadius: "8px",
      }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date || null)}
            renderInput={(params) => (
              <input
                {...params.inputProps}
                style={{
                  width: "200px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "black",
                  fontSize: "16px",
                }}
              />
            )}
          />
        </LocalizationProvider>
      </div>

      {(showWorkoutContainer && workout.length > 0) && (
        <div
          ref={containerRef}
          className="scrollable"
          style={{
            marginTop: "80px",
            marginLeft: "140px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            gap: "20px",
            padding: "20px",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
            border: "2px solid red",
            borderRadius: "10px",
          }}
        >
          {Array.isArray(workout) &&
            workout.map((card, cardIndex) => (
              <div
                key={cardIndex}
                style={{
                  width: "400px",
                  padding: "20px",
                  backgroundColor: "white",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={5}>
                    <Select
                      value={card.category || ""}
                      onChange={(e) =>
                        handleInputChange(cardIndex, "category", e.target.value)
                      }
                      displayEmpty
                      style={{
                        width: "100%",
                        padding: "5px",
                        margin: "10px 0",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                      disabled={isViewingSavedWorkout}
                    >
                      <MenuItem value="" disabled style={{ color: "gray", fontSize: "8px" }}>
                        Kategória
                      </MenuItem>
                      {Object.keys(exercises).map((category) => (
                        <MenuItem
                          key={category}
                          value={category}
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={7}>
                    {card.category && (
                      <Select
                        value={card.edzesTipus || ""}
                        onChange={(e) =>
                          handleInputChange(cardIndex, "edzesTipus", e.target.value)
                        }
                        displayEmpty
                        style={{
                          width: "100%",
                          padding: "5px",
                          margin: "10px 0",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                        disabled={isViewingSavedWorkout}
                      >
                        <MenuItem value="" disabled style={{ fontStyle: "italic", color: "gray" }}>
                          Edzéstípus
                        </MenuItem>
                        {exercises[card.category].map((exercise) => (
                          <MenuItem
                            key={exercise}
                            value={exercise}
                            style={{ fontSize: "14px", fontStyle: "italic" }}
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
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      fontSize: "14px",
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "5px",
                      marginBottom: "20px",
                    }}
                  >
                    + Sorozat hozzáadása
                  </Button>
                )}

                <div>
                  {card.sorozatok?.map((sorozat, sorozatIndex) => (
                    <div
                      key={sorozatIndex}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        gap: "10px",
                      }}
                    >
                      <span style={{ marginRight: "10px", alignSelf: "center" }}>
                        {sorozatIndex + 1}:
                      </span>
                      <input
                        type="number"
                        placeholder="Ismétlés"
                        value={sorozat.ismetles || ""}
                        onChange={(e) =>
                          handleSorozatChange(cardIndex, sorozatIndex, "ismetles", e.target.value)
                        }
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "50%",
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
                          padding: "8px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "50%",
                        }}
                        disabled={isViewingSavedWorkout}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {workout.length > 0 && !isViewingSavedWorkout && (
            <div style={{
              width: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Button
                variant="contained"
                color=""
                onClick={handleAddCard}
                style={{
                  fontSize: "30px",
                  padding: "10px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  marginTop: "10px",
                  border: "2px solid red",
                  color: "red",
                }}
              >
                +
              </Button>
            </div>
          )}
          {workout.length > 0 && !isViewingSavedWorkout && (
            <div style={{
              position: "sticky",
              bottom: 0,
              width: "100%",
              padding: "10px 0",
              textAlign: "center",
              borderTop: "1px solid #ccc",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}>
              <button
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Mentés folyamatban..." : "Mentés"}
              </button>
              {isError && (
                <div style={{ color: "red", marginTop: "10px" }}>
                  Hiba történt: {error.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutApp;