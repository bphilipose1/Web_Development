var express = require('express'); //import express from 'express'
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index'); // import indexRouter from './routes/index'
var usersRouter = require('./routes/users');

// this object lets us build our server
var app = express(); //const app = new Express()

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const albums = []
const artists = []
const concert = []
let albumID = 1
let trackID = 1
let artistID = 1
let concertID = 1

//find item by id
function findById(array, id) {
    return array.find(item => item.id === id)
}



//ALBUM FUUNCTIONALITY

//Add a new album (POST)
app.post('/albums', (request, response) => {
    const {name, year, artistId} = request.body
    if (!name || !year || !artistId) { //Ensure that all necessary feilds are provided
        response.status(400).send('Missing required information')
        return
    }
    const newAlbum = {id: albumID++, name, year, artistId}
    albums.push(newAlbum)
    response.status(201).send(newAlbum)
})

//List all albums (GET)
app.get('/albums', (request, response) => {
    response.send(albums)
})

//get the details of a specific album (GET)
app.get('/albums/:albumId', (request, response) => {
    const albumId = parseInt(request.params.albumId)
    const album = findById(albums, albumId)
    if (album) {
        response.send(album)
    } else {
        response.status(404).send('Album not found')
    }
})

//delete a specific album (and all of its associated tracks) (DELETE)
app.delete('/albums/:albumId', (request, response) => {
    const albumId = parseInt(request.params.albumId)
    const albumIndex = albums.findIndex(album => album.id === albumId)
    if (albumIndex !== -1)
        return res.status(404).send('Album not found')
    
    albums.splice(albumIndex, 1)
    response.status(204).send()
})



//TRACK FUNCTIONALITY

//Add a new track to a specific album (POST)
app.post("/albums/:id/tracks", (req, res) => {
    const album = findById(albums, parseInt(req.params.id))

    if (!album) {
        return res.status(404).send("Album not found.")
    }
  
    const { trackNumber, title, duration, primaryArtist } = req.body;

    if (!trackNumber || !title || !duration || !primaryArtist) {
        return res.status(400).send("Missing required information.")
    }

    const newTrack = { id: trackID++, trackNumber, title, duration, primaryArtist }

    album.tracks.push(newTrack)
    
    res.status(201).json(newTrack)
  
});

//Get the details all of the tracks for a specific album (GET)
app.get('/albums/:id/tracks', (request, response) => {
    const albumId = parseInt(request.params.id)
    const album = findById(albums, albumId)
    if (!album) {
        response.status(404).send('Album not found')
        return
    }
    response.send(album.tracks)
})

//Delete a specific track (DELETE)
app.delete('/albums/:albumId/tracks/:trackId', (request, response) => {
    const albumId = parseInt(request.params.albumId)
    const trackId = parseInt(request.params.trackId)
    const album = findById(albums, albumId)
    if (!album) {
        response.status(404).send('Album not found')
        return
    }
    const trackIndex = album.tracks.findIndex(track => track.id === trackId)
    if (trackIndex === -1) {
        response.status(404).send('Track not found')
        return
    }
    album.tracks.splice(trackIndex, 1)
    response.status(204).send()
})


//ARTIST FUNCTIONALITY

//Add a new artist (POST)
app.post('/artists', (request, response) => {
    const {name, biography, socialMediaLinks} = request.body
    if (!name || !biography || !socialMediaLinks) {
        response.status(400).send('Missing required information')
        return
    }
    const newArtist = {id: artistID++, name, biography, socialMediaLinks}
    artists.push(newArtist)
    response.status(201).send(newArtist)
})

//List all artists (GET)

//Update a specific artist's name, biography, and/or social media links (PUT)



//CONCERT FUNCTIONALITY

//List all concerts within a time range (minimum and maximum start time/date) (GET)

//Change the start date/time of a specific concert (PUT)








app.use('/', indexRouter);
app.use('/users', usersRouter);

function greetUser(request, response) {
  response.send('Hello, user! This is a shitty greeting.');
}
app.get('/greet', (req, res) => { res.send('Hello, user!')});

const courses = [
    {id: 1, number: 4750, department: 'CPSC', title: 'Web Development'},
    {id: 2, number: 5250, department: 'CPSC', title: 'Mobile App Development'}
]

app.get('/courses', (request, response) => {
    
    //Sends back formatted as JavaScript Object Notation (JSON)
    response.send(courses)
})
app.get('/courses/:courseId', (request, response) => {
    const courseId = parseInt(request.params.courseId)
    const course = courses.find(course => course.id === courseId)
    if (course) {
        response.send(course)
    } else {
        response.status(404).send('Course not found')
    }
})
app.get('/courses/:courseId/pages')
app.get('/courses/:courseId/pages/:pageName')



module.exports = app;
