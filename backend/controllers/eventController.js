import { supabase } from '../config/database.js';
import { deleteEventMetadata, readEventMetadata, writeEventMetadata } from '../services/eventMetadataStore.js';

const uploadFileToBucket = async (file, folder = 'events') => {
  const fileExtension = file.originalname.split('.').pop() || 'jpg';
  const sanitizedFileName = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
  const filePath = `${folder}/${sanitizedFileName}`;

  const { error } = await supabase.storage
    .from('event-images')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('event-images').getPublicUrl(filePath);
  return data.publicUrl;
};

export const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) throw error;

    const eventsWithMetadata = await Promise.all(
      (data || []).map(async (event) => {
        const metadata = await readEventMetadata(event.id);
        return {
          ...event,
          artists: metadata.artists,
          gallery_images: metadata.gallery_images,
          preferred_dates: metadata.preferred_dates,
        };
      }),
    );

    res.json({ events: eventsWithMetadata });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.event_id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ detail: 'Event not found' });
    }

    const metadata = await readEventMetadata(data.id);
    res.json({
      ...data,
      artists: metadata.artists,
      gallery_images: metadata.gallery_images,
      preferred_dates: metadata.preferred_dates,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      artists = [],
      gallery_images = [],
      preferred_dates = [],
      ...incomingEvent
    } = req.body || {};

    const eventPayload = {
      title: incomingEvent.title,
      description: incomingEvent.description || '',
      date: incomingEvent.date,
      location: incomingEvent.location,
      price: incomingEvent.price,
      capacity: incomingEvent.capacity,
      image_url: incomingEvent.image_url || '',
      created_by: req.user?.id || null,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([eventPayload])
      .select()
      .single();
    
    if (error) throw error;
    const eventMetadata = await writeEventMetadata(data.id, {
      artists,
      gallery_images,
      preferred_dates,
    });

    res.status(201).json({
      ...data,
      artists: eventMetadata.artists,
      gallery_images: eventMetadata.gallery_images,
      preferred_dates: eventMetadata.preferred_dates,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const {
      artists = [],
      gallery_images = [],
      preferred_dates = [],
      ...incomingEvent
    } = req.body || {};

    const eventPayload = {
      title: incomingEvent.title,
      description: incomingEvent.description || '',
      date: incomingEvent.date,
      location: incomingEvent.location,
      price: incomingEvent.price,
      capacity: incomingEvent.capacity,
      image_url: incomingEvent.image_url || '',
    };

    const { data, error } = await supabase
      .from('events')
      .update(eventPayload)
      .eq('id', req.params.event_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ detail: 'Event not found' });
    }

    const eventMetadata = await writeEventMetadata(data.id, {
      artists,
      gallery_images,
      preferred_dates,
    });

    res.json({
      ...data,
      artists: eventMetadata.artists,
      gallery_images: eventMetadata.gallery_images,
      preferred_dates: eventMetadata.preferred_dates,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.event_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ detail: 'Event not found' });
    }

    await deleteEventMetadata(req.params.event_id);

    res.json({ success: true, event: data });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const uploadEventMedia = async (req, res) => {
  try {
    if (!Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ detail: 'At least one image file is required' });
    }

    const requestedFolder =
      typeof req.body?.folder === 'string' && req.body.folder.trim()
        ? req.body.folder.trim()
        : 'events';

    const safeFolder = requestedFolder.replace(/[^a-zA-Z0-9-_]/g, '') || 'events';
    const imageUrls = await Promise.all(
      req.files.map((file) => uploadFileToBucket(file, safeFolder)),
    );

    res.status(201).json({ image_urls: imageUrls });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
