const express = require('express');
const router = express.Router();
const tracksRouter = require('./track'); // Import tracks router
const albums = [];

// Utility function to find an item by ID
function findByName(array, name) {
  return array.find(item => item.albumName === name);
}

// Add a new album (POST) 
router.post('/', (request, response) => {
  const { name: albumName, year: releaseYear, artist: artistID, genre: albumGenre } = request.body;
  if (!albumName || !releaseYear || !artistID || !albumGenre) {
    response.status(400).send('Missing required information');
    return;
  }
  if (findByName(albums, albumName)) {
    response.status(400).send('Album already exists');
    return;
  }
  const newAlbum = { albumName: albumName, releaseYear: releaseYear, artistID: artistID, albumGenre: albumGenre, tracks: [] };
  albums.push(newAlbum);
  response.status(201).send(newAlbum);
});

// List all albums (GET)
router.get('/', (request, response) => {
  console.log('Running [List all albums (GET)]');
  response.send(albums);
});

// Get the details of a specific album (GET)
router.get('/:albumName', (request, response) => {
  const albumName = request.params.albumName;

  console.log(albumName);
  const album = findByName(albums, albumName);

  if (album) {
    response.send(album);
  } else {
    response.status(404).send('Album not found');
  }
});

// Delete a specific album (DELETE)
router.delete('/:albumName', (request, response) => {
  const albumName = request.params.albumName;
  const albumIndex = albums.findIndex(album => album.albumName === albumName); //find the index of the album in the array
  if (albumIndex === -1) {
    response.status(404).send('Album not found');
    return;
  }
  albums.splice(albumIndex, 1); //remove the album from the array
  response.status(204).send();
});

// Mount the tracks router under /albums/:albumId/tracks and send over the album object
router.use('/:albumName/tracks', (req, res, next) => {
  const album = findByName(albums, req.params.albumName);
  if (!album) {
    return res.status(404).send('Album not found');
  }
  req.album = album;
  next();
}, tracksRouter);

module.exports = router;
