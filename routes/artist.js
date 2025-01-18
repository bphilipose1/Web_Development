const express = require('express');
const router = express.Router();

const artists = [];
let artistID = 1;

// Add a new artist (POST)
router.post('/', (request, response) => {
  const { name, biography, socialMediaLinks } = request.body;
  if (!name || !biography) { //socialMediaLinks is optional
    response.status(400).send('Missing required information');
    return;
  }
  const artistID = (artists.length || 0) + 1; //In case there are no tracks, start at 1
  const newArtist = { artistID, name, biography, socialMediaLinks };
  artists.push(newArtist);
  response.status(201).send(newArtist);
});

// List all artists (GET)
router.get('/', (request, response) => {
  response.send(artists);
});

// Update an artist's details (PATCH)
router.patch('/:artistId', (req, res) => {
  const artistId = parseInt(req.params.artistId, 10);
  const { name, biography, socialMediaLinks } = req.body;
  const artist = artists.find(artist => artist.artistID === artistId);
  if (!artist) {
    return res.status(404).send('Artist not found');
  }
  if (name) {
    artist.name = name;
  }
  if (biography) {
    artist.biography = biography;
  }
  if (socialMediaLinks) {
    artist.socialMediaLinks = socialMediaLinks;
  }
  res.status(200).json(artist);
});


module.exports = router;
