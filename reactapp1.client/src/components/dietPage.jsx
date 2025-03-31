import React, { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useDiet } from "../scripts/useDiet.js";
import { useFetchDiet } from "../scripts/useFetchDiet.js";

const LOCAL_STORAGE_KEY = "dietAppData";
const initialData = {
  meals: {
    breakfast: { id: "breakfast", title: "Reggeli", items: [] },
    lunch: { id: "lunch", title: "Ebéd", items: [] },
    dinner: { id: "dinner", title: "Vacsora", items: [] },
    snack: { id: "snack", title: "Snack", items: [] },
  },
  newItems: [],
};

const DietPage = () => {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", portion: "", kcal: "" });
  const [selectedDate, setSelectedDate] = useState(null);
  const [isViewingSavedDiet, setIsViewingSavedDiet] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(null);

  const { data: fetchedDiet } = useFetchDiet(
    selectedDate ? selectedDate.format("YYYY-MM-DD") : null
  );
  const { mutate: saveFood, isLoading, isError, error } = useDiet();

  // Load saved diet from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.data) {
          setData(parsedData.data);
          setLastSavedData(parsedData.data);
          setHasUnsavedChanges(true);
        }
      } catch (e) {
        console.error("Failed to parse saved diet data", e);
      }
    }
  }, []);

  // Save diet to localStorage whenever it changes
  useEffect(() => {
    if (hasUnsavedChanges && !isViewingSavedDiet) {
      const dataToSave = {
        data: data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [data, hasUnsavedChanges, isViewingSavedDiet]);

  // Handle fetched diet data
  useEffect(() => {
    if (fetchedDiet && fetchedDiet.length > 0) {
      const dietData = fetchedDiet[0];

      const transformItems = (items) => {
        if (!items) return [];
        return items.map((item) => ({
          name: item.name || "Névtelen",
          portion: item.portion || "0",
          kcal: item.calories?.toString() || "0",
        }));
      };

      const newData = {
        meals: {
          breakfast: {
            ...initialData.meals.breakfast,
            items: transformItems(dietData.breakfast),
          },
          lunch: {
            ...initialData.meals.lunch,
            items: transformItems(dietData.lunch),
          },
          dinner: {
            ...initialData.meals.dinner,
            items: transformItems(dietData.diner),
          },
          snack: {
            ...initialData.meals.snack,
            items: transformItems(dietData.dessert),
          },
        },
        newItems: [],
      };

      // Save current data to localStorage before showing fetched data
      if (hasUnsavedChanges) {
        const currentData = {
          data: data,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentData));
      }

      setData(newData);
      setIsViewingSavedDiet(true);
      setHasUnsavedChanges(false);
    } else if (fetchedDiet) {
      // Only reset if we explicitly got empty data from API
      setIsViewingSavedDiet(false);
    }
  }, [fetchedDiet]);

  const handleCancelView = () => {
    // Restore the last saved data from localStorage
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.data) {
          setData(parsedData.data);
          setHasUnsavedChanges(true);
        }
      } catch (e) {
        console.error("Failed to parse saved diet data", e);
      }
    } else {
      // If no saved data, reset to initial state
      setData(initialData);
    }
    setSelectedDate(null);
    setIsViewingSavedDiet(false);
  };

  const moveItem = (item, fromMealId, toMealId) => {
    if (fromMealId === toMealId || isViewingSavedDiet) return;

    setData((prev) => {
      const updatedMeals = { ...prev.meals };
      let updatedNewItems = [...prev.newItems];

      if (fromMealId === "newItems") {
        updatedNewItems = updatedNewItems.filter((i) => i.name !== item.name);
      } else {
        updatedMeals[fromMealId].items = updatedMeals[fromMealId].items.filter(
          (i) => i.name !== item.name
        );
      }

      if (toMealId === "newItems") {
        if (!updatedNewItems.find((i) => i.name === item.name)) {
          updatedNewItems.push(item);
        }
      } else {
        if (!updatedMeals[toMealId].items.find((i) => i.name === item.name)) {
          updatedMeals[toMealId].items = [
            ...updatedMeals[toMealId].items,
            item,
          ];
        }
      }

      const newData = {
        meals: updatedMeals,
        newItems: updatedNewItems,
      };

      setHasUnsavedChanges(true); // Ez hiányzott!
      return newData;
    });
  };

  const addItem = () => {
    if (!newItem.name || !newItem.portion || !newItem.kcal) return;
    setData((prev) => {
      const newData = { ...prev, newItems: [...prev.newItems, newItem] };
      setHasUnsavedChanges(true);
      return newData;
    });
    setNewItem({ name: "", portion: "", kcal: "" });
    setModalOpen(false);
  };

  const handleSave = async () => {
    const foodData = {
      Breakfast: data.meals.breakfast.items.map((item) => ({
        Name: item.name,
        Portion: item.portion,
        Calories: parseInt(item.kcal, 10),
      })),
      Lunch: data.meals.lunch.items.map((item) => ({
        Name: item.name,
        Portion: item.portion,
        Calories: parseInt(item.kcal, 10),
      })),
      Diner: data.meals.dinner.items.map((item) => ({
        Name: item.name,
        Portion: item.portion,
        Calories: parseInt(item.kcal, 10),
      })),
      Dessert: data.meals.snack.items.map((item) => ({
        Name: item.name,
        Portion: item.portion,
        Calories: parseInt(item.kcal, 10),
      })),
    };

    try {
      await saveFood(foodData);
      alert("Adatok sikeresen mentve!");
      // Create completely empty data structure
      const emptyData = {
        meals: {
          breakfast: { id: "breakfast", title: "Reggeli", items: [] },
          lunch: { id: "lunch", title: "Ebéd", items: [] },
          dinner: { id: "dinner", title: "Vacsora", items: [] },
          snack: { id: "snack", title: "Snack", items: [] },
        },
        newItems: [],
      };
      setData(emptyData);

      setHasUnsavedChanges(false);
      setLastSavedData(data);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      alert("Hiba történt az adatok mentése közben: " + err.message);
    }
  };

  const Item = ({ item, mealId }) => {
    const [, drag] = useDrag(() => ({
      type: "item",
      item: { ...item, mealId },
      canDrag: () => !isViewingSavedDiet, // Also fixed to be a function
    }));

    return (
      <Card
        ref={drag}
        sx={{
          marginBottom: 2,
          backgroundColor: "#f0f0f0",
          padding: 1,
          opacity: isViewingSavedDiet ? 0.7 : 1,
          cursor: isViewingSavedDiet ? "default" : "move",
        }}
      >
        <CardContent>
          <Typography variant="body1">{item.name}</Typography>
          <Typography variant="caption">
            {item.portion}g - {item.kcal} kcal
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const Meal = ({ meal, mealId }) => {
    const [, drop] = useDrop(() => ({
      accept: "item",
      drop: (draggedItem) => moveItem(draggedItem, draggedItem.mealId, mealId),
      canDrop: () => !isViewingSavedDiet, // Fixed: Now it's a function that returns boolean
    }));

    return (
      <Paper
        ref={drop}
        elevation={3}
        sx={{
          width: 300,
          padding: 2,
          bgcolor: "#ffffff",
          opacity: isViewingSavedDiet ? 0.9 : 1,
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2, textAlign: "center" }}>
          {meal.title}
        </Typography>
        {meal.items.map((item) => (
          <Item key={item.name} item={item} mealId={mealId} />
        ))}
      </Paper>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          padding: 4,
          minHeight: "100vh",
          position: "relative",
          alignContent: "center",
          justifyContent: isViewingSavedDiet ? "center" : "flex-start",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 32,
            right: 32,
            width: 200,
            backgroundColor: "white",
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Válassz Dátumot"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
          {isViewingSavedDiet && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCancelView}
              sx={{ mt: 2 }}
            >
              Mégse
            </Button>
          )}
        </Box>

        {!isViewingSavedDiet && (
          <Paper
            elevation={3}
            sx={{ width: 300, padding: 2, bgcolor: "#f8f9fa" }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, textAlign: "center" }}
            >
              Új Ételek
            </Typography>
            {data.newItems.map((item) => (
              <Item key={item.name} item={item} mealId="newItems" />
            ))}
            <Button
              variant="contained"
              fullWidth
              onClick={() => setModalOpen(true)}
              sx={{ marginTop: 2 }}
            >
              Új Étel Hozzáadása
            </Button>
          </Paper>
        )}

        {Object.entries(data.meals).map(([mealId, meal]) => (
          <Meal key={mealId} meal={meal} mealId={mealId} />
        ))}

        {!isViewingSavedDiet && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ position: "absolute", bottom: 16, right: 16 }}
            disabled={isLoading}
          >
            {isLoading ? "Mentés folyamatban..." : "Mentés"}
          </Button>
        )}
      </Box>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">Új Étel</Typography>
          <TextField
            fullWidth
            label="Név"
            variant="outlined"
            margin="normal"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Adag (g)"
            variant="outlined"
            margin="normal"
            value={newItem.portion}
            onChange={(e) =>
              setNewItem({ ...newItem, portion: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Kalória"
            variant="outlined"
            margin="normal"
            value={newItem.kcal}
            onChange={(e) => setNewItem({ ...newItem, kcal: e.target.value })}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={addItem}
          >
            Hozzáadás
          </Button>
        </Box>
      </Modal>
    </DndProvider>
  );
};

export default DietPage;
