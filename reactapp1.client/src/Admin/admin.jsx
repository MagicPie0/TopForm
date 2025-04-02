import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';


const DatabaseTables = () => {
  const [activeTable, setActiveTable] = useState(null);

  const tables = [
    { id: 1, name: 'Users Table' },
    { id: 2, name: 'Workouts Table' },
    { id: 3, name: 'Diets Table' },
    { id: 4, name: 'Ranks Table' },
    { id: 5, name: 'Muscle Group Tables' },
    { id: 6, name: 'User Activity Table' }
  ];

  const handleTableClick = (tableId) => {
    setActiveTable(tableId);
    console.log(`Selected table: ${tables.find(t => t.id === tableId).name}`);
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 60px)'
    }}>
      <h2 style={{ color: '#343a40', marginBottom: '20px' }}>Tables</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
      }}>
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => handleTableClick(table.id)}
            style={{
              padding: '20px',
              backgroundColor: activeTable === table.id ? '#ff7b00' : '#ffffff',
              color: activeTable === table.id ? 'white' : '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}
          >
            {table.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const DashboardContent = () => {
  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 60px)'
    }}>
      <h2 style={{ color: '#343a40', marginBottom: '20px' }}>Dashboard</h2>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <p>Welcome to your admin dashboard. Here you can view statistics, manage content, and access all admin features.</p>
      </div>
    </div>
  );
};


const AdminPage = () => {
    const [currentView, setCurrentView] = useState('dashboard');
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
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Nav buttons */
        .nav-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 8px 12px;
          border-radius: 4px;
          position: relative;
          font-weight: 400;
          color: #495057;
          transition: color 0.3s ease;
        }
        
        .nav-button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #ff7b00;
          transition: width 0.3s ease;
        }
        
        .nav-button:hover {
          color: #ff7b00;
        }
        
        .nav-button:hover::after {
          width: 100%;
        }
        
        .nav-button.active {
          color: #ff7b00;
          font-weight: 600;
        }
        
        .nav-button.active::after {
          width: 100%;
        }
  
        /* Action buttons */
        .action-button {
          cursor: pointer;
          font-size: 16px;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          border: 1px solid #ced4da;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .action-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background-color: #ff7b00;
          transition: all 0.3s ease;
          z-index: 0;
        }
        
        .action-button:hover::before {
          left: 0;
        }
        
        .action-button span {
          position: relative;
          z-index: 1;
        }
        
        .action-button:hover {
          color: white;
          border-color: #ff7b00;
        }
        
        .action-button.active {
          background-color: #ff7b00;
          color: white;
          border-color: #ff7b00;
        }
        
        .action-button.active::before {
          left: 0;
        }
  
        /* Mobile menu */
        .mobile-menu {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          background: white;
          padding: 20px;
          box-shadow: 0 5px 10px rgba(0,0,0,0.1);
          z-index: 99;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
  
        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #495057;
        }
  
        @media (max-width: 768px) {
          .nav-buttons, .action-buttons {
            display: none;
          }
          
          .mobile-menu-button {
            display: block;
          }
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }, []);
  
    const handleActionButtonClick = (buttonName) => {
      setActiveActionButton(buttonName);
      setIsMobileMenuOpen(false);
      if (buttonName === 'workouts') {
        setCurrentView('workouts');
        setShowTables(false);
      } else if (buttonName === 'user') {
        setCurrentView('user');
      }
    };
  
    const handleNavButtonClick = (view, showTablesValue) => {
      setCurrentView(view);
      setShowTables(showTablesValue);
      setActiveActionButton(null);
      setIsMobileMenuOpen(false);
    };
  
    return (
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <nav style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '0.8rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '1.3rem',
              color: '#212529'
            }}>
              Admin Page
            </div>
            
            {windowWidth > 768 ? (
              <div className="nav-buttons" style={{ display: 'flex', gap: '15px' }}>
                <button
                  className={`nav-button ${currentView === 'dashboard' && !showTables ? 'active' : ''}`}
                  onClick={() => handleNavButtonClick('dashboard', false)}
                >
                  Dashboard
                </button>
                
                <button
                  className={`nav-button ${showTables ? 'active' : ''}`}
                  onClick={() => handleNavButtonClick('dashboard', true)}
                >
                  Database Tables
                </button>
              </div>
            ) : (
              <button 
                className="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            )}
          </div>
  
          {windowWidth > 768 && (
            <div className="action-buttons" style={{ display: 'flex', gap: '15px' }}>
              <button 
                className={`action-button ${activeActionButton === 'workouts' ? 'active' : ''}`}
                style={{ 
                  backgroundColor: activeActionButton === 'workouts' ? '#ff7b00' : '#e9ecef',
                  color: activeActionButton === 'workouts' ? 'white' : '#495057'
                }}
                onClick={() => handleActionButtonClick('workouts')}
              >
                <span>Add Workout</span>
              </button>
              
              <button 
                className={`action-button ${activeActionButton === 'user' ? 'active' : ''}`}
                style={{ 
                  backgroundColor: activeActionButton === 'user' ? '#ff7b00' : '#f8f9fa',
                  color: activeActionButton === 'user' ? 'white' : '#495057'
                }}
                onClick={() => handleActionButtonClick('user')}
              >
                <span>Back to user view</span>
              </button>
            </div>
          )}
        </nav>
  
        {isMobileMenuOpen && windowWidth <= 768 && (
          <div className="mobile-menu">
            <button
              className={`nav-button ${currentView === 'dashboard' && !showTables ? 'active' : ''}`}
              onClick={() => handleNavButtonClick('dashboard', false)}
            >
              Dashboard
            </button>
            
            <button
              className={`nav-button ${showTables ? 'active' : ''}`}
              onClick={() => handleNavButtonClick('dashboard', true)}
            >
              Database Tables
            </button>
  
            <button 
              className={`action-button ${activeActionButton === 'workouts' ? 'active' : ''}`}
              style={{ 
                backgroundColor: activeActionButton === 'workouts' ? '#ff7b00' : '#e9ecef',
                color: activeActionButton === 'workouts' ? 'white' : '#495057'
              }}
              onClick={() => handleActionButtonClick('workouts')}
            >
              <span>Add Workout</span>
            </button>
            
            <button 
              className={`action-button ${activeActionButton === 'user' ? 'active' : ''}`}
              style={{ 
                backgroundColor: activeActionButton === 'user' ? '#ff7b00' : '#f8f9fa',
                color: activeActionButton === 'user' ? 'white' : '#495057'
              }}
              onClick={() => handleActionButtonClick('user')}
            >
              <span>Back to user view</span>
            </button>
          </div>
        )}
  
        {currentView === 'dashboard' && showTables && <DatabaseTables />}
        {currentView === 'dashboard' && !showTables && <DashboardContent />}
        {currentView === 'workouts' && <div style={{ padding: '20px' }}>Workouts content coming soon...</div>}
      </div>
    );
  };
  
  export default AdminPage;