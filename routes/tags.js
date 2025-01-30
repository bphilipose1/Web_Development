

// Add a tag to a specific track (POST)
router.post('/:albumId/:trackId/tags', authenticateToken, async (req, res) => {
    try {
        const { albumId, trackId } = req.params;
        const { tag } = req.body;
  
        if (!tag) {
            return res.status(400).send('Missing tag information.');
        }
  
        const db = await connectToDatabase();
        const albums = db.collection('albums');
  
        // ✅ Find album containing the track
        const album = await albums.findOne({ _id: albumId, 'tracks.trackID': parseInt(trackId, 10) });
  
        if (!album) {
            return res.status(404).send('Album or track not found.');
        }
  
        // ✅ Find the track inside the album
        const track = album.tracks.find((t) => t.trackID === parseInt(trackId, 10));
  
        if (!track) {
            return res.status(404).send('Track not found.');
        }
  
        // ✅ Store the albumID and trackID when adding a tag
        track.tags = track.tags || [];
        track.tags.push({ tag, upvotes: 0, downvotes: 0, albumID: albumId, trackID: trackId });
  
        // ✅ Update the album in MongoDB
        await albums.updateOne(
            { _id: album._id },
            { $set: { tracks: album.tracks } }
        );
  
        res.status(200).send(track);
    } catch (error) {
        console.error("Error adding tag:", error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  
  // Upvote  or Downvote a tag for a specific track (POST)
  router.patch('/:trackId/tags/:tagId', ensureAuthenticated, async (req, res) => {
    const { trackId, tagName } = req.params;
    const { vote } = req.body;
  
    if (!vote || (vote !== 'upvote' && vote !== 'downvote')) {
      return res.status(400).send('Invalid vote. Use upvote or downvote.');
    }
  
    const db = await connectToDatabase();
    const playlists = db.collection('playlists');
  
    // Find the playlist containing the track
    const playlist = await playlists.findOne({'tracks.trackID': parseInt(trackId, 10)});
  
    if (!playlist) {
      return res.status(404).send('Track not found.');
    }
  
    const track = playlist.tracks.fint((t) => t.trackID === parseInt(trackId, 10));
    const tag = track.tags.find((t) => t.tag === tagName);
  
    if (!tag) {
      return res.status(404).send('Tag not found.');
    }
  
    // Update the tag's votes
    if (vote === 'upvote') {
      tag.upvotes++;
    } else {
      tag.downvotes++;
    }
  
    //put the updated track back into the playlist
    await playlists.updateOne(
      { _id: playlist._id },
      { $set: { tracks: playlist.tracks } }
    );
  
    res.status(200).send(tag);
  })
  