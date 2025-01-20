const express = require('express');
const router = express.Router();

const artists = [];
let artistID = 1;

/*Artist Structure:
- artistID
- name
- biography
- socialMediaLinks (optional)
*/

// Add a new artist (POST)
router.post('/', (request, response) => {
  const { name, biography, socialMediaLinks } = request.body;
  if (!name || !biography) { // socialMediaLinks is optional
    response.status(400).send('Missing required information');
    return;
  }

  //Check if the artist already exists
  const existingArtist = artists.find(artist => artist.name === name);
  if (existingArtist) {
    response.status(400).send('Artist already exists');
    return;
  }


  const newArtist = { artistID, name, biography, socialMediaLinks };
  artists.push(newArtist);
  artistID++; 
  response.status(201).send(newArtist);
});

// List all artists (GET)
router.get('/', (request, response) => {
  response.status(200).send(artists);
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
