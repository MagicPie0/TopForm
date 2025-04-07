import React, { useState, useEffect } from 'react';
import exercisesData from '../../workout/workout.json'; // Lokális JSON fájl importálása

const ExercisesEditor = () => {
    const [viewMode, setViewMode] = useState('json');
    const [exercises, setExercises] = useState(exercisesData); // Initialize with imported data
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
    const [newExercise, setNewExercise] = useState('');
    const [newMuscleGroup, setNewMuscleGroup] = useState('');
    const [editMode, setEditMode] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isLoading, setIsLoading] = useState(false); // No initial loading needed
  
    // Save data to local state
    const saveData = async (updatedData) => {
      setIsLoading(true);
      try {
        // In a real app, you might want to save to a file or API here
        // For now, we'll just update the state
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate slight delay
        setExercises(updatedData);
      } catch (error) {
        console.error("Error saving data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Add new exercise
    const handleAddExercise = async () => {
      if (!selectedMuscleGroup || !newExercise) return;
      
      const updatedData = {
        ...exercises,
        [selectedMuscleGroup]: [...(exercises[selectedMuscleGroup] || []), newExercise]
      };
      
      await saveData(updatedData);
      setNewExercise('');
    };
  
    // Add new muscle group
    const handleAddMuscleGroup = async () => {
      if (!newMuscleGroup || exercises[newMuscleGroup]) return;
      
      const updatedData = {
        ...exercises,
        [newMuscleGroup]: []
      };
      
      await saveData(updatedData);
      setNewMuscleGroup('');
      setSelectedMuscleGroup(newMuscleGroup);
    };
  
    // Delete exercise
    const handleDeleteExercise = async (muscleGroup, exercise) => {
      const updatedData = {
        ...exercises,
        [muscleGroup]: exercises[muscleGroup].filter(e => e !== exercise)
      };
      
      await saveData(updatedData);
    };
  
    // Delete muscle group
    const handleDeleteMuscleGroup = async (muscleGroup) => {
      const { [muscleGroup]: _, ...updatedData } = exercises;
      
      await saveData(updatedData);
      setSelectedMuscleGroup('');
    };
  
    // Start editing
    const startEditing = (type, group, exercise = null) => {
      setEditMode({ type, group, exercise });
      setEditValue(exercise || group);
    };
  
    // Save edit
    const handleSaveEdit = async () => {
      if (!editMode || !editValue) return;
      
      let updatedData;
      
      if (editMode.type === 'exercise') {
        updatedData = {
          ...exercises,
          [editMode.group]: exercises[editMode.group].map(e => 
            e === editMode.exercise ? editValue : e
          )
        };
      } else {
        // Renaming a muscle group is more complex
        const { [editMode.group]: oldExercises, ...rest } = exercises;
        updatedData = {
          ...rest,
          [editValue]: oldExercises
        };
        setSelectedMuscleGroup(editValue);
      }
      
      await saveData(updatedData);
      setEditMode(null);
      setEditValue('');
    };
  
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 60px)',
          backgroundColor: '#f8f9fa'
        }}>
          <div className="spinner"></div>
        </div>
      );
    }
  
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', // Reszponzív elrendezés
        
        gap: '20px',
        padding: '20px',
        height: 'calc(100vh - 60px)',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Management Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflowY: 'auto'
        }}>
          <h2 style={{ 
            color: '#343a40', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ color: '#ff7b00' }}>Manage</span> Exercises
          </h2>
  
          {/* Muscle Group Selection */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0 }}>Muscle Groups</h3>
              <button
                onClick={() => startEditing('muscleGroup', selectedMuscleGroup)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Edit Selected
              </button>
              <button
                onClick={() => handleDeleteMuscleGroup(selectedMuscleGroup)}
                disabled={!selectedMuscleGroup}
                style={{
                  padding: '4px 8px',
                  backgroundColor: !selectedMuscleGroup ? '#f8f9fa' : '#ff6b6b',
                  color: !selectedMuscleGroup ? '#adb5bd' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !selectedMuscleGroup ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete Selected
              </button>
            </div>
  
            {editMode?.type === 'muscleGroup' ? (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="New muscle group name"
                />
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ff7b00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(null)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#e9ecef',
                    color: '#495057',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  marginBottom: '16px',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M5 8l5 5 5-5z\' fill=\'%23343a40\'/></svg>")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="">Select a muscle group</option>
                {Object.keys(exercises).map(group => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
            )}
  
            {/* Add new muscle group */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value.toLowerCase())}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="New muscle group name"
              />
              <button
                onClick={handleAddMuscleGroup}
                disabled={!newMuscleGroup}
                style={{
                  padding: '10px 16px',
                  backgroundColor: !newMuscleGroup ? '#e9ecef' : '#28a745',
                  color: !newMuscleGroup ? '#adb5bd' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !newMuscleGroup ? 'not-allowed' : 'pointer'
                }}
              >
                Add Group
              </button>
            </div>
          </div>
  
          {/* Exercises Management */}
          {selectedMuscleGroup && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>
                Exercises for {selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)}
              </h3>
              
              {/* Add new exercise */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input
                  type="text"
                  value={newExercise}
                  onChange={(e) => setNewExercise(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="New exercise name"
                />
                <button
                  onClick={handleAddExercise}
                  disabled={!newExercise}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: !newExercise ? '#e9ecef' : '#007bff',
                    color: !newExercise ? '#adb5bd' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: !newExercise ? 'not-allowed' : 'pointer'
                  }}
                >
                  Add Exercise
                </button>
              </div>
  
              {/* Exercises list */}
              <div style={{
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {exercises[selectedMuscleGroup]?.map((exercise, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < exercises[selectedMuscleGroup].length - 1 ? '1px solid #e9ecef' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'white',
                      ':hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  >
                    {editMode?.type === 'exercise' && editMode.exercise === exercise ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1 }}>{exercise}</span>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editMode?.type === 'exercise' && editMode.exercise === exercise ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditMode(null)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#e9ecef',
                              color: '#495057',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing('exercise', selectedMuscleGroup, exercise)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: "rgb(255, 123, 0)",                         
                              color: 'white', 
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(selectedMuscleGroup, exercise)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
  
        {/* Data Preview Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              color: '#343a40', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ color: '#ff7b00' }}>Data</span> Preview
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setViewMode('json')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'json' ? '#ff7b00' : '#e9ecef',
                  color: viewMode === 'json' ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                JSON
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'table' ? '#ff7b00' : '#e9ecef',
                  color: viewMode === 'table' ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Table
              </button>
            </div>
          </div>
  
          {viewMode === 'json' ? (
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              overflowX: 'auto',
              flex: 1,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(exercises, null, 2)}
            </pre>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      width: '30%',
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#f8f9fa'
                    }}>Muscle Group</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      width: '70%',
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#f8f9fa'
                    }}>Exercises</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(exercises).map(([group, exercises]) => (
                    <tr key={group} style={{
                      borderBottom: '1px solid #e9ecef',
                      ':hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}>
                      <td style={{
                        padding: '12px',
                        verticalAlign: 'top',
                        fontWeight: '600',
                        color: '#343a40'
                      }}>
                        {group.charAt(0).toUpperCase() + group.slice(1)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {exercises.map((exercise, index) => (
                            <span key={index} style={{
                              backgroundColor: '#e9ecef',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '14px'
                            }}>
                              {exercise}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

export default ExercisesEditor;
    ;
