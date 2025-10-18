import React from 'react';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const getThemeClass = () => {
    switch (user.alliance) {
      case 'GOOD': return 'good-theme';
      case 'BAD': return 'bad-theme';
      case 'RATS': return 'rat-theme';
      default: return 'good-theme';
    }
  };

  return (
    <div className={`user-dashboard ${getThemeClass()}`}>
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <span>INCOGNITO</span>
        </div>
        <div className="dashboard-info">
          <div className="alliance-display">ALLIANCE: {user.alliance}</div>
          <div className="team-display">TEAM: {user.team}</div>
        </div>
        <button className={`logout-btn ${getThemeClass()}-logout`} onClick={onLogout}>
          LOGOUT
        </button>
      </header>

      <main className="dashboard-main">
        <div className="welcome-message">
          <h2>WELCOME, {user.team}</h2>
          <p>YOUR MISSION AWAITS. PREPARE FOR THE MULTIVERSE PURSUIT.</p>
        </div>
        {/* More dashboard content will be added here */}
      </main>
    </div>
  );
};

export default UserDashboard;