import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { PredictionPage } from './pages/PredictionPage';
import { ForecastPage } from './pages/ForecastPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { HistoryPage } from './pages/HistoryPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { Droplets, RefreshCw } from 'lucide-react';


const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, initializing } = useContext(AuthContext);

  if (initializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: '#f8fafc',
        gap: '1rem'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(0, 242, 254, 0.4)'
        }}>
          <Droplets size={30} color="#070a12" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f2fe', fontSize: '0.9rem', fontWeight: 600 }}>
          <RefreshCw size={16} className="pulse-active" /> Initializing HydroFusion AI...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'predict':
        return <PredictionPage setActiveTab={setActiveTab} />;
      case 'forecast':
        return <ForecastPage />;
      case 'what-if':
        return <WhatIfPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'chat':
        return <ChatbotPage />;
      case 'history':
        return <HistoryPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;

    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar activeTab={activeTab} systemStatus="Normal Operation" />
        <main className="page-wrapper">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
