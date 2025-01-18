const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const albumRouter = require('./routes/album');
const trackRouter = require('./routes/track');
const artistRouter = require('./routes/artist');
const concertRouter = require('./routes/concert');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/albums', albumRouter);
app.use('/artists', artistRouter);
app.use('/concerts', concertRouter);
app.use('/tracks', trackRouter);

module.exports = app;
