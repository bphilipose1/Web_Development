async function runRequests() {
    try {
      // 1. Add new albums
      const albums = [
        { name: "Starboy", year: 2016, genre: "R&B" },
        { name: "DawnFM", year: 2022, genre: "Synthwave" },
        { name: "The College Dropout", year: 2004, genre: "Hip Hop" },
        { name: "My Beautiful Dark Twisted Fantasy", year: 2010, genre: "Hip Hop" },
        { name: "Kids See Ghosts", year: 2018, genre: "Hip Hop" }
      ];
  
      for (const album of albums) {
        const response = await fetch('http://localhost:3000/albums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(album)
        });
        const data = await response.json();
        console.log('Album Created:', data);
      }
  
      // 2. List all albums
      const albumsList = await fetch('http://localhost:3000/albums', { method: 'GET' });
      console.log('All Albums:', await albumsList.json());
  
      // 3. Get details of a specific album
      const albumDetails = await fetch('http://localhost:3000/albums/1', { method: 'GET' });
      console.log('Specific Album:', await albumDetails.json());
  
      // 4. Delete a specific album
      //await fetch('http://localhost:3000/albums/5', { method: 'DELETE' });
      //console.log('Album deleted successfully!');
  
      // 5. Add new tracks to albums
      const albumsWithTracks = [
        {
          albumID: 1, // Starboy
          tracks: [
            { title: "Starboy", duration: "3:50", primaryArtist: "The Weeknd" },
            { title: "Party Monster", duration: "4:09", primaryArtist: "The Weeknd" },
            { title: "False Alarm", duration: "3:40", primaryArtist: "The Weeknd" },
            { title: "Reminder", duration: "3:38", primaryArtist: "The Weeknd" },
            { title: "Secrets", duration: "4:25", primaryArtist: "The Weeknd" }
          ]
        },
        {
          albumID: 2, // DawnFM
          tracks: [
            { title: "Gasoline", duration: "3:32", primaryArtist: "The Weeknd" },
            { title: "How Do I Make You Love Me?", duration: "3:35", primaryArtist: "The Weeknd" },
            { title: "Take My Breath", duration: "5:39", primaryArtist: "The Weeknd" },
            { title: "Sacrifice", duration: "3:08", primaryArtist: "The Weeknd" },
            { title: "Out of Time", duration: "3:34", primaryArtist: "The Weeknd" }
          ]
        },
        {
          albumID: 3, // The College Dropout
          tracks: [
            { title: "We Don't Care", duration: "3:59", primaryArtist: "Kanye West" },
            { title: "All Falls Down", duration: "3:43", primaryArtist: "Kanye West" },
            { title: "Spaceship", duration: "5:24", primaryArtist: "Kanye West" },
            { title: "Jesus Walks", duration: "3:13", primaryArtist: "Kanye West" },
            { title: "Slow Jamz", duration: "5:16", primaryArtist: "Kanye West, Twista, Jamie Foxx" }
          ]
        },
        {
          albumID: 4, // My Beautiful Dark Twisted Fantasy
          tracks: [
            { title: "Dark Fantasy", duration: "4:40", primaryArtist: "Kanye West" },
            { title: "Gorgeous", duration: "5:57", primaryArtist: "Kanye West" },
            { title: "Power", duration: "4:52", primaryArtist: "Kanye West" },
            { title: "All of the Lights", duration: "4:59", primaryArtist: "Kanye West" },
            { title: "Monster", duration: "6:18", primaryArtist: "Kanye West, Jay-Z, Nicki Minaj" }
          ]
        },
        {
          albumID: 5, // Kids See Ghosts
          tracks: [
            { title: "Feel the Love", duration: "2:44", primaryArtist: "Kids See Ghosts" },
            { title: "Fire", duration: "2:20", primaryArtist: "Kids See Ghosts" },
            { title: "4th Dimension", duration: "2:33", primaryArtist: "Kids See Ghosts" },
            { title: "Freeee (Ghost Town, Pt. 2)", duration: "3:26", primaryArtist: "Kids See Ghosts" },
            { title: "Reborn", duration: "5:24", primaryArtist: "Kids See Ghosts" }
          ]
        }
      ];
  
      for (const album of albumsWithTracks) {
        for (const track of album.tracks) {
          const response = await fetch(`http://localhost:3000/albums/${album.albumID}/tracks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(track)
          });
          console.log(`Track added to album ID '${album.albumID}':`, await response.json());
        }
      }
  
      // 6. Get all tracks for an album
      const tracksResponse = await fetch(`http://localhost:3000/albums/1/tracks`, { method: 'GET' });
      console.log(`Tracks for album ID '1':`, await tracksResponse.json());
  
      // 7. Delete a track
      //await fetch(`http://localhost:3000/albums/1/tracks/1`, { method: 'DELETE' });
      //console.log('Track deleted successfully.');
  
      // 8. Add new artists
      const topRappers = [
        { name: "Kanye West", biography: "American rapper", socialMediaLinks: ["https://twitter.com/kanyewest"] },
        { name: "Drake", biography: "Canadian rapper", socialMediaLinks: ["https://twitter.com/Drake"] }
      ];
  
      for (const artist of topRappers) {
        const response = await fetch('http://localhost:3000/artists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(artist)
        });
        console.log(`Added artist:`, await response.json());
      }
  
      // 9. List all artists
      const artistsResponse = await fetch('http://localhost:3000/artists', { method: 'GET' });
      console.log('All artists:', await artistsResponse.json());
  
      // 10. Update an artist's name
      const updateArtist = await fetch('http://localhost:3000/artists/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Ye (Updated)" })
      });
      console.log('Updated artist:', await updateArtist.json());
  
      // 11. Add concerts
      const concerts = [
        { concertName: "StarboyTour", startTime: "2025-01-20T20:00:00Z", duration: "2:00", artist: "The Weeknd" },
        { concertName: "DondaExperience", startTime: "2025-04-10T19:00:00Z", duration: "2:30", artist: "Kanye West" }
      ];
  
      for (const concert of concerts) {
        const response = await fetch('http://localhost:3000/concerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(concert)
        });
        console.log(`Concert added successfully:`, await response.json());
      }
  
      // 12. Get concerts within a date range
      const minDate = "2025-02-01";
      const maxDate = "2025-12-31";
  
      const concertsInRange = await fetch(`http://localhost:3000/concerts?minDate=${minDate}&maxDate=${maxDate}`, { method: 'GET' });
      console.log(`Concerts between ${minDate} and ${maxDate}:`, await concertsInRange.json());
  
      // 13. Update concert start date
      const updateConcert = await fetch(`http://localhost:3000/concerts/StarboyTour`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: "2025-01-21T20:00:00Z" })
      });
      console.log(`Updated concert:`, await updateConcert.json());
  
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  // Run the function
  runRequests();
  