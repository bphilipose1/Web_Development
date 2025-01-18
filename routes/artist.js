const express = require('express');
const router = express.Router();

const artists = [];
let artistID = 1;

// Add a new artist (POST)
router.post('/', (request, response) => {
  const { name, biography, socialMediaLinks } = request.body;
  if (!name || !biography || !socialMediaLinks) {
    response.status(400).send('Missing required information');
    return;
  }
  const newArtist = { id: artistID++, name, biography, socialMediaLinks };
  artists.push(newArtist);
  response.status(201).send(newArtist);
});

// List all artists (GET)
router.get('/', (request, response) => {
  response.send(artists);
});

module.exports = router;
