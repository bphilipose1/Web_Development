const express = require('express');
const router = express.Router();

const concerts = [];
let concertID = 1;

/*
Concerts:
- concertID
- concertName
- startTime (Date object)
- duration
- artist
- otherArtists (optional)
*/

// Utility function to find a concert by ID or Name
function findById(id) {
  return concerts.find(concert => concert.concertID === id);
}

function findByName(name) {
  return concerts.find(concert => concert.concertName === name);
}

// List all concerts within a time range IF PROVIDED (GET)
router.get('/', (req, res) => {
  const { minDate, maxDate } = req.query;

  if (!minDate || !maxDate) {
    return res.status(200).send(concerts);
  }

  // Convert the dates to Date objects
  const minDateObj = new Date(minDate);
  const maxDateObj = new Date(maxDate);

  // Validate the date format conversion was successful
  if (isNaN(minDateObj) || isNaN(maxDateObj)) {
    return res.status(400).send('Invalid date format. Use YYYY-MM-DD.');
  }

  // Filter concerts based on startTime
  const filteredConcerts = concerts.filter(concert => {
    const concertStartTime = new Date(concert.startTime);
    return concertStartTime >= minDateObj && concertStartTime <= maxDateObj;
  });

  res.status(200).send(filteredConcerts);
});

// Add a new concert (POST)
router.post('/', (req, res) => {
  const { concertName, startTime, duration, artist, otherArtists = [] } = req.body;

  // Validate required fields
  if (!concertName || !startTime || !duration || !artist) {
    return res.status(400).send('Missing required information.');
  }

  // Validate startTime format
  const startTimeObj = new Date(startTime);
  if (isNaN(startTimeObj)) {
    return res.status(400).send('Invalid startTime format. Use ISO 8601.');
  }

  // Check if concert already exists
  if (findByName(concertName)) {
    return res.status(400).send('Concert already exists.');
  }

  // Create and add new concert
  const newConcert = {
    concertID: concertID++,
    concertName,
    startTime: startTimeObj,
    duration,
    artist,
    otherArtists
  };
  concerts.push(newConcert);

  res.status(201).send(newConcert);
});

// Can change ONLY the start date/time of a specific concert (PATCH)
router.patch('/:concertName', (req, res) => {
  const concertName = req.params.concertName;
  const concert = findByName(concertName);

  if (!concert) {
    return res.status(404).send('Concert not found.');
  }

  const { startTime } = req.body;

  if (!startTime) {
    return res.status(400).send('Please provide startTime to update.');
  }

  const startTimeObj = new Date(startTime);
  if (isNaN(startTimeObj)) {
    return res.status(400).send('Invalid startTime format. Use ISO 8601.');
  }

  concert.startTime = startTimeObj;

  res.status(200).send(concert);
});

module.exports = router;
