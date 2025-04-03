import React from 'react';

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

export default DashboardContent;