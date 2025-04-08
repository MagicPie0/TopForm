import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Canvas } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { useCompleteRegister } from '../scripts/useCompleteRegister';
import '../Design/bodyDetailsStyle.css';
import '../Design/SignIn.css';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessSnackbar = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="snackbar-center"
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

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={[3, 3, 3]}
      position={[0, 0, 0]}
    />
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="loading-fallback">
        <div className="loading-text">Modell betöltése...</div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </Html>
  );
}

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState('male');
  const [measurements, setMeasurements] = useState({
    arm: '', chest: '', thigh: '', calf: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modelError, setModelError] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const completeRegister = useCompleteRegister();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };

  const showSuccessSnackbar = (message) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(''), 5000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw new Error('JWT token hiányzik');

      const muscleGroupData = Object.entries(measurements)
        .filter(([, value]) => value)
        .map(([part, kg]) => ({
          name: part.charAt(0).toUpperCase() + part.slice(1),
          kg: kg,
        }));

      if (muscleGroupData.length === 0) {
        throw new Error('Legalább egy izomcsoportot adjon meg!');
      }

      await completeRegister.mutateAsync({ gender, measurements: muscleGroupData });
      showSuccessSnackbar('Sikeres regisztráció! Átirányítás...');
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  const checkWebGLAvailability = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  };

  const isWebGLAvailable = checkWebGLAvailability();

  return (
    <div className="signin-container">
      <div className="signin-background">
        <div className="gradient-overlay"></div>
      </div>

      <div className="signin-content">
        <div className="body-details-wrapper">
          <div className="body-details-container">
            <div className="model-section">
              <div className="canvas-wrapper">
                {modelError ? (
                  <div className="model-error">
                    <p>{modelError}</p>
                    <button onClick={() => setModelError(null)}>Újrapróbálkozás</button>
                  </div>
                ) : !isWebGLAvailable ? (
                  <div className="webgl-error">
                    <p>A böngésző nem támogatja a WebGL-t</p>
                    <p>Próbáljon másik böngészőt!</p>
                  </div>
                ) : (
                  <Canvas
                    camera={{ position: [0, 0, 10], fov: 40 }}
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
                <h2>Adja meg maximális súlyterhelését</h2>
                <p className="subtitle">Az edzéstervhez szükséges információk</p>

                <div className="measurements-grid">
                  {[
                    { id: 'arm', label: 'Kar' },
                    { id: 'chest', label: 'Mellkas' },
                    { id: 'thigh', label: 'Comb' },
                    { id: 'calf', label: 'Vádli' }
                  ].map((group) => (
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
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Feldolgozás...' : 'Regisztráció befejezése'}
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

      <SuccessSnackbar
        message={snackbarMessage}
        onClose={() => setSnackbarMessage('')}
      />
    </div>
  );
};

export default RegistrationForm;

useGLTF.preload('/model/male.glb');
useGLTF.preload('/model/female.glb');
