import React, { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  TextField,
  Tooltip,
  IconButton,
  Grid,
  Divider,
  MenuItem,
  Select
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useDiet } from "../scripts/useDiet.js";
import { useFetchDiet } from "../scripts/useFetchDiet.js";
import { motion } from "framer-motion";
import { Close, Add, Save } from "@mui/icons-material";

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
      setIsViewingSavedDiet(false);
    }
  }, [fetchedDiet]);

  const handleCancelView = () => {
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

      setHasUnsavedChanges(true);
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
      console.error("Hiba történt az adatok mentése közben:", err);
    }
  };

  const Item = ({ item, mealId }) => {
    const [, drag] = useDrag(() => ({
      type: "item",
      item: { ...item, mealId },
      canDrag: () => !isViewingSavedDiet,
    }));

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          ref={drag}
          sx={{
            marginBottom: 2,
            backgroundColor: "rgba(26, 26, 26, 0.8)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            padding: 1,
            opacity: isViewingSavedDiet ? 0.7 : 1,
            cursor: isViewingSavedDiet ? "default" : "move",
            '&:hover': {
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
            }
          }}
        >
          <CardContent>
            <Typography variant="body1" color="#fff">{item.name}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              {item.portion}g - {item.kcal} kcal
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const Meal = ({ meal, mealId }) => {
    const [, drop] = useDrop(() => ({
      accept: "item",
      drop: (draggedItem) => moveItem(draggedItem, draggedItem.mealId, mealId),
      canDrop: () => !isViewingSavedDiet,
    }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          ref={drop}
          sx={{
            width: 300,
            padding: 2,
            background: "rgba(26, 26, 26, 0.8)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            opacity: isViewingSavedDiet ? 0.9 : 1,
            '&:hover': {
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
            }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginBottom: 2,
              textAlign: "center",
              color: '#d4af37',
              fontWeight: 600
            }}
          >
            {meal.title}
          </Typography>
          {meal.items.map((item) => (
            <Item key={item.name} item={item} mealId={mealId} />
          ))}
        </Card>
      </motion.div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
            ÉTRENDNAPLÓ
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isViewingSavedDiet && (
                <Tooltip title="Új étrend">
                  <Button
                    variant="outlined"
                    onClick={() => setData(initialData)}
                    sx={{
                      color: '#d4af37',
                      borderColor: '#d4af37',
                      '&:hover': {
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderColor: '#d4af37'
                      }
                    }}
                  >
                    Új Etrend
                  </Button>
                </Tooltip>
              )}
              {isViewingSavedDiet && (
                <Tooltip title="Mégse">
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
                  slotProps={{
                    textField: {
                      sx: {
                        '& .MuiInputBase-root': {
                          color: '#fff',
                          '& fieldset': {
                            borderColor: '#d4af37',
                          },
                          '&:hover fieldset': {
                            borderColor: '#d4af37',
                          },
                          // Az ikon színének beállítása
                          '& .MuiSvgIcon-root': {
                            color: 'white',
                          },
                        },
                      },
                      variant: 'outlined',
                      size: 'small',
                    },
                    // Alternatív megoldás az ikon színének beállítására
                    inputAdornment: {
                      sx: {
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

            </Box>
          </Box>
        </Box>

        {/* Tartalom */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: 'wrap',
            justifyContent: 'center',
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
          {!isViewingSavedDiet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  width: 300,
                  padding: 2,
                  background: 'rgba(26, 26, 26, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  '&:hover': {
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                  }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: 2,
                    textAlign: "center",
                    color: '#d4af37',
                    fontWeight: 600
                  }}
                >
                  Új Ételek
                </Typography>
                {data.newItems.map((item) => (
                  <Item key={item.name} item={item} mealId="newItems" />
                ))}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setModalOpen(true)}
                    sx={{
                      mt: 2,
                      color: '#d4af37',
                      borderColor: '#d4af37',
                      '&:hover': {
                        backgroundColor: 'rgba(212, 175, 55, 0.1)'
                      }
                    }}
                    startIcon={<Add />}
                  >
                    Új Étel
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {Object.entries(data.meals).map(([mealId, meal]) => (
            <Meal key={mealId} meal={meal} mealId={mealId} />
          ))}
        </Box>

        {!isViewingSavedDiet && (
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
                {isLoading ? "Mentés..." : "Étrend mentése"}
              </Button>
            </motion.div>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "rgba(26, 26, 26, 0.95)",
            p: 3,
            borderRadius: 2,
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
          }}
        >
          <Typography variant="h6" color="#d4af37" sx={{ mb: 2 }}>Új Étel</Typography>
          <TextField
            fullWidth
            label="Név"
            variant="outlined"
            margin="normal"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            sx={{
              '& .MuiInputBase-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(212, 175, 55, 0.3)'
                }
              }
            }}
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
            sx={{
              '& .MuiInputBase-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(212, 175, 55, 0.3)'
                }
              }
            }}
          />
          <TextField
            fullWidth
            label="Kalória"
            variant="outlined"
            margin="normal"
            value={newItem.kcal}
            onChange={(e) => setNewItem({ ...newItem, kcal: e.target.value })}
            sx={{
              '& .MuiInputBase-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(212, 175, 55, 0.3)'
                }
              }
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              marginTop: 2,
              background: 'linear-gradient(90deg, #8B0000, #d4af37)',
              color: '#fff'
            }}
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