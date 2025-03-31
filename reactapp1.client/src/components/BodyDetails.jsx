import React, { useState, useEffect, useMemo, useContext, createContext, Suspense, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF, Bounds } from '@react-three/drei';
import { useCompleteRegister } from '../scripts/useCompleteRegister'; // Ensure the hook exists
import '../Design/bodyDetailsStyle.css';

const ModelContext = createContext();

function Instances({ gender, children }) {
  const navigate = useNavigate();
  const modelPath = gender === 'female' ? '/model/female9.glb' : '/model/man5.glb';
  const { nodes, materials } = useGLTF(modelPath);

  const instances = useMemo(() => {
    return gender === 'female'
      ? {
          body: nodes?.Merged_bodywm || null,
          material: materials?.Merged_bodywm019_001 || null,
          scale: [1, 1, 1],
        }
      : {
          body: nodes?.Merged_body || null,
          material: materials?.Merged_body019_001 || null,
          scale: [4, 4, 4],
        };
  }, [nodes, materials, gender]);

  return <ModelContext.Provider value={instances}>{children}</ModelContext.Provider>;
}

function Model() {
  const instances = useContext(ModelContext);
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotateY(0.01);
    }
  });

  return (
    <group ref={groupRef} scale={instances.scale}>
      <mesh geometry={instances.body?.geometry} material={instances.material} />
    </group>
  );
}

const RegistrationForm = () => {
  const [gender, setGender] = useState('male');
  const [measurements, setMeasurements] = useState({ arm: '', chest: '', thigh: '', calf: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const completeRegister = useCompleteRegister();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitMuscleGroups = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Fetch a JWT token from localStorage (or wherever you store it)
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error('JWT token hiányzik');
      }
      // Prepare muscle group data
      const muscleGroupData = Object.entries(measurements)
        .filter(([, value]) => value) // Only non-empty values
        .map(([part, kg]) => ({
          name: part.charAt(0).toUpperCase() + part.slice(1), // Capitalize first letter
          kg: kg,
        }));

      if (muscleGroupData.length === 0) {
        throw new Error('Kérjük, adjon meg legalább egy izomcsoportot!');
      }

      // Call the hook with the necessary data
      await completeRegister.mutateAsync({ gender, measurements: muscleGroupData });
      navigate("/mainPage");
    } catch (err) {
      setErrorMessage(err.message || 'Valami hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body-details">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 5]} intensity={0.7} castShadow />
          <Suspense fallback={<Html center>Betöltés...</Html>}>
            <Bounds fit clip observe margin={1.2}>
              <Instances gender={gender}>
                <Model />
              </Instances>
            </Bounds>
          </Suspense>
        </Canvas>
      </div>
      <div className="form-container">
        <h2>Kérem adja meg, hogy hány kilogrammot tud megemelni!</h2>
        <select className="gender-selector" onChange={(e) => setGender(e.target.value)} value={gender}>
          <option value="male">Férfi</option>
          <option value="female">Nő</option>
        </select>
        <div className="form-group">
          {['arm', 'chest', 'thigh', 'calf'].map((part) => (
            <div key={part} className="input-container">
              <label>{part.charAt(0).toUpperCase() + part.slice(1)}</label>
              <input type="text" name={part} placeholder="kg" value={measurements[part]} onChange={handleInputChange} />
            </div>
          ))}
        </div>
        <button className="register-btn" onClick={handleSubmitMuscleGroups} disabled={loading}>
          {loading ? 'Folyamatban...' : 'Regisztráció befejezése'}
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
};

export default RegistrationForm;

useGLTF.preload('/model/man5.glb');
useGLTF.preload('/model/female9.glb');
