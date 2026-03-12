import { readHomepageShowcase, writeHomepageShowcase } from '../services/showcaseStore.js';
import { supabase } from '../config/database.js';

export const getHomepageShowcase = async (req, res) => {
  try {
    const showcase = await readHomepageShowcase();
    res.json(showcase);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const updateHomepageShowcase = async (req, res) => {
  try {
    const { slides } = req.body;

    if (!Array.isArray(slides) || slides.length !== 3) {
      return res.status(400).json({ detail: 'Exactly 3 showcase slides are required' });
    }

    const updatedShowcase = await writeHomepageShowcase(slides);
    res.json(updatedShowcase);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const uploadHomepageShowcaseImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'Image file is required' });
    }

    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const sanitizedFileName = `showcase-${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const filePath = `homepage-showcase/${sanitizedFileName}`;

    const { error } = await supabase.storage
      .from('event-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from('event-images').getPublicUrl(filePath);

    res.status(201).json({ image_url: data.publicUrl });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
