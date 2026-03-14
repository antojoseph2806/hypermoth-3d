import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Instagram, Music, Globe, Star } from "lucide-react";
import { API_URL } from "@/config/api";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

interface ArtistEvent {
  event_id: string | number;
  title: string;
  date: string | null;
  image_url?: string;
  location?: string;
}

interface ArtistReview {
  reviewer: string;
  text: string;
  rating: number;
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
  website_url?: string;
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-5 border border-border text-xs tracking-[0.2em] uppercase font-body text-foreground/90 inline-flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="font-display text-2xl text-foreground uppercase tracking-widest">Artist</h2>
        </div>

        {/* Artist Hero Section */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 mb-20">
          <div className="md:col-span-5">
            <div className="relative aspect-square overflow-hidden border border-border/40 bg-surface-elevated group">
              {artist.image_url ? (
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-background">
                  <Music className="w-32 h-32 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/60" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/60" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/60" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/60" />
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-4 uppercase leading-none font-bold">
              {artist.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-8">
              {artist.specialization && (
                <span className="font-body text-sm uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 border border-primary/30">
                  {artist.specialization}
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-border" />
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="text-foreground font-semibold">{artist.event_count}</span> Events
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href={`https://instagram.com/${artist.instagram_id || 'hypermoth'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 border border-border/40 bg-surface-elevated/30 inline-flex items-center justify-center text-foreground/70 hover:border-primary hover:text-primary transition-all hover:bg-primary/5 group"
                title="Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={artist.spotify_id ? `https://open.spotify.com/artist/${artist.spotify_id}` : "https://open.spotify.com/artist/06HL4zM2Sfv60P3BkZmi9X"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 border border-border/40 bg-surface-elevated/30 inline-flex items-center justify-center text-foreground/70 hover:border-primary hover:text-primary transition-all hover:bg-primary/5 group"
                title="Spotify"
              >
                <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              {artist.website_url && (
                <a
                  href={artist.website_url.startsWith('http') ? artist.website_url : `https://${artist.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-12 border border-border/40 bg-surface-elevated/30 inline-flex items-center justify-center text-foreground/70 hover:border-primary hover:text-primary transition-all hover:bg-primary/5 group"
                  title="Website"
                >
                  <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Artist Description Section */}
        {artist.bio && (
          <div className="mb-24 max-w-4xl">
            <h3 className="text-xs tracking-[0.3em] uppercase text-primary font-bold mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-primary/50" />
              Biography
            </h3>
            <div className="font-body text-lg leading-relaxed text-foreground/80 space-y-6">
              {artist.bio.split('\n').map((paragraph, i) => (
                paragraph.trim() && <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-4xl text-foreground uppercase">
                Upcoming Events
              </h2>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <div
                  key={event.event_id}
                  className="group relative border border-border/40 bg-surface-elevated/20 overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col h-full"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-background">
                        <Calendar className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60" />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors uppercase mb-4 line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {formatDate(event.date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
                          <MapPin className="w-4 h-4 text-primary/70" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleEventClick(event.event_id)}
                      className="w-full py-4 border border-primary/30 text-[11px] tracking-[0.25em] uppercase font-bold text-foreground hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-4xl text-foreground uppercase">
                Past Events
              </h2>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event.event_id}
                  className="group border border-border/30 bg-surface-elevated/10 overflow-hidden hover:border-primary/40 transition-all duration-500"
                >
                  <div className="aspect-square overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-surface-elevated">
                        <Calendar className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base text-foreground/90 uppercase mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-body">
                      {formatDate(event.date)}
                    </p>
                    {event.location && (
                      <p className="text-[10px] tracking-widest text-muted-foreground/70 uppercase font-body mt-1">
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {artist.reviews && artist.reviews.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-4xl text-foreground uppercase">
                Reviews
              </h2>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {artist.reviews.map((review, index) => (
                <div 
                  key={index}
                  className="p-8 border border-border/30 bg-surface-elevated/10 relative"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} 
                      />
                    ))}
                  </div>
                  <p className="font-body text-lg leading-relaxed text-foreground/90 mb-8 italic">
                    "{review.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {review.reviewer.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display text-sm uppercase tracking-wider text-foreground">
                        {review.reviewer}
                      </p>
                      <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                        Verified Fan
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {artist.artist_images && artist.artist_images.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-4xl text-foreground uppercase">
                Gallery
              </h2>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artist.artist_images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden border border-border/40 bg-surface-elevated/30 group cursor-pointer"
                >
                  <img
                    src={imageUrl}
                    alt={`${artist.name} gallery ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
