const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { router: authRouter, authenticateToken } = require('./routes/auth');
const indexRouter = require('./routes/index');
const albumRouter = require('./routes/album');
const trackRouter = require('./routes/track');
const artistRouter = require('./routes/artist');
const concertRouter = require('./routes/concert');
const playlistRouter = require('./routes/playlist');

const app = express();

app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRouter);  // Use your own authentication
app.use('/', indexRouter);
app.use('/albums', albumRouter);
app.use('/artists', artistRouter);
app.use('/concerts', concertRouter);
app.use('/tracks', trackRouter);
app.use('/playlists', playlistRouter);

// Protected Route Example - Requires Login
app.get('/playlists', authenticateToken, (req, res) => {
    res.send(`User: ${req.user.username}`);
});

module.exports = app;
