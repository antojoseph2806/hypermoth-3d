import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Instagram, Music } from "lucide-react";
import { API_URL } from "@/config/api";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

interface ArtistEvent {
  event_id: string | number;
  title: string;
  date: string | null;
}

interface ArtistReview {
  id?: string | number;
  author?: string;
  content?: string;
  rating?: number;
}

interface Artist {
  key: string;
  name: string;
  image_url: string;
  specialization: string;
  bio: string;
  band_name?: string;
  instagram_id?: string;
  spotify_id?: string;
  artist_images?: string[];
  reviews?: ArtistReview[];
  event_count: number;
  events: ArtistEvent[];
}

const Artist = () => {
  const { artistKey } = useParams<{ artistKey: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistKey) {
      setError("Invalid artist key");
      setLoading(false);
      return;
    }

    const fetchArtist = async () => {
      try {
        const response = await fetch(`${API_URL}/api/artists/${encodeURIComponent(artistKey)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Artist not found");
          } else {
            setError("Failed to load artist");
          }
          return;
        }

        const data = await response.json();
        setArtist(data);
      } catch (err) {
        setError("Failed to load artist");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistKey]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEventClick = (eventId: string | number) => {
    navigate(`/?event=${encodeURIComponent(String(eventId))}&book=0#events`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 rounded-sm bg-muted/60" />
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Skeleton className="h-[400px] w-full rounded-sm bg-muted/60 mb-6" />
              <Skeleton className="h-12 w-3/4 rounded-sm bg-muted/60 mb-4" />
              <Skeleton className="h-6 w-1/2 rounded-sm bg-muted/50 mb-6" />
              <Skeleton className="h-32 w-full rounded-sm bg-muted/50" />
            </div>
            <div>
              <Skeleton className="h-8 w-48 rounded-sm bg-muted/60 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-sm bg-muted/50" />
                <Skeleton className="h-20 w-full rounded-sm bg-muted/50" />
                <Skeleton className="h-20 w-full rounded-sm bg-muted/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">{error || "Artist Not Found"}</h1>
          <button
            onClick={() => navigate("/")}
            className="border border-primary/50 bg-primary/10 px-8 py-3 text-xs tracking-[0.2em] uppercase font-body text-foreground hover:border-primary hover:bg-primary hover:text-background transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const upcomingEvents = artist.events
    .filter((e) => e.date && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  const pastEvents = artist.events
    .filter((e) => !e.date || new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 h-10 px-5 border border-border text-xs tracking-[0.2em] uppercase font-body text-foreground/90 inline-flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Artist Image */}
          <div>
            <div className="relative aspect-square overflow-hidden border border-border/40 bg-surface-elevated">
              {artist.image_url ? (
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-background">
                  <Music className="w-32 h-32 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40" />
            </div>
          </div>

          {/* Artist Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-[0.26em] uppercase text-muted-foreground font-body mb-3">
              Featured Artist
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4 uppercase">
              {artist.name}
            </h1>
            
            {artist.specialization && (
              <p className="font-body text-sm uppercase tracking-[0.2em] text-primary/80 mb-6">
                {artist.specialization}
              </p>
            )}

            {artist.bio && (
              <div className="mb-8">
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-body mb-3">
                  About
                </h3>
                <p className="font-body text-sm leading-relaxed text-foreground/75">
                  {artist.bio}
                </p>
              </div>
            )}

            {/* Social Links */}
            {(artist.instagram_id || artist.spotify_id) && (
              <div className="mb-8">
                <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-body mb-3">
                  Connect
                </h3>
                <div className="flex gap-4">
                  {artist.instagram_id && (
                    <a
                      href={`https://instagram.com/${artist.instagram_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 w-12 border border-border/40 bg-surface-elevated/30 inline-flex items-center justify-center text-foreground/70 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {artist.spotify_id && (
                    <a
                      href={`https://open.spotify.com/artist/${artist.spotify_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 w-12 border border-border/40 bg-surface-elevated/30 inline-flex items-center justify-center text-foreground/70 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Music className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="font-display text-3xl text-foreground">{artist.event_count}</p>
                <p className="font-body text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  Events
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-3xl text-foreground mb-6 uppercase">
              Upcoming Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <button
                  key={event.event_id}
                  onClick={() => handleEventClick(event.event_id)}
                  className="group text-left border border-border/40 bg-surface-elevated/30 overflow-hidden hover:border-primary/60 transition-colors"
                >
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors uppercase mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(event.date)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="font-display text-3xl text-foreground mb-6 uppercase">
              Past Events
            </h2>
            <div className="space-y-3">
              {pastEvents.map((event) => (
                <div
                  key={event.event_id}
                  className="flex items-center justify-between border border-border/30 bg-surface-elevated/20 p-4"
                >
                  <div>
                    <p className="font-display text-lg text-foreground uppercase">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body tracking-wider mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(event.date)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEventClick(event.event_id)}
                    className="h-10 px-5 border border-border/50 text-xs tracking-[0.2em] uppercase font-body text-foreground/70 hover:border-primary hover:text-primary transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {artist.artist_images && artist.artist_images.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl text-foreground mb-6 uppercase">
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artist.artist_images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden border border-border/40 bg-surface-elevated/30"
                >
                  <img
                    src={imageUrl}
                    alt={`${artist.name} gallery ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artist;
