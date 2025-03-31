import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../Design/ProfilePage.css';
import { useFetcProfile } from '../scripts/useFetchProfile';
import muscleGroups from '../workout/workout.json';

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

  const handleBackClick = () => {
    navigate('/mainPage');
  };

  const processWorkoutData = () => {
    if (!profileData?.workouts) return [];

    // First, process the muscles data to get initial values
    const initialMuscleData = {};
    profileData.muscles?.groups?.forEach(group => {
      initialMuscleData[group.name.toLowerCase()] = group.kg;
    });

    // Then process workouts to find max weights per date
    const muscleGroupMap = {};

    // Add initial muscle data if available
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
          // Keep the maximum weight for each muscle group
          if (!muscleGroupMap[workout.date][muscleGroup] || 
              exercise.maxWeight > muscleGroupMap[workout.date][muscleGroup]) {
            muscleGroupMap[workout.date][muscleGroup] = exercise.maxWeight;
          }
        }
      });
    });

    // Convert to array format for the chart, sorted by date
    const dates = Object.keys(muscleGroupMap).filter(d => d !== 'Initial');
    dates.sort((a, b) => new Date(a) - new Date(b));
    
    // Include initial data first if it exists
    const chartData = [];
    if (muscleGroupMap['Initial']) {
      chartData.push({
        date: 'Initial',
        ...muscleGroupMap['Initial']
      });
    }

    // Add sorted workout data
    dates.forEach(date => {
      chartData.push({
        date,
        ...muscleGroupMap[date]
      });
    });

    return chartData;
  };

  const workoutChartData = processWorkoutData();

  if (isLoading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (isError) {
    return <div className="profile-container">Error loading profile data</div>;
  }

  return (
    <div className="profile-container">
      <button className="back-button" onClick={handleBackClick}>Back to Home</button>
      
      <div className="profile-header">
        {profileData?.user?.ProfilePicture ? (
          <img src={`data:image/jpeg;base64,${profileData.user.ProfilePicture}`} 
               alt="Profile" 
               className="profile-pic" />
        ) : (
          <div className="profile-pic-placeholder">No Image</div>
        )}
        <h1 className="profile-title">{profileData?.user?.Username || 'Username'}</h1>
        <p className="profile-email">{profileData?.user?.Email || 'Email'}</p>
        <p className="profile-fullname">{profileData?.user?.Name || 'Full Name'}</p>
      </div>

      <div className="rank-section">
        <h2>Rank</h2>
        <p>Level: {profileData?.rank?.Name || 'N/A'}</p>
        <p>Points: {profileData?.rank?.Points || '0'}</p>
      </div>

      <div className="muscle-groups-section">
        <h2>Current Muscle Group Max Weights</h2>
        <ul>
          {profileData?.muscles?.groups?.map(group => (
            <li key={group.name}>
              {group.name}: {group.kg} kg
            </li>
          ))}
        </ul>
      </div>

      <div className="graph-container">
        <h2>Workout Progress by Body Part</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={workoutChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="arm" stroke="#ed0a0a" name="Arm" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="chest" stroke="#0a7ded" name="Chest" />
            <Line type="monotone" dataKey="thigh" stroke="#0aed58" name="Thigh" />
            <Line type="monotone" dataKey="calf" stroke="#edb80a" name="Calf" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfilePage;