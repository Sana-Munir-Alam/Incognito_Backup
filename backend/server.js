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
});
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
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
  TotalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Team = mongoose.model('Team', teamSchema);

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
    // In production, you should use bcrypt
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
      password: password.toUpperCase(), // In production, hash this with bcrypt
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
    const teams = await Team.find().select('-password'); // Exclude passwords
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

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Incognito Investigation API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});