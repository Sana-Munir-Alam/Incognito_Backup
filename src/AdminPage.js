import React, { useState } from 'react';
import './AdminPage.css';

const AdminPage = ({ onLogout }) => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    teamName: '',
    teamLeaderName: '',
    password: '',
    alliance: 'GOOD',
    subAlliance: 'GOOD'
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/create-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Team created successfully!');
        setShowCreateUser(false);
        setNewUser({
          teamName: '',
          teamLeaderName: '',
          password: '',
          alliance: 'GOOD',
          subAlliance: 'GOOD'
        });
      } else {
        alert(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Create team error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-logo">
          <span>INCOGNITO ADMIN</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          LOGOUT
        </button>
      </header>

      <main className="admin-main">
        <div className="admin-controls">
          <div className="control-card">
            <h3>CONTROL PANEL</h3>
            <button 
              className="control-btn"
              onClick={() => setShowCreateUser(true)}
            >
              CREATE USER
            </button>
            {/* More buttons will be added here */}
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>CREATE NEW TEAM</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateUser(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">TEAM NAME</label>
                <input
                  type="text"
                  name="teamName"
                  value={newUser.teamName}
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
                  value={newUser.teamLeaderName}
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
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="ENTER PASSWORD"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">ALLIANCE</label>
                <select
                  name="alliance"
                  value={newUser.alliance}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="GOOD">GOOD</option>
                  <option value="BAD">BAD</option>
                  <option value="RATS">RATS</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">SUB-ALLIANCE</label>
                <select
                  name="subAlliance"
                  value={newUser.subAlliance}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="GOOD">GOOD</option>
                  <option value="BAD">BAD</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  CREATE TEAM
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateUser(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;