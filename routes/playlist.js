const express = require('express');
const router = express.Router();
const { albums } = require('./album');
const connectToDatabase = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('./auth');
const { ObjectId } = require('mongodb');
playlistId = 1;

// Create a new playlist (POST)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, isPublic, tracks = [] } = req.body;

        if (!name) {
            return res.status(400).send('Missing name feild.');
        }

        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        
        let validTracks = [];

        //ensure that the track album ids are both existing and valid
        tracks.forEach(({ albumID, trackID }) => {
            const album = albums.find((album) => album.albumID === albumID);
            if (album && album.tracks.some((t) => t.trackID === trackID)) {
                validTracks.push({ albumID, trackID });
            }
        })

        const newPlaylist = { name, isPublic, tracks: validTracks, userId: req.user.username };
        const result = await playlists.insertOne(newPlaylist);

        res.status(201).json({ message: "Playlist created", playlistId: result.insertedId });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Update a playlist (PATCH) -> Works
router.patch('/:playlistId/tracks',authenticateToken, async (req, res) => {
    try {
        let { playlistId } = req.params;
        let { tracks } = req.body; // Accept an array of { albumID, trackID } pairs
        console.log("playlistId", playlistId, "tracks", tracks);
        if (!Array.isArray(tracks) || tracks.length === 0) {
            
            return res.status(400).send('Missing or invalid "tracks" array.');
        }

        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // Convert `playlistId` to ObjectId before querying
        try {
            playlistId = new ObjectId(playlistId);
        } catch (err) {
            
            return res.status(400).send('Invalid playlist ID format.');
        }
        console.log("playlistId", playlistId);
        // Retrieve the existing playlist to check for duplicates
        const existingPlaylist = await playlists.findOne({ _id: playlistId });

        if (!existingPlaylist) {
            return res.status(404).send('Playlist not found.');
        }
        console.log("existingPlaylist", existingPlaylist);
        let validTracks = [];

        // Validate and filter out already existing tracks
        tracks.forEach(({ albumID, trackID }) => {
            const album = albums.find((album) => album.albumID === albumID); // Check if album exists
            console.log("album", album, "albumID", albumID, "trackID", trackID);
            if (album && album.tracks.some((t) => t.trackID === trackID) && !existingPlaylist.tracks.some((t) => t.albumID === albumID && t.trackID === trackID) // Skip duplicates
            ) {
                validTracks.push({ albumID, trackID });
                console.log("validTracks", validTracks);
            }
        });

        if (validTracks.length === 0) {
            return res.status(400).send('No new valid tracks to add.');
        }

        // Add valid tracks to the playlist
        const updatedPlaylist = await playlists.findOneAndUpdate(
            { _id: playlistId },
            { $push: { tracks: { $each: validTracks } } },
            { returnDocument: 'after' }
        );

        res.send({
            message: `Added ${validTracks.length} new track(s) to the playlist.`,
            validTracks: validTracks,
            playlist: updatedPlaylist.value
        });

    } catch (error) {
        console.error("Error adding tracks:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove a track from a playlist (DELETE) -> Works
router.delete('/:playlistId/tracks', authenticateToken, async (req, res) => {
    try {
        let { playlistId } = req.params;
        let { trackId, albumId } = req.body;
        
        if (!trackId || !albumId) {
            return res.status(400).send('Invalid Body.');
        }
        // Convert `playlistId` to ObjectId before querying
        try {
            playlistId = new ObjectId(playlistId);
            //convert trackId to int
            trackId = parseInt(trackId);
            albumId = parseInt(albumId);
        } catch (err) {
            
            return res.status(400).send('Invalid playlist ID format.');
        }
        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        console.log("playlistId", playlistId, "trackId", trackId, "albumId", albumId);
        
        //remove track index from playlist
        const updatedPlaylist = await playlists.findOneAndUpdate(
            { _id: playlistId, userId: req.user.username },
            { $pull: { tracks: { albumID: albumId, trackID: trackId } } }, // Remove only the matching track
            { returnDocument: 'after' }
        );

        if (!updatedPlaylist) {
            return res.status(404).send('Playlist not found or unauthorized');
        }

        res.send(updatedPlaylist);
    } catch (error) {
        console.error("Error removing track:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Move a track within a playlist (PATCH) -> Works
router.patch('/:playlistId/tracks/swap', authenticateToken, async (req, res) => {
    try {
        let { playlistId } = req.params;
        let { oldIndex, newIndex } = req.body;
        console.log("typeof oldIndex", typeof oldIndex, "typeof newIndex", typeof newIndex);
        if (oldIndex === undefined || newIndex === undefined) {
            return res.status(400).send('Missing index information.');
        }

        //convert playlistId to ObjectId
        try {
            playlistId = new ObjectId(playlistId);
            oldIndex = parseInt(oldIndex);
            newIndex = parseInt(newIndex);
        } catch (err) {
            return res.status(400).send('Invalid playlist ID format.');
        }


        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // Fetch the playlist from MongoDB
        const playlist = await playlists.findOne({ _id: playlistId, userId: req.user.username });

        // Check if the playlist exists if not then either the playlist is not found or the user is unauthorized
        if (!playlist) {
            return res.status(404).send('Playlist not found or unauthorized');
        }

        // Check if the indexes are valid or not
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= playlist.tracks.length || newIndex >= playlist.tracks.length) {
            return res.status(400).send('Invalid track index.');
        }

        // Move the track
        const [movedTrack] = playlist.tracks.splice(oldIndex, 1);
        playlist.tracks.splice(newIndex, 0, movedTrack);

        await playlists.updateOne({ _id: playlistId }, { $set: { tracks: playlist.tracks } });

        res.send({ message: "Track reordered", tracks: playlist.tracks });
    } catch (error) {
        console.error("error moving track:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Change the privacy of a playlist (PATCH) -> Works
router.patch('/:playlistId/privacy', authenticateToken, async (req, res) => {
    try {
        let { playlistId } = req.params;
        let { isPublic } = req.body;

        if (isPublic === undefined) {
            return res.status(400).send('Missing privacy information.');
        }
        // Check if the privacy is a boolean
        if (typeof isPublic !== 'boolean') {
            return res.status(400).send('Invalid privacy value.');
        }
        // Convert `playlistId` to ObjectId before querying
        try {
            playlistId = new ObjectId(playlistId);
            isPublic = Boolean(isPublic);
        } catch (err) {
            return res.status(400).send('Invalid playlist ID format.');
        }
    
        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        const updatedPlaylist = await playlists.findOneAndUpdate(
            { _id: playlistId, userId: req.user.username },
            { $set: { isPublic } },
            { returnDocument: 'after' }
        );

        if (!updatedPlaylist) {
            return res.status(404).send('Playlist not found or unauthorized');
        }
        res.send(updatedPlaylist);
    } catch (error) {
        console.error("error changing privacy:", error);
        res.status(500).send('Internal Server Error');
    }
});


// List all public playlists (GET) -> Works
router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const playlists = db.collection('playlists');
        const publicPlaylists = await playlists.find({ isPublic: true }).toArray();
        res.send(publicPlaylists);
    } catch (error) {
        console.error("error getting public playlists:", error);
        res.status(500).send('Internal Server Error');
    }
});

// List all the User's public and private Playlists (GET) -> Works
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const playlists = db.collection('playlists');

        // Use `req.user.username` to fetch user's playlists
        const userPlaylists = await playlists.find({ userId: req.user.username }).toArray();
        res.send(userPlaylists);
    } catch (error) {
        console.error("error getting user playlists:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
