import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const BOOKING_METADATA_FILE = path.join(DATA_DIR, 'booking-metadata.json');

const normalizePreferredDate = (preferredDate) =>
  typeof preferredDate === 'string' ? preferredDate.trim() : '';

const readBookingMetadataStore = async () => {
  try {
    const fileContents = await readFile(BOOKING_METADATA_FILE, 'utf8');
    const parsed = JSON.parse(fileContents);

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
};

export const readBookingMetadata = async (bookingId) => {
  const store = await readBookingMetadataStore();
  const metadata = store[bookingId];

  if (!metadata || typeof metadata !== 'object') {
    return {
      preferred_date: '',
    };
  }

  return {
    preferred_date: normalizePreferredDate(metadata.preferred_date),
  };
};

export const writeBookingMetadata = async (bookingId, metadata = {}) => {
  await mkdir(DATA_DIR, { recursive: true });

  const store = await readBookingMetadataStore();
  store[bookingId] = {
    preferred_date: normalizePreferredDate(metadata.preferred_date),
    updated_at: new Date().toISOString(),
  };

  await writeFile(BOOKING_METADATA_FILE, JSON.stringify(store, null, 2), 'utf8');

  return store[bookingId];
};
