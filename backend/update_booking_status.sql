-- Update bookings table to support checked_in status
-- The status field already exists, this is just documentation of valid values

-- Valid status values:
-- 'confirmed' - Booking is confirmed but user hasn't checked in yet
-- 'checked_in' - User has checked in at the event (entry confirmed)
-- 'cancelled' - Booking was cancelled

-- Add a check constraint if needed (optional)
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
-- ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
--   CHECK (status IN ('confirmed', 'checked_in', 'cancelled'));

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Add policy for admins to update booking status
CREATE POLICY IF NOT EXISTS "Admins can update bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
