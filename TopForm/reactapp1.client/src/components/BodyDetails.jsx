import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Canvas } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { useCompleteRegister } from '../scripts/useCompleteRegister';
import { useSelector, useDispatch } from "react-redux";
import { toggleLanguage } from "../languageModel/languageSlice";
import en from "../languageModel/en.json";
import hu from "../languageModel/hu.json";
import '../Design/bodyDetailsStyle.css';
import '../Design/SignIn.css';
import { motion, AnimatePresence } from 'framer-motion';

// Success-only Snackbar component
const SuccessSnackbar = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="snackbar success"
        >
          <div className="snackbar-content">
            <span className="snackbar-icon">✓</span>
            <span className="snackbar-message">{message}</span>
            <button className="snackbar-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <motion.div 
            className="snackbar-progress"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Simplified model component
function SimpleModel({ gender }) {
  const modelPath = gender === 'female' ? '/model/female.glb' : '/model/male.glb';
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01;
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const scale = gender === 'female' ? 3 : 3;

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={[scale, scale, scale]}
      position={[0, gender === 'female' ? 0 : 0, 0]}
    />
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
          Modell betöltése...
        </div>
        <div style={{ width: '120px', height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: '40%',
            height: '100%',
            background: '#4a6fa5',
            animation: 'loading 1.5s infinite ease-in-out'
          }}></div>
        </div>
      </div>
    </Html>
  );
}

// Main registration component
const RegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu;

  const [gender, setGender] = useState('male');
  const [measurements, setMeasurements] = useState({ 
    arm: '', 
    chest: '', 
    thigh: '', 
    calf: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modelError, setModelError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const completeRegister = useCompleteRegister();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showSuccessSnackbar = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 5000);
  };

  const handleSubmitMuscleGroups = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error('JWT token hiányzik');
      }

      const muscleGroupData = Object.entries(measurements)
        .filter(([, value]) => value)
        .map(([part, kg]) => ({
          name: part.charAt(0).toUpperCase() + part.slice(1),
          kg: kg,
        }));

      if (muscleGroupData.length === 0) {
        throw new Error('Kérjük, adjon meg legalább egy izomcsoportot!');
      }

      await completeRegister.mutateAsync({ gender, measurements: muscleGroupData });
      showSuccessSnackbar('Sikeres regisztráció! Átirányítás...');
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Valami hiba történt');
    } finally {
      setLoading(false);
    }
  };

  const handleModelError = (error) => {
    console.error("Model loading error:", error);
    setModelError(`Hiba a modell betöltésekor: ${error.message}`);
  };

  const checkWebGLAvailability = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  };

  const isWebGLAvailable = checkWebGLAvailability();

  const muscleGroups = [
    { id: 'arm', label: 'Kar' },
    { id: 'chest', label: 'Mellkas' },
    { id: 'thigh', label: 'Comb' },
    { id: 'calf', label: 'Vádli' }
  ];

  return (
    <div className="signin-container">
      <SuccessSnackbar 
        message={snackbarMessage} 
        onClose={() => setShowSnackbar(false)} 
      />

      <div className="signin-background">
        <div className="gradient-overlay"></div>
      </div>

      <div className="signin-content">
        <div className="body-details-wrapper">
          <div className="body-details-container">
            <div className="model-section">
              <div className="canvas-wrapper">
                {modelError && (
                  <div className="model-error">
                    <p>{modelError}</p>
                    <button onClick={() => setModelError(null)}>Újrapróbálkozás</button>
                  </div>
                )}

                {!isWebGLAvailable ? (
                  <div className="webgl-error">
                    <p>A böngésződ nem támogatja a WebGL-t, ami szükséges a 3D modell megjelenítéséhez.</p>
                    <p>Próbálj meg másik böngészőt használni vagy frissítsd a jelenlegi böngésződet.</p>
                  </div>
                ) : (
                  <Canvas
                    camera={{ position: [0, 0, 10], fov: 40 }}
                    onCreated={({ gl }) => {
                      gl.setClearColor(0x000000, 0);
                    }}
                    gl={{ antialias: true, alpha: true }}
                  >
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <React.Suspense fallback={<LoadingFallback />}>
                      <SimpleModel gender={gender} />
                    </React.Suspense>
                  </Canvas>
                )}
              </div>
            </div>

            <div className="form-section">
              <div className="form-content">
                <h2 color='black'>Adja meg maximális súlyterhelését</h2>
                <p className="subtitle">Az edzéstervhez szükséges információk</p>

                <div className="measurements-grid">
                  {muscleGroups.map((group) => (
                    <div key={group.id} className="measurement-item">
                      <label htmlFor={group.id}>{group.label}</label>
                      <div className="input-group">
                        <input
                          type="number"
                          id={group.id}
                          name={group.id}
                          placeholder="0"
                          value={measurements[group.id]}
                          onChange={handleInputChange}
                        />
                        <span className="unit">kg</span>
                      </div>
                    </div>
                  ))}
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                
                <div className='form-actions'>
                  <button
                    className="submit-button"
                    onClick={handleSubmitMuscleGroups}
                    disabled={loading}
                  >
                    {loading ? 'Feldolgozás...' : 'Regisztráció befejezése'}
                    <span className="button-overlay"></span>
                  </button>

                  <div className="gender-control">
                    <label htmlFor="gender-select">Neme:</label>
                    <select
                      id="gender-select"
                      onChange={(e) => setGender(e.target.value)}
                      value={gender}
                    >
                      <option value="male">Férfi</option>
                      <option value="female">Nő</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;

useGLTF.preload('/model/male.glb');
useGLTF.preload('/model/female.glb');