const express = require('express');
const connectToDatabase = require('../db'); //import the connectToDatabase function from db.js
const { authenticateToken } = require('./auth'); //import the authenticateToken function from auth.js

const router = express.Router();

/* Tags Structure
- trackID (from Homework 1)
- albumID (from Homework 1)
- tag (string)
- upvotes (integer)
- downvotes (integer)
*/

// Add a tag to a track (POST)
router.post('/:albumId/:trackId', authenticateToken, async (req, res) => {
    try {
        const { albumId, trackId } = req.params; //used to identify the track
        let { tag } = req.body;

        if (!tag) {
            return res.status(400).send('Missing tag info.');
        }
        try{
            //convert tag and clean it up
            
            
            if (typeof tag !== 'string' || tag.length < 1) {
                return res.status(400).send('Bad tag info.');
            }
            tag = tag.toLowerCase().trim();

        }
        catch (e){
            return res.status(400).send('Bad tag info.');
        }

        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');

        //check if tag already exists for this track
        const existingTag = await tagsCollection.findOne({ albumID: albumId, trackID: trackId, tag });

        if (existingTag) {
            return res.status(400).send('Tag already exists for this track.');
        }

        //insert new tag reference
        const newTag = { albumID: albumId, 
            trackID: trackId, 
            tag, 
            upvotes: 0, 
            downvotes: 0,
            votedUsers: {}};
        await tagsCollection.insertOne(newTag);

        res.status(201).send(newTag);
    } catch (error) {
        console.error("Error in post tags", error);
        res.status(500).send('Internal Server Error');
    }
});

// Upvote or downvote a tag (PATCH)
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

        //find the tag for this album + track
        const tag = await tagsCollection.findOne({ albumID: albumId, 
            trackID: trackId, 
            tag: cleanedTagName });

        if (!tag) {
            return res.status(404).send('Tag not found.');
        }

        //check if uers is being tracked, then if the user has already voted on this tag
        if (tag.votedUsers && tag.votedUsers[user]) {
            return res.status(403).send('You already voted on this tag.');
        }

        const updateField = vote === 'upvote' 
            ? { $inc: { upvotes: 1 }, $set: { [`votedUsers.${user}`]: "upvote" } } //upvote, increment upvotes
            : { $inc: { downvotes: 1 }, $set: { [`votedUsers.${user}`]: "downvote" } }; // downvote, increment downvotes
        await tagsCollection.updateOne({ albumID: albumId, trackID: trackId, tag: cleanedTagName }, updateField);

        res.send(`Tag ${vote}d successfully`);
    } catch (error) {
        console.error("Error in patch tags", error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all tracks with more upvotes than downvotes for a specific tag (GET)
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

        res.send(tracksWithTag);
    } catch (error) {
        console.error("Error in get tags", error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
