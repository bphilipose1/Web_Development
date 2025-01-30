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

// ✅ Add a tag to a track
router.post('/:albumId/:trackId', authenticateToken, async (req, res) => {
    try {
        const { albumId, trackId } = req.params;
        const { tag } = req.body;

        if (!tag) {
            return res.status(400).send('Missing tag information.');
        }

        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');

        // ✅ Check if tag already exists for this track
        const existingTag = await tagsCollection.findOne({ albumID: albumId, trackID: trackId, tag });

        if (existingTag) {
            return res.status(400).send('Tag already exists for this track.');
        }

        // ✅ Insert new tag reference
        const newTag = { albumID: albumId, trackID: trackId, tag, upvotes: 0, downvotes: 0 };
        await tagsCollection.insertOne(newTag);

        res.status(201).json(newTag);
    } catch (error) {
        console.error("Error adding tag:", error);
        res.status(500).send('Internal Server Error');
    }
});

// ✅ Upvote or downvote a tag
router.patch('/:albumId/:trackId/:tagName', authenticateToken, async (req, res) => {
    try {
        const { albumId, trackId, tagName } = req.params;
        const { vote } = req.body;

        if (!vote || (vote !== 'upvote' && vote !== 'downvote')) {
            return res.status(400).send('Invalid vote. Use upvote or downvote.');
        }

        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');

        // ✅ Find the tag for this album + track
        const tag = await tagsCollection.findOne({ albumID: albumId, trackID: trackId, tag: tagName });

        if (!tag) {
            return res.status(404).send('Tag not found.');
        }

        // ✅ Update the vote count
        const updateField = vote === 'upvote' ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };
        await tagsCollection.updateOne({ albumID: albumId, trackID: trackId, tag: tagName }, updateField);

        res.status(200).json({ message: `Tag ${vote}d successfully` });
    } catch (error) {
        console.error("Error voting on tag:", error);
        res.status(500).send('Internal Server Error');
    }
});

// ✅ Get all tags for a track
router.get('/:albumId/:trackId', async (req, res) => {
    try {
        const { albumId, trackId } = req.params;
        const db = await connectToDatabase();
        const tagsCollection = db.collection('tags');

        const trackTags = await tagsCollection.find({ albumID: albumId, trackID: trackId }).toArray();
        res.status(200).json(trackTags);
    } catch (error) {
        console.error("Error retrieving tags:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
