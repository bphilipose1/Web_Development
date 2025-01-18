var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var albumRouter = require('./routes/album');
var artistRouter = require('./routes/artist');
var concertRouter = require('./routes/concert');
var trackRouter = require('./routes/track');

var app = express();

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
