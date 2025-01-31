const express = require('express');
const connectToDatabase = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

/* Tags Structure
- trackID (from Homework 1)
- albumID (from Homework 1)
- tag (string)
- upvotes (integer)
- downvotes (integer)
*/

// Add a tag to a track (POST) -> works
router.post('/:albumId/:trackId', authenticateToken, async (req, res) => {
    try {
        const { albumId, trackId } = req.params; //used to identify the track
        let { tag } = req.body;

        if (!tag) {
            return res.status(400).send('Missing tag information.');
        }
        console.log(typeof tag);
        try{
            //convert tag and clean it up
            
            
            if (typeof tag !== 'string' || tag.length < 1) {
                return res.status(400).send('Invalid tag information.');
            }
            tag = tag.toLowerCase().trim();

        }
        catch(e){
            return res.status(400).send('Invalid tag information.');
        }

        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');

        // Check if tag already exists for this track
        const existingTag = await tagsCollection.findOne({ albumID: albumId, trackID: trackId, tag });

        if (existingTag) {
            return res.status(400).send('Tag already exists for this track.');
        }

        // Insert new tag reference
        const newTag = { albumID: albumId, 
            trackID: trackId, 
            tag, 
            upvotes: 0, 
            downvotes: 0,
            votedUsers: {}};
        await tagsCollection.insertOne(newTag);

        res.status(201).json(newTag);
    } catch (error) {
        console.error("Error adding tag:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Upvote or downvote a tag
router.patch('/:albumId/:trackId', authenticateToken, async (req, res) => {
    try {
        const { albumId, trackId } = req.params;
        const { vote, tagName } = req.body;
        const user = req.user.username;

        if (!tagName || typeof tagName !== "string") {
            return res.status(400).send("Invalid or missing tag name.");
        }

        const cleanedTagName = tagName.toLowerCase().trim();


        if (!vote || (vote !== 'upvote' && vote !== 'downvote')) {
            return res.status(400).send('Invalid vote value. Use upvote or downvote.');
        }

        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');
        console.log(user);
        // Find the tag for this album + track
        const tag = await tagsCollection.findOne({ albumID: albumId, 
            trackID: trackId, 
            tag: cleanedTagName });

        if (!tag) {
            return res.status(404).send('Tag not found.');
        }

        // Check if uers is being tracked and if so if the user has already voted on this tag
        if (tag.votedUsers && tag.votedUsers[user]) {
            return res.status(403).send('You already voted on this tag.');
        }

        const updateField = vote === 'upvote' 
            ? { $inc: { upvotes: 1 }, $set: { [`votedUsers.${user}`]: "upvote" } } // Case of upvote
            : { $inc: { downvotes: 1 }, $set: { [`votedUsers.${user}`]: "downvote" } }; // Case of downvote
        await tagsCollection.updateOne({ albumID: albumId, trackID: trackId, tag: cleanedTagName }, updateField);

        res.status(200).json({ message: `Tag ${vote}d successfully` });
    } catch (error) {
        console.error("Error voting on tag:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all tracks with more upvotes than downvotes for a specific tag
router.get('/:tagName', async (req, res) => {
    try {
        let { tagName } = req.params; // Get tag from URL param
        //clean up tag
        tagName = tagName.toLowerCase().trim();
        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');
        
        // Find all tracks where upvotes > downvotes for the given tag
        const tracksWithTag = await tagsCollection.find({
            tag: tagName,
            $expr: { $gt: ["$upvotes", "$downvotes"] } // Only return positively rated tags
        }).toArray();

        if (tracksWithTag.length === 0) {
            return res.status(404).send('No tracks found with this tag and positive votes.');
        }

        res.status(200).json(tracksWithTag);
    } catch (error) {
        console.error("Error retrieving tracks for tag:", error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
