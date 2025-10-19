import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onBack }) => {
  const [loginType, setLoginType] = useState('participant');
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeaderName: '',
    password: '',
    adminUsername: '',
    adminPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loginType === 'admin') {
      // Hardcoded admin credentials
      if (formData.adminUsername === 'INCOGNITOADMIN' && formData.adminPassword === 'INCOGNITO26PROCOM') {
        onLogin({ role: 'admin' });
      } else {
        alert('Invalid admin credentials');
      }
    } else {
      // Participant login - will connect to backend
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamName: formData.teamName,
            teamLeaderName: formData.teamLeaderName,
            password: formData.password
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          onLogin({
            role: 'participant',
            team: data.team,
            alliance: data.alliance
          });
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Connection error. Please try again.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>
      <div className="login-container">
        <button className="back-btn" onClick={onBack}>← BACK</button>
        
        <div className="form-container login-form">
          <h2>ACCESS PORTAL</h2>
          
          <div className="login-type-toggle">
            <button 
              className={`toggle-btn ${loginType === 'participant' ? 'active' : ''}`}
              onClick={() => setLoginType('participant')}
            >
              PARTICIPANT
            </button>
            <button 
              className={`toggle-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginType('admin')}
            >
              ADMIN
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {loginType === 'participant' ? (
              <>
                <div className="form-group">
                  <label className="form-label">TEAM NAME</label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ENTER TEAM NAME"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">TEAM LEADER NAME</label>
                  <input
                    type="text"
                    name="teamLeaderName"
                    value={formData.teamLeaderName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ENTER LEADER NAME"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">PASSWORD</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ENTER PASSWORD"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">ADMIN USERNAME</label>
                  <input
                    type="text"
                    name="adminUsername"
                    value={formData.adminUsername}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ENTER ADMIN USERNAME"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">ADMIN PASSWORD</label>
                  <input
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ENTER ADMIN PASSWORD"
                    required
                  />
                </div>
              </>
            )}
            
            <button type="submit" className="btn-primary login-submit">
              {loginType === 'participant' ? 'ACCESS DASHBOARD' : 'ADMIN ACCESS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
