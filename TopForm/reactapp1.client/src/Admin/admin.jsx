import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import ExercisesEditor from "./AdminComponents/ExercisesEditor";
import DatabaseTables from "./AdminComponents/DatabaseTables";
import DashboardContent from "./AdminComponents/DashboardContent";
import "./admin.css"; // Import the new CSS file

const AdminPage = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [showTables, setShowTables] = useState(false);
  const [activeActionButton, setActiveActionButton] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleActionButtonClick = (buttonName) => {
    setActiveActionButton(buttonName);
    setIsMobileMenuOpen(false);
    if (buttonName === "workouts") {
      setCurrentView("workouts");
      setShowTables(false);
    } else if (buttonName === "user") {
      setCurrentView("user");
    }
  };

  const handleNavButtonClick = (view, showTablesValue) => {
    setCurrentView(view);
    setShowTables(showTablesValue);
    setActiveActionButton(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <nav className="Admin-nav">
        <div className="Admin-logo">
          <div>Admin Page</div>

          {windowWidth > 768 ? (
            <div className="Admin-navButtons">
              <button
                className={`Admin-navButton ${
                  currentView === "dashboard" && !showTables ? "active" : ""
                }`}
                onClick={() => handleNavButtonClick("dashboard", false)}
              >
                Dashboard
              </button>

              <button
                className={`Admin-navButton ${showTables ? "active" : ""}`}
                onClick={() => handleNavButtonClick("dashboard", true)}
              >
                Database Tables
              </button>
            </div>
          ) : (
            <button
              className="Admin-mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ display: windowWidth <= 768 ? "block" : "none" }}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>

        {windowWidth > 768 && (
          <div className="Admin-actionButtons">
            <button
              className={`Admin-actionButton ${
                activeActionButton === "workouts" ? "active" : ""
              }`}
              style={{
                backgroundColor:
                  activeActionButton === "workouts" ? "#ff7b00" : "#e9ecef",
                color: activeActionButton === "workouts" ? "white" : "#495057",
              }}
              onClick={() => handleActionButtonClick("workouts")}
            >
              <span>Add Exercise</span>
            </button>

            <button
              className={`Admin-actionButton ${
                activeActionButton === "user" ? "active" : ""
              }`}
              style={{
                backgroundColor:
                  activeActionButton === "user" ? "#ff7b00" : "#f8f9fa",
                color: activeActionButton === "user" ? "white" : "#495057",
              }}
              onClick={() => (window.location.href = "/")}
            >
              <span>Back to user view</span>
            </button>
          </div>
        )}
      </nav>

      {isMobileMenuOpen && windowWidth <= 768 && (
        <div className="Admin-mobileMenu">
          <button
            className={`Admin-navButton ${
              currentView === "dashboard" && !showTables ? "active" : ""
            }`}
            onClick={() => handleNavButtonClick("dashboard", false)}
          >
            Dashboard
          </button>

          <button
            className={`Admin-navButton ${showTables ? "active" : ""}`}
            onClick={() => handleNavButtonClick("dashboard", true)}
          >
            Database Tables
          </button>

          <button
            className={`Admin-actionButton ${
              activeActionButton === "workouts" ? "active" : ""
            }`}
            style={{
              backgroundColor:
                activeActionButton === "workouts" ? "#ff7b00" : "#e9ecef",
              color: activeActionButton === "workouts" ? "white" : "#495057",
            }}
            onClick={() => handleActionButtonClick("workouts")}
          >
            <span>Add Workout</span>
          </button>

          <button
            className={`Admin-actionButton ${
              activeActionButton === "user" ? "active" : ""
            }`}
            style={{
              backgroundColor:
                activeActionButton === "user" ? "#ff7b00" : "#f8f9fa",
              color: activeActionButton === "user" ? "white" : "#495057",
            }}
            onClick={() => handleActionButtonClick("user")}
          >
            <span>Back to user view</span>
          </button>
        </div>
      )}

      {currentView === "dashboard" && showTables && <DatabaseTables />}
      {currentView === "dashboard" && !showTables && <DashboardContent />}
      {currentView === "workouts" && <ExercisesEditor />}
    </div>
  );
};

export default AdminPage;