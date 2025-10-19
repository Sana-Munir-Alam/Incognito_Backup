import React from 'react';
import './HomePage.css';


const HomePage = ({ onLoginClick }) => {
  return (
    <div className="homepage">
      <div className="homepage-background"></div>
      <div className="homepage-content">
        <header className="homepage-header">
          <div className="logo">
            <span className="logo-text">INCOGNITO</span>
          </div>
          <button className="login-btn" onClick={onLoginClick}>
            LOGIN
          </button>
        </header>
        
        <main className="homepage-main">
          <div className="mission-statement">
            <h1>MULTIVERSE PURSUIT</h1>
            <p>YOU ARE CHOSEN TO BRING JUSTICE OR THE FALL OF THIS VERSE,</p>
            <p>CHOOSE YOUR PATH AND FOLLOW IT TO THE END</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
