import React, { useState, useEffect } from 'react';
import './AdminPage.css';

const AdminPage = ({ onLogout }) => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [teams, setTeams] = useState([]);
  const [sortedTeams, setSortedTeams] = useState([]);
  
  const [newUser, setNewUser] = useState({
    teamName: '',
    teamLeaderName: '',
    password: '',
    alliance: 'GOOD',
    subAlliance: 'GOOD'
  });

  const [messageData, setMessageData] = useState({
    sender: 'ALEXANDER WHITEHALL',
    message: ''
  });

  // Predefined sender names
  const senderOptions = [
    'SAMEUL JACKSON',
    'JACK SPARROW',
    'CYGNUS CHRONOS',
    'ALEXANDER WHITEHALL',
    'COMMAND CENTER',
    'MULTIVERSE HQ',
    'SYSTEM ADMIN',
    'ANONYMOUS'
  ];

  // Fetch teams data
  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/teams');
      const data = await response.json();
      if (response.ok) {
        setTeams(data);
        
        // Sort teams by total score (descending)
        const sorted = [...data].sort((a, b) => b.TotalPoints - a.TotalPoints);
        setSortedTeams(sorted);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Load teams on component mount and set up polling
  useEffect(() => {
    fetchTeams();
    const interval = setInterval(fetchTeams, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

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
        fetchTeams(); // Refresh teams list
      } else {
        alert(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Create team error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: messageData.sender,
          message: messageData.message,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Message sent to all teams!');
        setShowMessageModal(false);
        setMessageData({
          sender: 'ALEXANDER WHITEHALL',
          message: ''
        });
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const handleResetGame = async (e) => {
    e.preventDefault();
    
    if (resetConfirmation !== 'CONFIRM INCOGNITO CLEAR') {
      alert('Please type "CONFIRM INCOGNITO CLEAR" exactly to proceed.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/reset-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation: resetConfirmation
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Game reset successfully! All teams have been restored to default state.');
        setShowResetModal(false);
        setResetConfirmation('');
        fetchTeams(); // Refresh teams list
      } else {
        alert(data.message || 'Failed to reset game');
      }
    } catch (error) {
      console.error('Reset game error:', error);
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

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to render puzzle status circles
  const renderPuzzleStatus = (team, puzzleType) => {
    const puzzles = [];
    const count = puzzleType === 'GP' ? 8 : 3;
    
    for (let i = 1; i <= count; i++) {
      const puzzleField = puzzleType === 'GP' ? `GeneralPuzzle${i}Status` : `SpecialPuzzle${i}`;
      const isSolved = team[puzzleField];
      
      puzzles.push(
        <div key={i} className="puzzle-status-item">
          <span className="puzzle-number">{i}</span>
          <div className={`puzzle-circle ${isSolved ? 'solved' : 'unsolved'}`}></div>
        </div>
      );
    }
    
    return puzzles;
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
        <div className="admin-controls-grid">
          {/* Control Panel Card */}
          <div className="control-card">
            <h3>CONTROL PANEL</h3>
            <button 
              className="control-btn"
              onClick={() => setShowCreateUser(true)}
            >
              CREATE USER
            </button>
            <button 
              className="control-btn"
              onClick={() => setShowMessageModal(true)}
            >
              SEND MESSAGE
            </button>
            {/* More buttons will be added here */}
          </div>

          {/* Critical Card */}
          <div className="critical-card">
            <h3 className="critical-title">CRITICAL</h3>
            <button 
              className="critical-btn"
              onClick={() => setShowResetModal(true)}
            >
              RESET GAME
            </button>
          </div>
        </div>

        {/* Divider Line */}
        <div className="section-divider">
          <div className="divider-line"></div>
        </div>

        {/* Teams Progress Section */}
        <div className="teams-progress-section">
          <h2 className="teams-progress-title">TEAMS PROGRESS & LEADERBOARD</h2>
          
          <div className="teams-grid-container">
            <div className="teams-grid">
              {sortedTeams.map((team, index) => (
                <div key={team._id} className="team-card">
                  {/* Simple numbering 1,2,3,4... */}
                  <div className="team-card-number">
                    {index + 1}
                  </div>
                  
                  <div className="team-header">
                    <h4 className="team-name">{team.teamName}</h4>
                    <p className="team-leader">Leader: {team.teamLeaderName}</p>
                  </div>
                  
                  <div className="team-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Score:</span>
                      <span className="stat-value score-value">{team.TotalPoints}</span>
                    </div>
                    
                    <div className="stat-item">
                      <span className="stat-label">Suspect Match:</span>
                      <span className="stat-value">{team.SuspectMatchQty}/4</span>
                    </div>
                    
                    <div className="stat-item">
                      <span className="stat-label">Suspects Submitted:</span>
                      <span className={`stat-value ${team.SuspectSubmittedStatus ? 'submitted' : 'not-submitted'}`}>
                        {team.SuspectSubmittedStatus ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                  
                  {/* GP Puzzle Status */}
                  <div className="puzzle-section">
                    <h5 className="puzzle-title">GP PUZZLE</h5>
                    <div className="puzzle-status-grid">
                      {renderPuzzleStatus(team, 'GP')}
                    </div>
                  </div>
                  
                  {/* SP Puzzle Status */}
                  <div className="puzzle-section">
                    <h5 className="puzzle-title">SP PUZZLE</h5>
                    <div className="puzzle-status-grid">
                      {renderPuzzleStatus(team, 'SP')}
                    </div>
                  </div>
                </div>
              ))}
              
              {sortedTeams.length === 0 && (
                <div className="no-teams-message">
                  <p>No teams created yet. Use "CREATE USER" to add teams.</p>
                </div>
              )}
            </div>
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

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>SEND MESSAGE TO ALL TEAMS</h3>
              <button 
                className="close-btn"
                onClick={() => setShowMessageModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label className="form-label">SENDER NAME</label>
                <select
                  name="sender"
                  value={messageData.sender}
                  onChange={handleMessageChange}
                  className="form-input"
                  required
                >
                  {senderOptions.map((sender, index) => (
                    <option key={index} value={sender}>
                      {sender}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">MESSAGE</label>
                <textarea
                  name="message"
                  value={messageData.message}
                  onChange={handleMessageChange}
                  className="form-input message-textarea"
                  placeholder="ENTER YOUR MESSAGE FOR ALL TEAMS..."
                  rows="6"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  SEND MESSAGE
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowMessageModal(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Game Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content reset-modal">
            <div className="modal-header">
              <h3 className="reset-title">RESET GAME - CRITICAL OPERATION</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmation('');
                }}
              >
                ×
              </button>
            </div>
            
            <div className="reset-warning">
              <h4>⚠️ WARNING: THIS ACTION CANNOT BE UNDONE</h4>
              <p>This will reset ALL teams to their default state:</p>
              <ul>
                <li>All puzzle progress will be lost</li>
                <li>All points will be reset to zero</li>
                <li>All suspect submissions will be cleared</li>
                <li>All messages will be deleted</li>
                <li>Teams will start fresh</li>
              </ul>
              <p className="danger-text">Team names, leaders, passwords, and alliances will be preserved.</p>
            </div>
            
            <form onSubmit={handleResetGame}>
              <div className="form-group">
                <label className="form-label">
                  TYPE "CONFIRM INCOGNITO CLEAR" TO PROCEED:
                </label>
                <input
                  type="text"
                  value={resetConfirmation}
                  onChange={(e) => setResetConfirmation(e.target.value)}
                  className="form-input reset-confirmation-input"
                  placeholder="CONFIRM INCOGNITO CLEAR"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn-danger"
                  disabled={resetConfirmation !== 'CONFIRM INCOGNITO CLEAR'}
                >
                  CONFIRM RESET
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetConfirmation('');
                  }}
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
