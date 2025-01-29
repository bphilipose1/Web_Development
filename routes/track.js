const express = require('express');
const connectToDatabase = require('../db');
const router = express.Router({ mergeParams: true }); // Merge params to access albumId from parent


/*Tracks Structure
- trackID (unique identifier within an album)
- trackTitle
- trackDuration
- primaryArtist
*/

// Middleware to ensure authentication for ability to add tags
function ensureAuthenticated(req, res, next) {
  if (req.oidc.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized');
}

// Add a tag to a specific track (POST)
router.post('/:trackId/tags', ensureAuthenticated, async (req, res) => {
  const { trackId } = req.params;
  const { tag } = req.body;

  if (!tag) {
    return res.status(400).send('Missing required information (tag).');
  }
  const db = await connectToDatabase();
  
  const playlist = await playlists.findOne({
    'tracks.trackID': parseInt(trackId, 10),
  });

  if (!playlist) {
    return res.status(404).send('Track not found.');
  }

  const track = playlist.tracks.find((t) => t.trackID === parseInt(trackId, 10));
  track.tags = track.tags || [];
  track.tags.push({ tag, upvotes: 0, downvotes: 0 });

  // Update the track in the database
  await playlists.updateOne(
    { _id: playlist._id },
    { $set: { tracks: playlist.tracks } }
  );

  res.status(200).send(track);
});

// Upvote  or Downvote a tag for a specific track (POST)
router.patch('/:trackId/tags/:tagId', ensureAuthenticated, async (req, res) => {
  const { trackId, tagName } = req.params;
  const { vote } = req.body;

  if (!vote || (vote !== 'upvote' && vote !== 'downvote')) {
    return res.status(400).send('Invalid vote. Use upvote or downvote.');
  }

  const db = await connectToDatabase();
  const playlists = db.collection('playlists');

  // Find the playlist containing the track
  const playlist = await playlists.findOne({'tracks.trackID': parseInt(trackId, 10)});

  if (!playlist) {
    return res.status(404).send('Track not found.');
  }

  const track = playlist.tracks.fint((t) => t.trackID === parseInt(trackId, 10));
  const tag = track.tags.find((t) => t.tag === tagName);

  if (!tag) {
    return res.status(404).send('Tag not found.');
  }

  // Update the tag's votes
  if (vote === 'upvote') {
    tag.upvotes++;
  } else {
    tag.downvotes++;
  }

  //put the updated track back into the playlist
  await playlists.updateOne(
    { _id: playlist._id },
    { $set: { tracks: playlist.tracks } }
  );

  res.status(200).send(tag);
})

// Add a new track to a specific album (POST)
router.post('/', (req, res) => {
  const { title, duration, primaryArtist } = req.body;

  //check if required information is provided
  if (!title || !duration || !primaryArtist) {
    return res.status(400).send('Missing required track information');
  }

  //validate duration format (e.g., mm:ss)
  const durationRegex = /^\d{1,2}:\d{2}$/;
  if (!durationRegex.test(duration)) {
    return res.status(400).send('Invalid duration format. Use mm:ss.');
  }


  //check if the track already exists
  if (req.album.tracks.find(track => track.trackTitle === title)) {
    return res.status(400).send('Track already exists');
  }

  const trackID = (req.album.tracks?.length || 0) + 1; //In case there are no tracks, start at 1
  const newTrack = { trackID, trackTitle: title, trackDuration: duration, primaryArtist };
  req.album.tracks.push(newTrack);

  res.status(201).send(newTrack);
});

// Get all tracks for a specific album (GET)
router.get('/', (req, res) => {
  res.status(200).send(req.album.tracks);
});

// Delete a specific track from an album (DELETE)
router.delete('/:trackId', (req, res) => {
  const trackId = parseInt(req.params.trackId, 10);
  const trackIndex = req.album.tracks.findIndex(track => track.trackID === trackId);

  if (trackIndex === -1) {
    return res.status(404).send('Track not found');
  }

  const deletedTrack = req.album.tracks.splice(trackIndex, 1)[0];
  res.status(200).send(deletedTrack);
});

module.exports = router;
