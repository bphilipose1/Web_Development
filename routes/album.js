const express = require('express');
const router = express.Router();
const { artists } = require('./artist'); // Import artists array
const tracksRouter = require('./track'); // Import tracks router

const albums = [];
let nextAlbumID = 1;

/*Albums Structure
- albumID
- albumName
- releaseYear
- artistID
- albumGenre
- tracks
*/

// Utility functions to find an item by ID or Name
function findById(array, id) {
  return array.find(item => item.albumID === id);
}
function findByName(array, name) {
  return array.find(item => item.albumName === name);
}

// Add a new album (POST) 
router.post('/', (request, response) => {
  const { name: albumName, year: releaseYear, artist: artistID, genre: albumGenre } = request.body;
  console.log('Running [Add a new album (POST)]');
  console.log(albumName, releaseYear, artistID, albumGenre);
  // Check if the required information is provided
  if (!albumName || !releaseYear || !albumGenre) {
    response.status(400).send('Missing required information');
    return;
  }

  // Check if the album already exists
  if (findByName(albums, albumName)) {
    response.status(400).send('Album already exists');
    return;
  }

  // If artistID is provided, check if the artist exists
  if (artistID) {
    const artistExists = artists.find(artist => artist.artistID === artistID);
    if (!artistExists) {
      response.status(400).send('Invalid artistID');
      return;
    }
  }

  const newAlbum = { 
    albumID: nextAlbumID++, 
    albumName: albumName, 
    releaseYear: releaseYear, 
    artistID: artistID, 
    albumGenre: albumGenre, 
    tracks: [] 
  };
  albums.push(newAlbum);
  response.status(201).send(newAlbum);
});

// List all albums (GET)
router.get('/', (request, response) => {
  console.log('Running [List all albums (GET)]');
  response.send(albums);
});

// Get the details of a specific album (GET)
router.get('/:albumID', (request, response) => {
  const albumID = parseInt(request.params.albumID, 10);
  console.log(albumID);
  const album = findById(albums, albumID);

  if (album) {
    response.send(album);
  } else {
    response.status(404).send('Album not found');
  }
});

// Delete a specific album (DELETE)
router.delete('/:albumID', (request, response) => {
  const albumID = parseInt(request.params.albumID, 10);
  const albumIndex = findById(albums, albumID);

  if (albumIndex === -1) {
    response.status(404).send('Album not found');
    return;
  }

  const deletedAlbum = albums.splice(albumIndex, 1);
  response.status(200).send(deletedAlbum);
});

// Mount the tracks router under /albums/:albumId/tracks and send over the album object
router.use('/:albumID/tracks', (req, res, next) => {
  const album = findById(albums, parseInt(req.params.albumID, 10));
  if (!album) {
    return res.status(404).send('Album not found');
  }
  req.album = album;
  next();
}, tracksRouter);

module.exports = router;
