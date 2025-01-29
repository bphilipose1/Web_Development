const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('./auth');

const SECRET_KEY = process.env.SECRET_KEY;

// Create a new playlist (POST)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, isPublic, tracks = [] } = req.body;

        if (!name) {
            return res.status(400).send('Missing required information (name).');
        }

        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // ✅ Use `req.user.username` (not `req.oidc.user.sub`)
        const newPlaylist = { name, isPublic, tracks, userId: req.user.username };
        const result = await playlists.insertOne(newPlaylist);

        // ✅ Use `result.insertedId` instead of `result.ops[0]`
        res.status(201).json({ message: "Playlist created", playlistId: result.insertedId });
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).send('Internal Server Error');
    }
});

// List all public playlists (GET)
router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const playlists = db.collection('playlists');
        const publicPlaylists = await playlists.find({ isPublic: true }).toArray();
        res.status(200).send(publicPlaylists);
    } catch (error) {
        console.error("Error fetching public playlists:", error);
        res.status(500).send('Internal Server Error');
    }
});

// List all the User's public and private Playlists (GET)
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // Use `req.user.username` to fetch user's playlists
        const userPlaylists = await playlists.find({ userId: req.user.username }).toArray();
        res.status(200).send(userPlaylists);
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Add a track to a playlist (POST)
router.post('/:playlistId/tracks', authenticateToken, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { track } = req.body;

        if (!track) {
            return res.status(400).send('Missing track information.');
        }

        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // Ensure user can only modify their own playlists
        const updatedPlaylist = await playlists.findOneAndUpdate(
            { _id: playlistId, userId: req.user.username },
            { $push: { tracks: track } },
            { returnDocument: 'after' }
        );

        if (!updatedPlaylist) {
            return res.status(404).send('Playlist not found or unauthorized');
        }

        res.status(200).send(updatedPlaylist);
    } catch (error) {
        console.error("Error adding track:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove a track from a playlist (DELETE)
router.delete('/:playlistId/tracks', authenticateToken, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { track } = req.body;

        if (!track) {
            return res.status(400).send('Missing track information.');
        }

        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        const updatedPlaylist = await playlists.findOneAndUpdate(
            { _id: playlistId, userId: req.user.username },
            { $pull: { tracks: track } },
            { returnDocument: 'after' }
        );

        if (!updatedPlaylist) {
            return res.status(404).send('Playlist not found or unauthorized');
        }

        res.status(200).send(updatedPlaylist);
    } catch (error) {
        console.error("Error removing track:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Move a track within a playlist (PATCH)
router.patch('/:playlistId/tracks', authenticateToken, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { oldIndex, newIndex } = req.body;

        if (oldIndex === undefined || newIndex === undefined) {
            return res.status(400).send('Missing index information.');
        }

        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // ✅ Fetch the playlist first
        const playlist = await playlists.findOne({ _id: playlistId, userId: req.user.username });

        if (!playlist) {
            return res.status(404).send('Playlist not found or unauthorized');
        }

        if (oldIndex < 0 || newIndex < 0 || oldIndex >= playlist.tracks.length || newIndex >= playlist.tracks.length) {
            return res.status(400).send('Invalid track index.');
        }

        // ✅ Move the track
        const [movedTrack] = playlist.tracks.splice(oldIndex, 1);
        playlist.tracks.splice(newIndex, 0, movedTrack);

        await playlists.updateOne({ _id: playlistId }, { $set: { tracks: playlist.tracks } });

        res.status(200).send({ message: "Track reordered", tracks: playlist.tracks });
    } catch (error) {
        console.error("Error moving track:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
