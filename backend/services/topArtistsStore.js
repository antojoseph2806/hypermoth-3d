import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const TOP_ARTISTS_FILE = path.join(DATA_DIR, 'top-artists.json');

const normalizeArtistKey = (artistKey) =>
  typeof artistKey === 'string' ? artistKey.trim().toLowerCase() : '';

export const getDefaultTopArtists = () => ({
  artist_keys: [],
  updated_at: null,
});

export const readTopArtists = async () => {
  try {
    const fileContents = await readFile(TOP_ARTISTS_FILE, 'utf8');
    const parsed = JSON.parse(fileContents);

    return {
      artist_keys: Array.isArray(parsed.artist_keys)
        ? parsed.artist_keys.map(normalizeArtistKey).filter(Boolean)
        : [],
      updated_at: parsed.updated_at || null,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return getDefaultTopArtists();
    }

    throw error;
  }
};

export const writeTopArtists = async (artistKeys) => {
  await mkdir(DATA_DIR, { recursive: true });

  const payload = {
    artist_keys: Array.from(
      new Set(
        (Array.isArray(artistKeys) ? artistKeys : [])
          .map(normalizeArtistKey)
          .filter(Boolean),
      ),
    ),
    updated_at: new Date().toISOString(),
  };

  await writeFile(TOP_ARTISTS_FILE, JSON.stringify(payload, null, 2), 'utf8');

  return payload;
};
