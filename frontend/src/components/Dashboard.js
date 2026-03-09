// src/components/Dashboard.js
import React from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import NewDashboard from './Dashboard/NewDashboard';

const Dashboard = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <Sidebar />
      <main className='flex-1 overflow-auto ml-64' style={{ marginTop: 'var(--header-height)' }}>
        <NewDashboard />
      </main>
    </div>
  );
};

export default Dashboard;
