const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access albumId from parent


/*Tracks Structure
- trackID (unique identifier within an album)
- trackTitle
- trackDuration
- primaryArtist
*/

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
