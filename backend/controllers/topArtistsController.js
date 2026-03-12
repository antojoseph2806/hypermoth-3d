import { supabase } from '../config/database.js';
import { readEventMetadata } from '../services/eventMetadataStore.js';
import { readTopArtists, writeTopArtists } from '../services/topArtistsStore.js';

const buildArtistKey = (artist = {}) => {
  const normalizedName = typeof artist.name === 'string' ? artist.name.trim().toLowerCase() : '';
  return normalizedName;
};

const getAvailableArtists = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('id,title,date');

  if (error) {
    throw error;
  }

  const artistMap = new Map();

  await Promise.all(
    (data || []).map(async (event) => {
      const metadata = await readEventMetadata(event.id);

      (metadata.artists || []).forEach((artist) => {
        const key = buildArtistKey(artist);

        if (!key) {
          return;
        }

        const existingArtist = artistMap.get(key);

        if (existingArtist) {
          if (!existingArtist.image_url && typeof artist.image_url === 'string' && artist.image_url.trim()) {
            existingArtist.image_url = artist.image_url.trim();
          }
          if (
            typeof artist.specialization === 'string' &&
            artist.specialization.trim() &&
            (
              existingArtist.specialization === 'Artist' ||
              artist.specialization.trim().length > existingArtist.specialization.length
            )
          ) {
            existingArtist.specialization = artist.specialization.trim();
          }
          if (!existingArtist.bio && typeof artist.bio === 'string' && artist.bio.trim()) {
            existingArtist.bio = artist.bio.trim();
          }
          if (!existingArtist.events.some((existingEvent) => existingEvent.event_id === event.id)) {
            existingArtist.event_count += 1;
            existingArtist.events.push({
              event_id: event.id,
              title: event.title || 'Untitled Event',
              date: event.date || null,
            });
          }
          return;
        }

        artistMap.set(key, {
          key,
          name: typeof artist.name === 'string' ? artist.name.trim() : '',
          image_url: typeof artist.image_url === 'string' ? artist.image_url.trim() : '',
          specialization:
            typeof artist.specialization === 'string' && artist.specialization.trim()
              ? artist.specialization.trim()
              : 'Artist',
          bio: typeof artist.bio === 'string' ? artist.bio.trim() : '',
          event_count: 1,
          events: [
            {
              event_id: event.id,
              title: event.title || 'Untitled Event',
              date: event.date || null,
            },
          ],
        });
      });
    }),
  );

  return Array.from(artistMap.values()).sort((firstArtist, secondArtist) => {
    if (secondArtist.event_count !== firstArtist.event_count) {
      return secondArtist.event_count - firstArtist.event_count;
    }

    return firstArtist.name.localeCompare(secondArtist.name);
  });
};

const resolveSelectedArtists = (availableArtists, selectedArtistKeys) => {
  const availableArtistMap = new Map(availableArtists.map((artist) => [artist.key, artist]));
  const normalizedKeys = Array.from(new Set((selectedArtistKeys || []).filter(Boolean)));

  const selectedArtists = normalizedKeys
    .map((artistKey) => availableArtistMap.get(artistKey))
    .filter(Boolean);

  return {
    artist_keys: selectedArtists.map((artist) => artist.key),
    artists: selectedArtists,
  };
};

export const getTopArtistsAdmin = async (req, res) => {
  try {
    const [availableArtists, topArtistsConfig] = await Promise.all([
      getAvailableArtists(),
      readTopArtists(),
    ]);

    const selected = resolveSelectedArtists(availableArtists, topArtistsConfig.artist_keys);

    res.json({
      artists: availableArtists,
      selected_artist_keys: selected.artist_keys,
      updated_at: topArtistsConfig.updated_at,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const updateTopArtistsAdmin = async (req, res) => {
  try {
    const { artist_keys: artistKeys } = req.body || {};

    if (!Array.isArray(artistKeys)) {
      return res.status(400).json({ detail: 'artist_keys must be an array' });
    }

    const availableArtists = await getAvailableArtists();
    const availableKeys = new Set(availableArtists.map((artist) => artist.key));
    const sanitizedArtistKeys = Array.from(
      new Set(
        artistKeys
          .map((artistKey) => (typeof artistKey === 'string' ? artistKey.trim().toLowerCase() : ''))
          .filter((artistKey) => artistKey && availableKeys.has(artistKey)),
      ),
    );

    const updatedTopArtists = await writeTopArtists(sanitizedArtistKeys);
    const selected = resolveSelectedArtists(availableArtists, updatedTopArtists.artist_keys);

    res.json({
      artists: availableArtists,
      selected_artist_keys: selected.artist_keys,
      updated_at: updatedTopArtists.updated_at,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const getPublicTopArtists = async (req, res) => {
  try {
    const [availableArtists, topArtistsConfig] = await Promise.all([
      getAvailableArtists(),
      readTopArtists(),
    ]);

    const selected = resolveSelectedArtists(availableArtists, topArtistsConfig.artist_keys);

    res.json({
      artists: selected.artists,
      updated_at: topArtistsConfig.updated_at,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
