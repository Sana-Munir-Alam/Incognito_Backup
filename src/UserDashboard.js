import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('slot1');
  const [specialPuzzles, setSpecialPuzzles] = useState({
    sp1: { active: false, solved: false },
    sp2: { active: false, solved: false },
    sp3: { active: false, solved: false }
  });
  const [showPuzzleModal, setShowPuzzleModal] = useState(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [suspects, setSuspects] = useState(['', '', '', '']);
  const [suspectsSubmitted, setSuspectsSubmitted] = useState(false);
  const [storyMessages, setStoryMessages] = useState([]);
  const [hasNewStory, setHasNewStory] = useState(false);
  const [showClueModal, setShowClueModal] = useState(false);
  const [clueText, setClueText] = useState('');

  // Puzzle riddles only (no answers - answers are stored securely on backend)
  const puzzleRiddles = {
    GOOD: {
      sp1: "IN THE REALM OF LIGHT, WHERE TRUTH RESIDES,\nA NUMBER HIDDEN IN PLAIN SIGHT.\nCOUNT THE GUARDIANS, MULTIPLY BY NINE,\nTHE CODE YOU SEEK IN SHADOWS SHINE.\n\nANSWER FORMAT: SP1-XXXXXX",
      sp2: "WHEN STARS ALIGN IN CRIMSON NIGHT,\nTHREE PATHS CONVERGE IN ETERNAL LIGHT.\nSUBTRACT THE LIES, ADD THE TRUTH,\nTHE FINAL NUMBER SHALL BE YOUR PROOF.\n\nANSWER FORMAT: SP2-XXXXXX",
      sp3: "BEYOND THE VEIL WHERE TIME STANDS STILL,\nFOUR ELEMENTS THE VOID DO FILL.\nCOMBINE THEIR ESSENCE, DIVIDE BY TWO,\nTHE KEY UNLOCKS WHAT'S PURE AND TRUE.\n\nANSWER FORMAT: SP3-XXXXXX"
    },
    BAD: {
      sp1: "IN SHADOWS DEEP WHERE DECEIT IS BORN,\nA SECRET KEPT FROM NIGHT 'TIL MORN.\nREVERSE THE DIGITS, ADD THE FALL,\nTHE DARKNESS ANSWERS TO YOUR CALL.\n\nANSWER FORMAT: SP1-XXXXXX",
      sp2: "WHERE CHAOS REIGNS AND ORDER DIES,\nFIVE WHISPERS TELL OF CUNNING LIES.\nMULTIPLY THE ANGER, DIVIDE THE FEAR,\nTHE VICTORY NUMBER NOW APPEARS.\n\nANSWER FORMAT: SP2-XXXXXX",
      sp3: "BENEATH THE SURFACE WHERE MALICE GROWS,\nSIX SIGILS IN DARKNESS GLOW.\nSUBTRACT THE WEAK, ADD THE STRONG,\nTHE FINAL ANSWER TO CORRUPTION BELONGS.\n\nANSWER FORMAT: SP3-XXXXXX"
    },
    RATS: {
      sp1: "BETWEEN TWO WORLDS, NEITHER HERE NOR THERE,\nA DOUBLE AGENT'S SECRET LAIR.\nADD BOTH SIDES, SUBTRACT THE BETRAYAL,\nTHE BALANCE POINT WITHOUT FAIL.\n\nANSWER FORMAT: SP1-XXXXXX",
      sp2: "IN THE GRAY WHERE LOYALTIES SHIFT,\nSEVEN SHADOWS CRAFT A CUNNING DRIFT.\nDIVIDE THE TRUTH, MULTIPLY THE LIES,\nTHE NUMBER OF SURVIVAL BEFORE YOU DIES.\n\nANSWER FORMAT: SP2-XXXXXX",
      sp3: "WALKING THE LINE OF FIRE AND ICE,\nEIGHT FACES WEAR THE SAME DEVICE.\nCOMBINE THE EXTREMES, FIND THE MIDDLE WAY,\nTHE RAT'S ESCAPE AT BREAK OF DAY.\n\nANSWER FORMAT: SP3-XXXXXX"
    }
  };

  const getThemeClass = () => {
    switch (user.alliance) {
      case 'GOOD': return 'good-theme';
      case 'BAD': return 'bad-theme';
      case 'RATS': return 'rat-theme';
      default: return 'good-theme';
    }
  };

  // Fetch user status when component mounts
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/status/${user.team}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Update suspects submitted status from the new field
          setSuspectsSubmitted(data.suspectsSubmitted);
          
          // Update special puzzles status
          setSpecialPuzzles(data.specialPuzzles);
          
          console.log('User status loaded:', data);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, [user.team]);

  // Simulate receiving story messages (will be replaced with WebSocket)
  useEffect(() => {
    // Initial story messages
    setStoryMessages([
      "THE MULTIVERSE PURSUIT BEGINS. CHOOSE YOUR PATH WISELY.",
      "TIME IS OF THE ESSENCE. EVERY DECISION MATTERS.",
      "TRUST NO ONE, QUESTION EVERYTHING."
    ]);
  }, []);

  const handlePuzzleClick = (puzzleId) => {
    if (specialPuzzles[puzzleId].active && !specialPuzzles[puzzleId].solved) {
      setShowPuzzleModal(puzzleId);
    }
  };

  const handlePuzzleSubmit = async (puzzleId) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/submit-special-puzzle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: user.team,
          puzzleId: puzzleId,
          answer: puzzleAnswer.toUpperCase()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.success) {
          setSpecialPuzzles(prev => ({
            ...prev,
            [puzzleId]: { ...prev[puzzleId], solved: true }
          }));
          setShowPuzzleModal(null);
          setPuzzleAnswer('');
          alert('PUZZLE SOLVED! MISSION ACCOMPLISHED.');
        } else {
          alert(data.message || 'Incorrect answer. Try again.');
        }
      } else {
        alert(data.message || 'Error submitting puzzle.');
      }
    } catch (error) {
      console.error('Puzzle submission error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/user/submit-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: user.team,
          code: codeInput
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.success) {
          setClueText(data.clue || "CLUE: THE TRUTH HIDES IN PLAIN SIGHT. TRUST YOUR INSTINCTS.");
          setShowClueModal(true);
          setCodeInput('');
        } else {
          alert(data.message || 'Invalid code. Try again.');
        }
      } else {
        alert(data.message || 'Error submitting code.');
      }
    } catch (error) {
      console.error('Code submission error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const handleSuspectsSubmit = async (e) => {
    e.preventDefault();
    
    if (suspectsSubmitted) return;

    try {
      const response = await fetch('http://localhost:5000/api/user/submit-suspects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: user.team,
          suspects: suspects.map(s => s.toUpperCase().trim())
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          setSuspectsSubmitted(true);
          alert('SUSPECTS SUBMITTED! ANALYSIS IN PROGRESS.');
        } else {
          alert(data.message || 'Error submitting suspects.');
        }
      } else {
        alert(data.message || 'Error submitting suspects.');
      }
    } catch (error) {
      console.error('Suspects submission error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const handleSuspectChange = (index, value) => {
    const newSuspects = [...suspects];
    newSuspects[index] = value.toUpperCase();
    setSuspects(newSuspects);
  };

  // Fetch puzzle status from backend (for real-time updates)
  useEffect(() => {
    const checkPuzzleStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/puzzle-status/${user.team}`);
        const data = await response.json();
        if (response.ok) {
          setSpecialPuzzles(data.specialPuzzles);
        }
      } catch (error) {
        console.error('Error fetching puzzle status:', error);
      }
    };

    checkPuzzleStatus();
    const interval = setInterval(checkPuzzleStatus, 5000);
    
    return () => clearInterval(interval);
  }, [user.team]);

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

        {/* Special Puzzle Buttons */}
        <div className="puzzle-buttons-container">
          <h3>SPECIAL OPERATIONS</h3>
          <div className="puzzle-buttons">
            {['sp1', 'sp2', 'sp3'].map(puzzleId => (
              <button
                key={puzzleId}
                className={`puzzle-btn ${
                  specialPuzzles[puzzleId].active 
                    ? specialPuzzles[puzzleId].solved ? 'solved' : 'active' 
                    : 'inactive'
                }`}
                onClick={() => handlePuzzleClick(puzzleId)}
                disabled={!specialPuzzles[puzzleId].active || specialPuzzles[puzzleId].solved}
              >
                SPECIAL PUZZLE {puzzleId.slice(2)}
                {specialPuzzles[puzzleId].solved && ' ✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeSection === 'slot1' ? 'active' : ''}`}
            onClick={() => setActiveSection('slot1')}
          >
            SLOT1 SUBMISSION
          </button>
          <button 
            className={`tab-btn ${activeSection === 'story' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('story');
              setHasNewStory(false);
            }}
          >
            STORY {hasNewStory && <span className="notification-dot"></span>}
          </button>
        </div>

        {/* Content Sections */}
        <div className="dashboard-content">
          {activeSection === 'slot1' && (
            <div className="slot1-section">
              {/* Code Submission */}
              <div className="submission-card">
                <h4>ENTER CODE</h4>
                <form onSubmit={handleCodeSubmit}>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="form-input"
                    placeholder="ENTER PUZZLE CODE"
                    required
                  />
                  <button type="submit" className="btn-primary">
                    SUBMIT CODE
                  </button>
                </form>
              </div>

              {/* Suspects Submission */}
              <div className="submission-card">
                <h4>TOP 4 SUSPECTS</h4>
                {!suspectsSubmitted ? (
                  <form onSubmit={handleSuspectsSubmit}>
                    {suspects.map((suspect, index) => (
                      <input
                        key={index}
                        type="text"
                        value={suspect}
                        onChange={(e) => handleSuspectChange(index, e.target.value)}
                        className="form-input"
                        placeholder={`SUSPECT ${index + 1} FULL NAME`}
                        required
                        disabled={suspectsSubmitted}
                      />
                    ))}
                    <button type="submit" className="btn-primary" disabled={suspectsSubmitted}>
                      SUBMIT SUSPECTS
                    </button>
                  </form>
                ) : (
                  <p className="submitted-text">SUSPECTS SUBMITTED ✓</p>
                )}
              </div>
            </div>
          )}

          {activeSection === 'story' && (
            <div className="story-section">
              <h4>MISSION BRIEFING</h4>
              <div className="story-messages">
                {storyMessages.map((message, index) => (
                  <div key={index} className="story-message">
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Puzzle Modal */}
      {showPuzzleModal && (
        <div className="modal-overlay">
          <div className="modal-content puzzle-modal">
            <div className="modal-header">
              <h3>SPECIAL PUZZLE {showPuzzleModal.slice(2)}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPuzzleModal(null)}
              >
                ×
              </button>
            </div>
            <div className="puzzle-content">
              <pre className="riddle-text">
                {puzzleRiddles[user.alliance][showPuzzleModal]}
              </pre>
              <input
                type="text"
                value={puzzleAnswer}
                onChange={(e) => setPuzzleAnswer(e.target.value)}
                className="form-input"
                placeholder={`SP${showPuzzleModal.slice(2)}-XXXXXX`}
              />
              <button 
                onClick={() => handlePuzzleSubmit(showPuzzleModal)}
                className="btn-primary"
              >
                SUBMIT ANSWER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clue Modal */}
      {showClueModal && (
        <div className="modal-overlay">
          <div className="modal-content clue-modal">
            <div className="modal-header">
              <h3>CLUE DISCOVERED</h3>
              <button 
                className="close-btn"
                onClick={() => setShowClueModal(false)}
              >
                ×
              </button>
            </div>
            <div className="clue-content">
              <p>{clueText}</p>
              <button 
                onClick={() => setShowClueModal(false)}
                className="btn-primary"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
