import React, { useState, useEffect } from "react";
import {
  FaServer,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaBolt,
  FaChartLine,
  FaPlay,
  FaExclamationTriangle,
  FaSync,
  FaLink,
} from "react-icons/fa";

const DashboardContent = () => {
  const [apiStatus, setApiStatus] = useState({
    loading: false,
    online: false,
    responseTime: null,
    error: null,
    lastChecked: null,
    pythonApiStatus: "unknown",
    pythonApiDetails: "",
    pythonApiLastChecked: null
  });

  const [apiStats, setApiStats] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    errors: 0,
    successfulGenerations: 0,
    pythonApiErrors: 0
  });

  const [generationState, setGenerationState] = useState({
    inputText: "",
    generatedText: "",
    isGenerating: false,
    generationTime: null,
    error: null,
    isPythonApiError: false
  });

  const checkPythonApiStatus = async () => {
    try {
      const netHealth = await fetch('https://localhost:7196/api/GenerateWorkout/health');
      if (!netHealth.ok) {
        return { status: 'offline', details: 'ASP.NET API unavailable' };
      }
  
      const startTime = Date.now();
      const response = await fetch('https://localhost:7196/api/GenerateWorkout/python-status');
      const data = await response.json();
      
      return {
        status: data.status,
        details: data.details || `Response in ${Date.now() - startTime}ms`,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return { 
        status: 'error', 
        details: error.message,
        responseTime: null
      };
    }
  };

  const checkApiStatus = async () => {
    setApiStatus(prev => ({ ...prev, loading: true }));
    const startTime = Date.now();

    try {
      const netResponse = await fetch('https://localhost:7196/api/GenerateWorkout/health');
      const endTime = Date.now();
      
      if (netResponse.ok) {
        const pythonStatus = await checkPythonApiStatus();
        
        setApiStatus({
          loading: false,
          online: true,
          responseTime: endTime - startTime,
          error: null,
          lastChecked: new Date().toLocaleTimeString(),
          pythonApiStatus: pythonStatus.status,
          pythonApiDetails: pythonStatus.details,
          pythonApiLastChecked: new Date().toLocaleTimeString()
        });

        setApiStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          avgResponseTime: Math.round(
            (prev.avgResponseTime * prev.totalRequests + (endTime - startTime)) / 
            (prev.totalRequests + 1)
          ),
          pythonApiErrors: pythonStatus.status === 'online' ? 
            prev.pythonApiErrors : prev.pythonApiErrors + 1
        }));
      } else {
        throw new Error(`ASP.NET API returned ${netResponse.status}`);
      }
    } catch (error) {
      setApiStatus({
        loading: false,
        online: false,
        responseTime: null,
        error: error.message,
        lastChecked: new Date().toLocaleTimeString(),
        pythonApiStatus: 'error',
        pythonApiDetails: 'Failed to check status',
        pythonApiLastChecked: new Date().toLocaleTimeString()
      });
      setApiStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        errors: prev.errors + 1
      }));
    }
  };

  const generateText = async () => {
    if (!generationState.inputText.trim()) return;

    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      isPythonApiError: false
    }));
    
    setApiStatus(prev => ({
      ...prev,
      pythonApiStatus: 'generating',
      pythonApiDetails: 'Processing generation request...'
    }));

    const startTime = Date.now();

    try {
      const response = await fetch(
        'https://localhost:7196/api/GenerateWorkout/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ InputText: generationState.inputText }),
        }
      );

      const endTime = Date.now();
      const generationTime = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        
        const pythonStatus = await checkPythonApiStatus();
        setApiStatus(prev => ({
          ...prev,
          pythonApiStatus: pythonStatus.status,
          pythonApiDetails: pythonStatus.details,
          pythonApiLastChecked: new Date().toLocaleTimeString()
        }));

        setGenerationState(prev => ({
          ...prev,
          generatedText: data.generatedText,
          isGenerating: false,
          generationTime
        }));

        setApiStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          avgResponseTime: Math.round(
            (prev.avgResponseTime * prev.totalRequests + generationTime) /
            (prev.totalRequests + 1)
          ),
          successfulGenerations: prev.successfulGenerations + 1
        }));
      } else {
        const errorData = await response.json();
        const isPythonError = response.status === 502 || response.status === 503;

        setGenerationState(prev => ({
          ...prev,
          isGenerating: false,
          error: errorData.message || `Generation failed: ${response.status}`,
          isPythonApiError
        }));

        setApiStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          errors: prev.errors + 1,
          pythonApiErrors: isPythonError ? 
            prev.pythonApiErrors + 1 : prev.pythonApiErrors
        }));

        const pythonStatus = await checkPythonApiStatus();
        setApiStatus(prev => ({
          ...prev,
          pythonApiStatus: pythonStatus.status,
          pythonApiDetails: pythonStatus.details,
          pythonApiLastChecked: new Date().toLocaleTimeString()
        }));
      }
    } catch (error) {
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message
      }));
      
      setApiStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        errors: prev.errors + 1
      }));

      const pythonStatus = await checkPythonApiStatus();
      setApiStatus(prev => ({
        ...prev,
        pythonApiStatus: pythonStatus.status,
        pythonApiDetails: pythonStatus.details,
        pythonApiLastChecked: new Date().toLocaleTimeString()
      }));
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "#f8f9fa",
      minHeight: "calc(100vh - 60px)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ color: "#343a40", margin: 0 }}>
          Admin Dashboard
        </h2>
      </div>


          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "20px"
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px"
              }}>
                <FaServer /> ASP.NET API Status
              </h3>

              {apiStatus.loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaSpinner className="spinner" /> Checking status...
                </div>
              ) : (
                <>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    color: apiStatus.online ? "#28a745" : "#dc3545"
                  }}>
                    {apiStatus.online ? (
                      <><FaCheckCircle /> Operational</>
                    ) : (
                      <><FaTimesCircle /> Offline</>
                    )}
                  </div>

                  {apiStatus.online && (
                    <p>Response time: <strong>{apiStatus.responseTime}ms</strong></p>
                  )}

                  {apiStatus.error && (
                    <p style={{ color: "#dc3545" }}>Error: {apiStatus.error}</p>
                  )}
                </>
              )}

              <p style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                Last checked: {apiStatus.lastChecked || "Never"}
              </p>
            </div>

            <div style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px"
              }}>
                <FaLink /> Python API Status
                <button 
                  onClick={checkApiStatus}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6c757d"
                  }}
                  title="Refresh status"
                >
                  <FaSync />
                </button>
              </h3>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
                color: apiStatus.pythonApiStatus === 'online' ? "#28a745" :
                      apiStatus.pythonApiStatus === 'unstable' ? "#ffc107" :
                      apiStatus.pythonApiStatus === 'generating' ? "#17a2b8" :
                      "#dc3545"
              }}>
                {apiStatus.pythonApiStatus === 'online' ? (
                  <><FaCheckCircle /> Fully Operational</>
                ) : apiStatus.pythonApiStatus === 'unstable' ? (
                  <><FaExclamationTriangle /> Partially Available</>
                ) : apiStatus.pythonApiStatus === 'generating' ? (
                  <><FaSpinner className="spinner" /> Generating...</>
                ) : (
                  <><FaTimesCircle /> Offline</>
                )}
              </div>

              {apiStatus.pythonApiDetails && (
                <p style={{
                  fontSize: "0.85rem",
                  color: "#6c757d",
                  marginBottom: "10px"
                }}>
                  {apiStatus.pythonApiDetails}
                </p>
              )}

              <p style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                Last checked: {apiStatus.pythonApiLastChecked || "Never"}
              </p>
            </div>

            <div style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px"
              }}>
                <FaChartLine /> API Statistics
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                <div>
                  <p style={{ margin: "0", color: "#6c757d" }}>Total Requests</p>
                  <p style={{ margin: "0", fontSize: "1.5rem" }}>
                    {apiStats.totalRequests}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0", color: "#6c757d" }}>Avg. Response Time</p>
                  <p style={{ margin: "0", fontSize: "1.5rem" }}>
                    {apiStats.avgResponseTime}ms
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0", color: "#6c757d" }}>Python API Errors</p>
                  <p style={{ margin: "0", fontSize: "1.5rem", color: "#dc3545" }}>
                    {apiStats.pythonApiErrors}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: "20px"
          }}>
            <h3 style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "15px"
            }}>
              <FaBolt /> Workout Generation
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500"
              }}>
                Input Text (e.g., "Create a 30-minute cardio workout")
              </label>
              <textarea
                value={generationState.inputText}
                onChange={(e) => setGenerationState(prev => ({
                  ...prev,
                  inputText: e.target.value
                }))}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  minHeight: "80px",
                  resize: "vertical"
                }}
                placeholder="Enter your workout request here..."
                disabled={generationState.isGenerating}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button
                onClick={generateText}
                disabled={
                  !generationState.inputText.trim() || generationState.isGenerating
                }
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                {generationState.isGenerating ? (
                  <>
                    <FaSpinner className="spinner" /> Generating...
                  </>
                ) : (
                  <>
                    <FaPlay /> Generate Workout
                  </>
                )}
              </button>

              <button
                onClick={() => setGenerationState(prev => ({
                  ...prev,
                  inputText: "",
                  generatedText: ""
                }))}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            </div>

            {generationState.error && (
              <div style={{
                padding: "10px",
                backgroundColor: generationState.isPythonApiError
                  ? "#fff3cd"
                  : "#f8d7da",
                color: generationState.isPythonApiError
                  ? "#856404"
                  : "#721c24",
                borderRadius: "4px",
                marginBottom: "15px",
                borderLeft: `4px solid ${
                  generationState.isPythonApiError ? "#ffc107" : "#dc3545"
                }`
              }}>
                <strong>
                  {generationState.isPythonApiError
                    ? "Python API Error:"
                    : "Error:"}
                </strong>{" "}
                {generationState.error}
              </div>
            )}

            {generationState.generatedText && (
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500"
                }}>
                  Generated Workout Plan{" "}
                  {generationState.generationTime && (
                    <span style={{ fontWeight: "normal", color: "#6c757d" }}>
                      (in {generationState.generationTime}ms)
                    </span>
                  )}
                </label>
                <div style={{
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap"
                }}>
                  {generationState.generatedText}
                </div>
              </div>
            )}
          </div>


      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardContent;