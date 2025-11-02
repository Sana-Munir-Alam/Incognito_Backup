const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/incognito', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.log('MongoDB connection error:', err));

// Team Schema
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true, uppercase: true },
  teamLeaderName: { type: String, required: true, uppercase: true },
  password: { type: String, required: true },
  alliance: { type: String, required: true, enum: ['GOOD', 'BAD', 'RATS'] },
  subAlliance: { type: String, required: true, enum: ['GOOD', 'BAD'] },
  GeneralPuzzle1Status: { type: Boolean, default: false },
  GeneralPuzzle2Status: { type: Boolean, default: false },
  GeneralPuzzle3Status: { type: Boolean, default: false },
  GeneralPuzzle4Status: { type: Boolean, default: false },
  GeneralPuzzle5Status: { type: Boolean, default: false },
  GeneralPuzzle6Status: { type: Boolean, default: false },
  GeneralPuzzle7Status: { type: Boolean, default: false },
  GeneralPuzzle8Status: { type: Boolean, default: false },
  SpecialPuzzle1: { type: Boolean, default: false },
  SpecialPuzzle2: { type: Boolean, default: false },
  SpecialPuzzle3: { type: Boolean, default: false },
  SuspectMatchQty: { type: Number, default: 0 },
  SuspectSubmittedStatus: { type: Boolean, default: false },
  TotalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Team = mongoose.model('Team', teamSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// User message tracking schema
const userMessageTrackingSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  lastSeenMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastSeenTimestamp: { type: Date, default: Date.now }
});

const UserMessageTracking = mongoose.model('UserMessageTracking', userMessageTrackingSchema);

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { teamName, teamLeaderName, password } = req.body;

    // Convert to uppercase for consistency
    const upperTeamName = teamName.toUpperCase();
    const upperLeaderName = teamLeaderName.toUpperCase();

    const team = await Team.findOne({ 
      teamName: upperTeamName, 
      teamLeaderName: upperLeaderName 
    });

    if (!team) {
      return res.status(401).json({ message: 'Invalid team credentials' });
    }

    // For now, using simple password comparison
    if (team.password !== password.toUpperCase()) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({
      message: 'Login successful',
      team: team.teamName,
      alliance: team.alliance
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes
app.post('/api/admin/create-team', async (req, res) => {
  try {
    const { teamName, teamLeaderName, password, alliance, subAlliance } = req.body;

    // Check if team already exists
    const existingTeam = await Team.findOne({ teamName: teamName.toUpperCase() });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Create new team
    const newTeam = new Team({
      teamName: teamName.toUpperCase(),
      teamLeaderName: teamLeaderName.toUpperCase(),
      password: password.toUpperCase(),
      alliance: alliance.toUpperCase(),
      subAlliance: subAlliance.toUpperCase()
    });

    await newTeam.save();

    res.status(201).json({ 
      message: 'Team created successfully',
      team: newTeam 
    });

  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teams (for admin observation panel)
app.get('/api/admin/teams', async (req, res) => {
  try {
    const teams = await Team.find().select('-password');
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const teams = await Team.find()
      .select('teamName teamLeaderName alliance TotalPoints')
      .sort({ TotalPoints: -1 });
    
    res.json(teams);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// USER SUBMISSION ROUTES - ADD THESE

// app.post('/api/user/submit-code', async (req, res) => {
//   try {
//     const { teamName, code } = req.body;
    
//     console.log('Code submission received:', { teamName, code }); // Debug log
    
//     const team = await Team.findOne({ teamName: teamName.toUpperCase() });
//     if (!team) {
//       return res.status(404).json({ message: 'Team not found' });
//     }

//     // Define general puzzle codes on backend (SECURE)
//     const generalPuzzles = {
//       '122355': 'GP1',
//       '873872': 'GP2', 
//       '87343892': 'GP3',
//       '456123': 'GP4',
//       '789654': 'GP5',
//       '321987': 'GP6',
//       '159753': 'GP7',
//       '852456': 'GP8'
//     };

//     const puzzleCode = generalPuzzles[code];
    
//     if (!puzzleCode) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid code. Try again.' 
//       });
//     }

//     // Update the specific puzzle status if not already solved
//     const puzzleField = `GeneralPuzzle${puzzleCode.slice(2)}Status`;
//     if (!team[puzzleField]) {
//       team[puzzleField] = true;
      
//       // Recalculate total points
//       const gpPoints = ['1','2','3','4','5','6','7','8']
//         .filter(num => team[`GeneralPuzzle${num}Status`])
//         .length * 10;
      
//       const spPoints = ['1','2','3']
//         .filter(num => team[`SpecialPuzzle${num}`])
//         .length * 20;
      
//       const suspectPoints = team.SuspectMatchQty * 5;
      
//       team.TotalPoints = gpPoints + spPoints + suspectPoints;
      
//       await team.save();

//       // Random clue texts
//       const clues = [
//         "CLUE: THE ANSWER LIES IN THE PATTERNS OF THE PAST.",
//         "CLUE: TRUST YOUR INSTINCTS, THEY RARELY LIE.",
//         "CLUE: SOMETIMES THE TRUTH HIDES IN PLAIN SIGHT.",
//         "CLUE: EVERY PUZZLE SOLVED BRINGS YOU CLOSER TO THE END.",
//         "CLUE: THE MULTIVERSE WHISPERS ITS SECRETS TO THOSE WHO LISTEN."
//       ];
      
//       const randomClue = clues[Math.floor(Math.random() * clues.length)];

//       res.json({ 
//         success: true,
//         message: 'Code accepted! 10 points awarded.',
//         clue: randomClue,
//         puzzleSolved: puzzleCode
//       });
//     } else {
//       res.json({ 
//         success: true,
//         message: 'Puzzle already solved. No additional points.',
//         puzzleSolved: puzzleCode
//       });
//     }

//   } catch (error) {
//     console.error('Code submission error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error' 
//     });
//   }
// });

// FOR DEBUSSING after work done choose the above commented version
app.post('/api/user/submit-code', async (req, res) => {
  try {
    const { teamName, code } = req.body;
    
    console.log('🔍 Code submission received:', { teamName, code });

    const team = await Team.findOne({ teamName: teamName.toUpperCase() });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    console.log('🔍 Team found:', team.teamName);

    // Define general puzzle codes on backend (SECURE)
    const generalPuzzles = {
      '122355': 'GP1',
      '873872': 'GP2', 
      '87343892': 'GP3',
      '456123': 'GP4',
      '789654': 'GP5',
      '321987': 'GP6',
      '159753': 'GP7',
      '852456': 'GP8'
    };

    const puzzleCode = generalPuzzles[code];
    
    if (!puzzleCode) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid code. Try again.' 
      });
    }

    console.log('🔍 Puzzle code identified:', puzzleCode);

    // Update the specific puzzle status if not already solved
    const puzzleField = `GeneralPuzzle${puzzleCode.slice(2)}Status`;
    console.log('🔍 Puzzle field to update:', puzzleField);
    console.log('🔍 Current value of that field:', team[puzzleField]);

    // Fixed clues for each puzzle
    const puzzleClues = {
      'GP1': "CLUE 1: LOOK TO THE STARS FOR GUIDANCE, BUT REMEMBER THE EARTH BENEATH YOUR FEET.",
      'GP2': "CLUE 2: TIME FLOWS LIKE A RIVER, BUT SOME MOMENTS ARE FROZEN FOREVER.", 
      'GP3': "CLUE 3: IN SILENCE, TRUTH SPEAKS THE LOUDEST.",
      'GP4': "CLUE 4: THE KEY TO UNDERSTANDING LIES IN WHAT IS NOT SAID.",
      'GP5': "CLUE 5: PATIENCE REWARDS THOSE WHO SEE BEYOND THE OBVIOUS.",
      'GP6': "CLUE 6: CONNECTIONS HIDDEN IN PLAIN SIGHT REVEAL THE PATH FORWARD.",
      'GP7': "CLUE 7: THE PAST HOLDS ANSWERS, BUT THE FUTURE HOLDS POSSIBILITIES.",
      'GP8': "CLUE 8: TRUST THE PATTERN, BUT QUESTION THE SOURCE."
    };

    const specificClue = puzzleClues[puzzleCode] || "CLUE: CONTINUE YOUR INVESTIGATION. THE TRUTH AWAITS.";

    if (!team[puzzleField]) {
      team[puzzleField] = true;
      console.log('🔍 Field updated to true');
      
      // Recalculate total points
      const gpPoints = ['1','2','3','4','5','6','7','8']
        .filter(num => team[`GeneralPuzzle${num}Status`])
        .length * 10;
      
      const spPoints = ['1','2','3']
        .filter(num => team[`SpecialPuzzle${num}`])
        .length * 20;
      
      const suspectPoints = team.SuspectMatchQty * 5;
      
      team.TotalPoints = gpPoints + spPoints + suspectPoints;
      
      console.log('🔍 Points calculated - GP:', gpPoints, 'SP:', spPoints, 'Suspect:', suspectPoints, 'Total:', team.TotalPoints);

      // Save the team
      await team.save();
      console.log('✅ Team saved to database');

      res.json({ 
        success: true,
        message: 'Code accepted! 10 points awarded.',
        clue: specificClue,
        puzzleSolved: puzzleCode
      });
    } else {
      console.log('🔍 Puzzle already solved, no update needed');
      res.json({ 
        success: true,
        message: 'Puzzle already solved. No additional points.',
        clue: specificClue,
        puzzleSolved: puzzleCode
      });
    }

  } catch (error) {
    console.error('❌ Code submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

app.post('/api/user/submit-special-puzzle', async (req, res) => {
  try {
    const { teamName, puzzleId, answer } = req.body;
    
    console.log('Special puzzle submission received:', { teamName, puzzleId, answer }); // Debug log
    
    const team = await Team.findOne({ teamName: teamName.toUpperCase() });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Define correct answers on the backend (SECURE)
    const correctAnswers = {
      GOOD: {
        sp1: "SP1-273618",
        sp2: "SP2-845932", 
        sp3: "SP3-619874"
      },
      BAD: {
        sp1: "SP1-782491",
        sp2: "SP2-936274",
        sp3: "SP3-451829"
      },
      RATS: {
        sp1: "SP1-663377",
        sp2: "SP2-774488",
        sp3: "SP3-885599"
      }
    };

    // Verify the answer against backend-stored correct answers
    const isCorrect = correctAnswers[team.alliance] && correctAnswers[team.alliance][puzzleId] === answer.toUpperCase();

    if (!isCorrect) {
      return res.status(400).json({ 
        success: false,
        message: 'Incorrect answer. Try again.' 
      });
    }

    const puzzleField = `SpecialPuzzle${puzzleId.slice(2)}`;
    
    // Only award points if not already solved
    if (!team[puzzleField]) {
      team[puzzleField] = true;
      
      // Recalculate total points
      const gpPoints = ['1','2','3','4','5','6','7','8']
        .filter(num => team[`GeneralPuzzle${num}Status`])
        .length * 10;
      
      const spPoints = ['1','2','3']
        .filter(num => team[`SpecialPuzzle${num}`])
        .length * 20;
      
      const suspectPoints = team.SuspectMatchQty * 5;
      
      team.TotalPoints = gpPoints + spPoints + suspectPoints;
      
      await team.save();

      // Log for admin notification
      console.log(`SPECIAL PUZZLE SOLVED: Team ${teamName}, Puzzle ${puzzleId}, Alliance: ${team.alliance}`);
      
      res.json({ 
        success: true,
        message: 'Special puzzle solved! 20 points awarded.' 
      });
    } else {
      res.json({ 
        success: true,
        message: 'Puzzle already solved. No additional points.' 
      });
    }

  } catch (error) {
    console.error('Special puzzle submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

app.post('/api/user/submit-suspects', async (req, res) => {
  try {
    const { teamName, suspects } = req.body;
    
    console.log('Suspects submission received:', { teamName, suspects });
    
    const team = await Team.findOne({ teamName: teamName.toUpperCase() });
    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: 'Team not found' 
      });
    }

    // Check if suspects were already submitted
    if (team.SuspectSubmittedStatus) {
      return res.json({ 
        success: true,
        message: 'Suspects already submitted. No additional points.'
      });
    }

    // Define correct suspects on backend (SECURE)
    const correctSuspects = [
      'ALEXANDER WHITEHALL',
      'RICHARD ARMSTRONG', 
      'CHRISTOPHER BRANDON',
      'THORIN OAKENSHIELD'
    ];

    // Verify suspects against backend-stored correct suspects
    const submittedSuspects = suspects.map(s => s.toUpperCase().trim());
    const matchedSuspects = submittedSuspects.filter(suspect => 
      correctSuspects.includes(suspect)
    ).length;

    console.log('Suspects matched:', matchedSuspects);

    // Update suspect status and points
    team.SuspectMatchQty = matchedSuspects;
    team.SuspectSubmittedStatus = true; // SET TO TRUE ON SUBMISSION
    
    // Recalculate total points
    const gpPoints = ['1','2','3','4','5','6','7','8']
      .filter(num => team[`GeneralPuzzle${num}Status`])
      .length * 10;
    
    const spPoints = ['1','2','3']
      .filter(num => team[`SpecialPuzzle${num}`])
      .length * 20;
    
    const suspectPoints = team.SuspectMatchQty * 5;
    
    team.TotalPoints = gpPoints + spPoints + suspectPoints;
    
    await team.save();

    res.json({ 
      success: true,
      message: 'SUSPECTS SUBMITTED! ANALYSIS IN PROGRESS.' // Removed points reference
    });

  } catch (error) {
    console.error('Suspects submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Add user status route (doing this so that front end is linked with backend status)
app.get('/api/user/status/:teamName', async (req, res) => {
  try {
    const team = await Team.findOne({ teamName: req.params.teamName.toUpperCase() });
    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: 'Team not found' 
      });
    }

    res.json({
      success: true,
      suspectsSubmitted: team.SuspectSubmittedStatus, // Use the new field
      specialPuzzles: {
        sp1: { 
          active: false, // You'll update this later with admin controls
          solved: team.SpecialPuzzle1 
        },
        sp2: { 
          active: false, 
          solved: team.SpecialPuzzle2 
        },
        sp3: { 
          active: false, 
          solved: team.SpecialPuzzle3 
        }
      }
    });

  } catch (error) {
    console.error('User status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Incognito Investigation API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Admin send message route
app.post('/api/admin/send-message', async (req, res) => {
  try {
    const { sender, message, timestamp } = req.body;

    // Create new message
    const newMessage = new Message({
      sender: sender.toUpperCase(),
      message: message,
      timestamp: timestamp || new Date()
    });

    await newMessage.save();

    res.json({ 
      success: true,
      message: 'Message sent to all teams successfully'
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Updated get story messages route - now includes hasNewMessages
app.get('/api/user/story-messages', async (req, res) => {
  try {
    const teamName = req.query.teamName; // Get team name from query params
    
    if (!teamName) {
      return res.status(400).json({ 
        success: false,
        message: 'Team name is required' 
      });
    }

    // Get all messages, sorted by timestamp (newest first)
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(50);

    // Get or create user message tracking
    let userTracking = await UserMessageTracking.findOne({ teamName: teamName.toUpperCase() });
    
    if (!userTracking) {
      userTracking = new UserMessageTracking({
        teamName: teamName.toUpperCase(),
        lastSeenTimestamp: new Date(0) // Very old date to show all as new
      });
      await userTracking.save();
    }

    // Find the newest message
    const newestMessage = messages.length > 0 ? messages[0] : null;
    
    // Check if user has new messages
    const hasNewMessages = newestMessage && 
      new Date(newestMessage.timestamp) > new Date(userTracking.lastSeenTimestamp);

    res.json({
      success: true,
      messages: messages.map(msg => ({
        _id: msg._id,
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.timestamp
      })),
      hasNewMessages: hasNewMessages
    });

  } catch (error) {
    console.error('Get story messages error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update user's last seen timestamp
app.post('/api/user/mark-messages-seen', async (req, res) => {
  try {
    const { teamName } = req.body;
    
    if (!teamName) {
      return res.status(400).json({ 
        success: false,
        message: 'Team name is required' 
      });
    }

    // Update user's last seen timestamp to now
    await UserMessageTracking.findOneAndUpdate(
      { teamName: teamName.toUpperCase() },
      { 
        lastSeenTimestamp: new Date(),
        teamName: teamName.toUpperCase() 
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as seen'
    });

  } catch (error) {
    console.error('Mark messages seen error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Admin reset game route
app.post('/api/admin/reset-game', async (req, res) => {
  try {
    const { confirmation } = req.body;

    // Verify confirmation text
    if (confirmation !== 'CONFIRM INCOGNITO CLEAR') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid confirmation text' 
      });
    }

    console.log('🔄 Starting game reset...');

    // Reset all teams to default state
    const resetResult = await Team.updateMany(
      {}, // All documents
      {
        $set: {
          // Keep these fields unchanged:
          // teamName, teamLeaderName, password, alliance, subAlliance, createdAt
        
          // Reset all puzzle status to false
          GeneralPuzzle1Status: false,
          GeneralPuzzle2Status: false,
          GeneralPuzzle3Status: false,
          GeneralPuzzle4Status: false,
          GeneralPuzzle5Status: false,
          GeneralPuzzle6Status: false,
          GeneralPuzzle7Status: false,
          GeneralPuzzle8Status: false,
          SpecialPuzzle1: false,
          SpecialPuzzle2: false,
          SpecialPuzzle3: false,
          
          // Reset suspect data
          SuspectMatchQty: 0,
          SuspectSubmittedStatus: false,
          
          // Reset points
          TotalPoints: 0
        }
      }
    );

    console.log(`✅ Teams reset: ${resetResult.modifiedCount} teams updated`);

    // Delete all messages
    const messageDeleteResult = await Message.deleteMany({});
    console.log(`✅ Messages deleted: ${messageDeleteResult.deletedCount} messages removed`);

    // Delete all user message tracking
    const trackingDeleteResult = await UserMessageTracking.deleteMany({});
    console.log(`✅ Message tracking cleared: ${trackingDeleteResult.deletedCount} records removed`);

    res.json({ 
      success: true,
      message: `Game reset successfully! ${resetResult.modifiedCount} teams reset, ${messageDeleteResult.deletedCount} messages deleted.`,
      stats: {
        teamsReset: resetResult.modifiedCount,
        messagesDeleted: messageDeleteResult.deletedCount,
        trackingCleared: trackingDeleteResult.deletedCount
      }
    });

  } catch (error) {
    console.error('❌ Reset game error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during reset operation' 
    });
  }
});
