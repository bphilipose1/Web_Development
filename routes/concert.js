const express = require('express');
const router = express.Router();

const concerts = [];
let concertID = 1;

// List all concerts within a time range (GET)
router.get('/', (req, res) => {
  const { minDate, maxDate } = req.query;

  if (!minDate || !maxDate) {
    return res.status(400).send('Please provide both minDate and maxDate.');
  }

  const filteredConcerts = concerts.filter(
    concert =>
      new Date(concert.startTime) >= new Date(minDate) &&
      new Date(concert.startTime) <= new Date(maxDate)
  );

  res.send(filteredConcerts);
});

// Change the start date/time of a specific concert (PUT)
router.put('/:concertId', (req, res) => {
  const concertId = parseInt(req.params.concertId);
  const concert = concerts.find(concert => concert.id === concertId);

  if (!concert) {
    return res.status(404).send('Concert not found.');
  }

  const { startTime } = req.body;

  if (!startTime) {
    return res.status(400).send('Missing startTime.');
  }

  concert.startTime = startTime;
  res.status(200).send(concert);
});

module.exports = router;
