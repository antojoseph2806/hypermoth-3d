import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const SHOWCASE_FILE = path.join(DATA_DIR, 'homepage-showcase.json');

const createDefaultSlides = () => ([
  { id: 1, image_url: '', title: '', subtitle: '' },
  { id: 2, image_url: '', title: '', subtitle: '' },
  { id: 3, image_url: '', title: '', subtitle: '' },
]);

export const getDefaultShowcase = () => ({
  slides: createDefaultSlides(),
  updated_at: null,
});

export const readHomepageShowcase = async () => {
  try {
    const fileContents = await readFile(SHOWCASE_FILE, 'utf8');
    const parsed = JSON.parse(fileContents);

    if (!Array.isArray(parsed.slides)) {
      return getDefaultShowcase();
    }

    return {
      slides: createDefaultSlides().map((slide, index) => {
        const stored = parsed.slides[index] || {};

        return {
          id: slide.id,
          image_url: typeof stored.image_url === 'string' ? stored.image_url : '',
          title: typeof stored.title === 'string' ? stored.title : slide.title,
          subtitle: typeof stored.subtitle === 'string' ? stored.subtitle : slide.subtitle,
        };
      }),
      updated_at: parsed.updated_at || null,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return getDefaultShowcase();
    }

    throw error;
  }
};

export const writeHomepageShowcase = async (slides) => {
  await mkdir(DATA_DIR, { recursive: true });

  const payload = {
    slides: createDefaultSlides().map((slide, index) => {
      const incoming = slides[index] || {};

      return {
        id: slide.id,
        image_url: typeof incoming.image_url === 'string' ? incoming.image_url.trim() : '',
        title: typeof incoming.title === 'string' ? incoming.title.trim() : slide.title,
        subtitle: typeof incoming.subtitle === 'string' ? incoming.subtitle.trim() : slide.subtitle,
      };
    }),
    updated_at: new Date().toISOString(),
  };

  await writeFile(SHOWCASE_FILE, JSON.stringify(payload, null, 2), 'utf8');

  return payload;
};
