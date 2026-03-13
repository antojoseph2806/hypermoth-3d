import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const EVENT_METADATA_FILE = path.join(DATA_DIR, 'event-metadata.json');

const normalizeArtistImages = (images) =>
  Array.isArray(images)
    ? images.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean)
    : [];

const normalizeReviews = (reviews) =>
  Array.isArray(reviews)
    ? reviews.map((r) => ({
        reviewer: typeof r.reviewer === 'string' ? r.reviewer.trim() : 'Anonymous',
        text: typeof r.text === 'string' ? r.text.trim() : '',
        rating: typeof r.rating === 'number' ? Math.min(5, Math.max(0, r.rating)) : 0,
      })).filter((r) => r.text)
    : [];

const normalizeArtist = (artist = {}) => ({
  name: typeof artist.name === 'string' ? artist.name.trim() : '',
  image_url: typeof artist.image_url === 'string' ? artist.image_url.trim() : '',
  specialization: typeof artist.specialization === 'string' ? artist.specialization.trim() : '',
  bio: typeof artist.bio === 'string' ? artist.bio.trim() : '',
  band_name: typeof artist.band_name === 'string' ? artist.band_name.trim() : '',
  instagram_id: typeof artist.instagram_id === 'string' ? artist.instagram_id.trim() : '',
  spotify_id: typeof artist.spotify_id === 'string' ? artist.spotify_id.trim() : '',
  artist_images: normalizeArtistImages(artist.artist_images),
  reviews: normalizeReviews(artist.reviews),
});

const normalizeGalleryImages = (galleryImages) =>
  Array.isArray(galleryImages)
    ? galleryImages
        .map((imageUrl) => (typeof imageUrl === 'string' ? imageUrl.trim() : ''))
        .filter(Boolean)
    : [];

const normalizePreferredDates = (preferredDates) =>
  Array.isArray(preferredDates)
    ? preferredDates
        .map((dateValue) => (typeof dateValue === 'string' ? dateValue.trim() : ''))
        .filter(Boolean)
    : [];

export const readEventMetadataStore = async () => {
  try {
    const fileContents = await readFile(EVENT_METADATA_FILE, 'utf8');
    const parsed = JSON.parse(fileContents);

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
};

export const readEventMetadata = async (eventId) => {
  const store = await readEventMetadataStore();
  const metadata = store[eventId];

  if (!metadata || typeof metadata !== 'object') {
    return {
      artists: [],
      gallery_images: [],
      preferred_dates: [],
    };
  }

  return {
    artists: Array.isArray(metadata.artists) ? metadata.artists.map(normalizeArtist) : [],
    gallery_images: normalizeGalleryImages(metadata.gallery_images),
    preferred_dates: normalizePreferredDates(metadata.preferred_dates),
  };
};

export const writeEventMetadata = async (eventId, metadata = {}) => {
  await mkdir(DATA_DIR, { recursive: true });

  const store = await readEventMetadataStore();
  store[eventId] = {
    artists: Array.isArray(metadata.artists) ? metadata.artists.map(normalizeArtist) : [],
    gallery_images: normalizeGalleryImages(metadata.gallery_images),
    preferred_dates: normalizePreferredDates(metadata.preferred_dates),
    updated_at: new Date().toISOString(),
  };

  await writeFile(EVENT_METADATA_FILE, JSON.stringify(store, null, 2), 'utf8');

  return store[eventId];
};

export const deleteEventMetadata = async (eventId) => {
  await mkdir(DATA_DIR, { recursive: true });

  const store = await readEventMetadataStore();

  if (store[eventId]) {
    delete store[eventId];
    await writeFile(EVENT_METADATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  }
};
