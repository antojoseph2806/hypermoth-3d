import { supabase } from '../config/database.js';
import { readEventMetadata } from '../services/eventMetadataStore.js';

const buildArtistKey = (name = '') =>
  typeof name === 'string' ? name.trim().toLowerCase() : '';

const getAvailableArtists = async () => {
  const { data, error } = await supabase.from('events').select('id,title,date');

  if (error) throw error;

  const artistMap = new Map();

  await Promise.all(
    (data || []).map(async (event) => {
      const metadata = await readEventMetadata(event.id);

      (metadata.artists || []).forEach((artist) => {
        const key = buildArtistKey(artist.name);
        if (!key) return;

        const existing = artistMap.get(key);

        if (existing) {
          // Merge extra fields if the existing entry is missing them
          if (!existing.image_url && artist.image_url) existing.image_url = artist.image_url;
          if (!existing.bio && artist.bio) existing.bio = artist.bio;
          if (!existing.band_name && artist.band_name) existing.band_name = artist.band_name;
          if (!existing.instagram_id && artist.instagram_id) existing.instagram_id = artist.instagram_id;
          if (!existing.spotify_id && artist.spotify_id) existing.spotify_id = artist.spotify_id;
          if ((!existing.artist_images || existing.artist_images.length === 0) && artist.artist_images?.length) {
            existing.artist_images = artist.artist_images;
          }
          if ((!existing.reviews || existing.reviews.length === 0) && artist.reviews?.length) {
            existing.reviews = artist.reviews;
          }
          if (
            typeof artist.specialization === 'string' &&
            artist.specialization.trim() &&
            (existing.specialization === 'Artist' || artist.specialization.trim().length > existing.specialization.length)
          ) {
            existing.specialization = artist.specialization.trim();
          }
          existing.event_count += 1;
          if (!existing.events.some((e) => e.event_id === event.id)) {
            existing.events.push({ event_id: event.id, title: event.title || 'Untitled', date: event.date || null });
          }
          return;
        }

        artistMap.set(key, {
          key,
          name: artist.name?.trim() || '',
          image_url: artist.image_url || '',
          specialization: artist.specialization?.trim() || 'Artist',
          bio: artist.bio || '',
          band_name: artist.band_name || '',
          instagram_id: artist.instagram_id || '',
          spotify_id: artist.spotify_id || '',
          artist_images: Array.isArray(artist.artist_images) ? artist.artist_images : [],
          reviews: Array.isArray(artist.reviews) ? artist.reviews : [],
          event_count: 1,
          events: [{ event_id: event.id, title: event.title || 'Untitled', date: event.date || null }],
        });
      });
    }),
  );

  return Array.from(artistMap.values());
};

export const getArtistByKey = async (req, res) => {
  try {
    const { artistKey } = req.params;

    if (!artistKey || typeof artistKey !== 'string') {
      return res.status(400).json({ detail: 'Invalid artist key.' });
    }

    const normalizedKey = decodeURIComponent(artistKey).trim().toLowerCase();
    const artists = await getAvailableArtists();
    const artist = artists.find((a) => a.key === normalizedKey);

    if (!artist) {
      return res.status(404).json({ detail: 'Artist not found.' });
    }

    res.json(artist);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
