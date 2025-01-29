const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('./auth');

const SECRET_KEY = process.env.SECRET_KEY;


// Create a new playlist (POST)
router.post('/', authenticateToken, async (req, res) => {
    const { name, isPublic, tracks = [] } = req.body;

    if (!name) {
        return res.status(400).send('Missing required information (name).');
    }

    const db = await connectToDatabase();
    const playlists = db.collection('playlists');

    const newPlaylist = { name, isPublic, tracks, userId: req.oidc.user.sub };
    const result = await playlists.insertOne(newPlaylist);
    res.status(201).send(result.ops[0]);
});

// List all public playlists (GET)
router.get('/', async (req, res) => {
    const db = await connectToDatabase();
    const playlist = db.collection('playlists');
    const publicPlaylists = await playlists.find({ isPublic: true}).toArray();
    res.status(200).send(publicPlaylists);
});

// List all the User's public and private Playlists (GET)
router.get('/my', authenticateToken, async (req, res) => {
  const db = await connectToDatabase();
  const playlists = db.collection('playlists');

  const userPlaylists = await playlists.find({ userId: req.user.userId }).toArray();
  res.status(200).send(userPlaylists);
});


// Add a track to a playlist (POST)

// Remove a track from a playlist (DELETE)

// Move a track to a different position in a playlist (PATCH)






module.exports = router;