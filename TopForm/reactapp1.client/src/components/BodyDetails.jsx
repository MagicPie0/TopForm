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
import '../Design/SignIn.css'; // Import SignIn styles

// Egyszerűsített modell komponens
function SimpleModel({ gender }) {
  const modelPath = gender === 'female' ? '/model/female.glb' : '/model/male.glb';
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();

  // Egyszerű automatikus forgatás
  useEffect(() => {
    const interval = setInterval(() => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01;
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Skálázás a modell típusa alapján
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

// Betöltési állapot kezelő
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
        <style>
          {`
            @keyframes loading {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 100%; }
            }
          `}
        </style>
      </div>
    </Html>
  );
}

// Fő regisztrációs komponens
const RegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language);
  const texts = language === "EN" ? en : hu;

  const [gender, setGender] = useState('male');
  const [measurements, setMeasurements] = useState({ arm: '', chest: '', thigh: '', calf: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modelError, setModelError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

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
      // Fetch a JWT token from localStorage
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error('JWT token hiányzik');
      }

      // Prepare muscle group data
      const muscleGroupData = Object.entries(measurements)
        .filter(([, value]) => value)
        .map(([part, kg]) => ({
          name: part.charAt(0).toUpperCase() + part.slice(1),
          kg: kg,
        }));

      if (muscleGroupData.length === 0) {
        throw new Error('Kérjük, adjon meg legalább egy izomcsoportot!');
      }

      // Call the hook with the necessary data
      await completeRegister.mutateAsync({ gender, measurements: muscleGroupData });
      setSuccessMessage('Sikeres regisztráció!');
      setTimeout(() => navigate("/mainPage"), 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Valami hiba történt');
    } finally {
      setLoading(false);
    }
  };

  // Model error handler
  const handleModelError = (error) => {
    console.error("Model loading error:", error);
    setModelError(`Hiba a modell betöltésekor: ${error.message}`);
  };

  // Check if WebGL is available
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
      {/* Animated Background - átvéve a SignIn komponensből */}
      <div className="signin-background">
        <div className="gradient-overlay"></div>
      </div>

      {/* Main Content */}
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
                      gl.setClearColor(0x000000, 0); // Teljesen átlátszó háttér
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

                <div className="gender-control">
                  <label htmlFor="gender-select">Nem választása:</label>
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

            <div className="form-section">
              <div className="form-content">
                <h2>Adja meg maximális súlyterhelését</h2>
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
                {successMessage && <div className="message success">{successMessage}</div>}

                <button
                  className="auth-button primary"
                  onClick={handleSubmitMuscleGroups}
                  disabled={loading}
                >
                  {loading ? 'Feldolgozás...' : 'Regisztráció befejezése'}
                  <span className="button-overlay"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;

// Modellek előbetöltése
useGLTF.preload('/model/male.glb');
useGLTF.preload('/model/female.glb');