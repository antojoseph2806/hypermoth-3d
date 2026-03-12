-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for homepage display)
CREATE POLICY "Artists are viewable by everyone"
    ON artists FOR SELECT
    USING (true);

-- Policy: Allow admins to insert artists
CREATE POLICY "Admins can insert artists"
    ON artists FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policy: Allow admins to update artists
CREATE POLICY "Admins can update artists"
    ON artists FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policy: Allow admins to delete artists
CREATE POLICY "Admins can delete artists"
    ON artists FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_artists_created_at ON artists(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artists_updated_at
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_artists_updated_at();
