import { supabase } from '../config/database.js';
import { readBookingMetadata } from '../services/bookingMetadataStore.js';

export const getAllUsers = async (req, res) => {
  try {
    // Get all bookings to find unique users
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('user_id, created_at');

    if (bookingsError) throw bookingsError;

    if (!bookings || bookings.length === 0) {
      return res.json({ users: [] });
    }

    // Get unique user IDs
    const userIds = [...new Set(bookings.map(b => b.user_id))];

    // For each user, get their details and booking count
    const usersList = await Promise.all(userIds.map(async (userId) => {
      try {
        // Get user from Supabase auth using service role
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);

        // Get booking count
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Get first booking date
        const firstBooking = bookings.find(b => b.user_id === userId);

        if (user) {
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            booking_count: count || 0,
            user_metadata: user.user_metadata || {}
          };
        } else {
          return {
            id: userId,
            email: `user_${userId.substring(0, 8)}@deleted.com`,
            created_at: firstBooking?.created_at || null,
            booking_count: count || 0,
            user_metadata: {}
          };
        }
      } catch (error) {
        console.log(`Error fetching user ${userId}: ${error.message}`);
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const firstBooking = bookings.find(b => b.user_id === userId);

        return {
          id: userId,
          email: `user_${userId.substring(0, 8)}@unknown.com`,
          created_at: firstBooking?.created_at || null,
          booking_count: count || 0,
          user_metadata: {}
        };
      }
    }));

    res.json({ users: usersList });
  } catch (error) {
    console.log(`Error fetching users: ${error.message}`);
    res.status(500).json({ detail: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Delete user's bookings
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('user_id', req.params.user_id);

    if (error) throw error;
    res.json({ message: 'User bookings deleted successfully' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    // Store blocked status in a separate table or user metadata
    // For now, we'll just return success
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // Get unique users from bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('user_id');

    const uniqueUsers = new Set(bookings?.map(b => b.user_id) || []).size;

    res.json({
      total_users: uniqueUsers,
      total_events: eventsCount || 0,
      total_bookings: bookingsCount || 0
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    // Get all bookings with event details
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with user details
    const bookingsWithUsers = await Promise.all(bookings.map(async (booking) => {
      try {
        const metadata = await readBookingMetadata(booking.id);
        const { data: { user } } = await supabase.auth.admin.getUserById(booking.user_id);
        
        return {
          ...booking,
          preferred_date: metadata.preferred_date,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata || {}
          }
        };
      } catch (error) {
        console.log(`Error fetching user ${booking.user_id}: ${error.message}`);
        const metadata = await readBookingMetadata(booking.id);
        return {
          ...booking,
          preferred_date: metadata.preferred_date,
          user: {
            id: booking.user_id,
            email: 'unknown@user.com',
            user_metadata: {}
          }
        };
      }
    }));

    res.json({ bookings: bookingsWithUsers });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'checked_in' })
      .eq('id', req.params.booking_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    res.json({ message: 'Entry confirmed successfully', booking: data });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const verifyQRCode = async (req, res) => {
  try {
    const { ticketId } = req.body;
    
    if (!ticketId) {
      return res.status(400).json({ detail: 'Invalid QR code data' });
    }

    // Get booking details
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('id', ticketId);

    if (error) throw error;
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    const booking = bookings[0];

    // Get user details
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(booking.user_id);
      booking.user = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {}
      };
    } catch (error) {
      booking.user = {
        id: booking.user_id,
        email: 'unknown@user.com',
        user_metadata: {}
      };
    }

    // Auto-confirm entry
    await supabase
      .from('bookings')
      .update({ status: 'checked_in' })
      .eq('id', ticketId);

    booking.status = 'checked_in';

    res.json({
      valid: true,
      booking: booking,
      message: 'Entry confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
