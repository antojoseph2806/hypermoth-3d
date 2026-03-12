import { supabase } from '../config/database.js';
import { readEventMetadata } from '../services/eventMetadataStore.js';
import { readBookingMetadata, writeBookingMetadata } from '../services/bookingMetadataStore.js';

export const getUserBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('user_id', req.user.sub);
    
    if (error) throw error;

    const bookingsWithMetadata = await Promise.all(
      (data || []).map(async (booking) => {
        const metadata = await readBookingMetadata(booking.id);

        return {
          ...booking,
          preferred_date: metadata.preferred_date,
        };
      }),
    );

    res.json({ bookings: bookingsWithMetadata });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { event_id, quantity, preferred_date: preferredDate } = req.body;

    const bookingQuantity = Number(quantity);

    if (!event_id) {
      return res.status(400).json({ detail: 'event_id is required' });
    }

    if (!Number.isInteger(bookingQuantity) || bookingQuantity <= 0) {
      return res.status(400).json({ detail: 'Please choose a valid ticket quantity' });
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError) throw eventError;
    if (!event) {
      return res.status(404).json({ detail: 'Event not found' });
    }

    const eventMetadata = await readEventMetadata(event_id);
    const allowedPreferredDates =
      Array.isArray(eventMetadata.preferred_dates) && eventMetadata.preferred_dates.length > 0
        ? eventMetadata.preferred_dates
        : [event.date].filter(Boolean);

    const sanitizedPreferredDate =
      typeof preferredDate === 'string' ? preferredDate.trim() : '';

    if (!sanitizedPreferredDate) {
      return res.status(400).json({ detail: 'Please choose a preferred date' });
    }

    if (!allowedPreferredDates.includes(sanitizedPreferredDate)) {
      return res.status(400).json({ detail: 'Selected preferred date is not available for this event' });
    }

    // Check if user already has a booking for this event
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', event_id);

    if (existingBooking && existingBooking.length > 0) {
      return res.status(400).json({ detail: 'You have already booked this event' });
    }

    // Create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId,
        event_id,
        quantity: bookingQuantity,
        total_price: Number(event.price || 0) * bookingQuantity,
      }])
      .select()
      .single();

    if (error) throw error;

    const bookingMetadata = await writeBookingMetadata(data.id, {
      preferred_date: sanitizedPreferredDate,
    });

    res.status(201).json({
      ...data,
      preferred_date: bookingMetadata.preferred_date,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
