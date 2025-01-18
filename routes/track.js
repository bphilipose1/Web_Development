const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access albumId from parent


//Each Track will have trackID, trackTitle, trackDuration, and primaryArtist

// Add a new track to a specific album (POST)
router.post('/', (req, res) => {
  const { title, duration, primaryArtist } = req.body;

  if (!title || !duration || !primaryArtist) {
    return res.status(400).send('Missing required track information');
  }

  const trackID = req.album.tracks.length + 1;
  const newTrack = { trackID, trackTitle: title, trackDuration: duration, primaryArtist };
  req.album.tracks.push(newTrack);

  res.status(201).json(newTrack);
});

// Get all tracks for a specific album (GET)
router.get('/', (req, res) => {
  res.status(200).json(req.album.tracks);
});

// Delete a specific track from an album (DELETE)
router.delete('/:trackId', (req, res) => {
  const trackId = parseInt(req.params.trackId, 10);
  const trackIndex = req.album.tracks.findIndex(track => track.trackID === trackId);

  if (trackIndex === -1) {
    return res.status(404).send('Track not found');
  }

  const deletedTrack = req.album.tracks.splice(trackIndex, 1);
  res.status(200).json(deletedTrack);
});

module.exports = router;
