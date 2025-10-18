import React, { useState } from 'react';
import LoadingPage from './LoadingPage';
import HomePage from './HomePage';
import Login from './Login';
import AdminPage from './AdminPage';
import UserDashboard from './UserDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [user, setUser] = useState(null);

  const handleLoadingFinish = () => {
    setCurrentPage('home');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('user');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  return (
    <div className="App">
      {currentPage === 'loading' && <LoadingPage onFinish={handleLoadingFinish} />}
      {currentPage === 'home' && <HomePage onLoginClick={() => setCurrentPage('login')} />}
      {currentPage === 'login' && <Login onLogin={handleLogin} onBack={() => setCurrentPage('home')} />}
      {currentPage === 'admin' && <AdminPage onLogout={handleLogout} />}
      {currentPage === 'user' && user && <UserDashboard user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;