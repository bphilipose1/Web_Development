const express = require('express');
const router = express.Router();
const { artists } = require('./artist'); //import artists array
const tracksRouter = require('./track'); //import tracks router

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

//utility functions to find an item by ID or Name and return the object
function findById(id) {
  return albums.find(item => item.albumID === id);
}
function findByName(name) {
  return albums.find(item => item.albumName === name);
}

// Add a new album (POST) 
router.post('/', (request, response) => {
  const { name: albumName, year: releaseYear, artist: artistID, genre: albumGenre } = request.body;
  //check if the required information is provided
  if (!albumName || !releaseYear || !albumGenre) {
    response.status(400).send('Missing required information');
    return;
  }

  //check if the album already exists
  if (findByName(albumName)) {
    response.status(400).send('Album already exists');
    return;
  }

  //if artistID is provided, check if the artist exists
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
  response.status(200).send(albums);
});

// Get the details of a specific album (GET)
router.get('/:albumID', (request, response) => {
  const albumID = parseInt(request.params.albumID, 10);
  const album = findById(albumID);

  if (album) {
    response.status(200).send(album);
  } else {
    response.status(404).send('Album not found');
  }
});

// Delete a specific album (DELETE)
router.delete('/:albumID', (request, response) => {
  const albumID = parseInt(request.params.albumID, 10);


  const albumIndex = albums.findIndex(album => album.albumID === albumID);

  if (albumIndex === -1) {
    response.status(404).send('Album not found');
    return;
  }


  const deletedAlbum = albums.splice(albumIndex, 1);
  response.status(200).send(deletedAlbum);
});

// if the album exists, pass the album object to the tracksRouter
router.use('/:albumID/tracks', (req, res, next) => {
  const album = findById(parseInt(req.params.albumID, 10));
  if (!album) {
    return res.status(404).send('Album not found');
  }
  req.album = album;
  next();
}, tracksRouter);

module.exports = router;
