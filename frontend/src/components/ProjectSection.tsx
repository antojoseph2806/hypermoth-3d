import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { API_URL } from "@/config/api";

type FeaturedArtist = {
  key: string;
  name: string;
  image_url: string;
  specialization: string;
  bio: string;
};

const AUTO_ADVANCE_MS = 4500;
const MOBILE_BREAKPOINT = 768;
const DESKTOP_CARD_SIZE = 280;
const MOBILE_CARD_SIZE = 188;
const DESKTOP_CARD_GAP = 40;
const MOBILE_CARD_GAP = 18;

const ArtistCard = ({
  artist,
  size,
  isActive,
  onClick,
}: {
  artist: FeaturedArtist;
  size: number;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-shrink-0 flex-col items-center text-center"
    style={{ width: size }}
  >
    <div
      className="relative overflow-hidden rounded-full border border-border/30 bg-background/20 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      style={{
        width: size,
        height: size,
        transform: isActive ? "scale(1)" : "scale(0.82)",
        opacity: isActive ? 1 : 0.42,
        transition: "transform 0.45s ease, opacity 0.45s ease",
      }}
    >
      {artist.image_url ? (
        <img
          src={artist.image_url}
          alt={artist.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-elevated to-background font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Artist Image
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
    </div>
    <div className="mt-5 max-w-[240px]">
      <p className="font-body text-[10px] uppercase tracking-[0.28em] text-foreground/55">
        Featured Artist
      </p>
      <h3 className="mt-3 font-display text-2xl leading-none text-foreground md:text-4xl">
        {artist.name}
      </h3>
      <p className="mt-3 font-body text-xs uppercase tracking-[0.2em] text-foreground/70 md:text-sm">
        {artist.specialization || "Artist"}
      </p>
    </div>
  </button>
);

const ProjectSection = () => {
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<number | null>(null);
  const pointerCurrentRef = useRef<number | null>(null);

  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const cardSize = isMobile ? MOBILE_CARD_SIZE : DESKTOP_CARD_SIZE;
  const cardGap = isMobile ? MOBILE_CARD_GAP : DESKTOP_CARD_GAP;
  const cardStep = cardSize + cardGap;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateViewportWidth = () => {
      setViewportWidth(node.clientWidth);
    };

    updateViewportWidth();

    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(node);
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchTopArtists = async (showLoadingState = true) => {
      if (showLoadingState) {
        setLoadingArtists(true);
      }

      try {
        const response = await fetch(`${API_URL}/api/events/top-artists`);
        const data = response.ok ? await response.json() : null;

        if (!cancelled) {
          setArtists(Array.isArray(data?.artists) ? data.artists : []);
        }
      } catch {
        if (!cancelled) {
          setArtists([]);
        }
      } finally {
        if (!cancelled && showLoadingState) {
          setLoadingArtists(false);
        }
      }
    };

    void fetchTopArtists();

    const handleTopArtistsRefresh = () => {
      void fetchTopArtists(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchTopArtists(false);
      }
    };

    window.addEventListener("focus", handleTopArtistsRefresh);
    window.addEventListener("storage", handleTopArtistsRefresh);
    window.addEventListener("top-artists-updated", handleTopArtistsRefresh as EventListener);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleTopArtistsRefresh);
      window.removeEventListener("storage", handleTopArtistsRefresh);
      window.removeEventListener("top-artists-updated", handleTopArtistsRefresh as EventListener);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (artists.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => (current >= artists.length ? 0 : current));
  }, [artists]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (artists.length === 0) {
        return 0;
      }

      return (current + 1) % artists.length;
    });
  }, [artists.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (artists.length === 0) {
        return 0;
      }

      return (current - 1 + artists.length) % artists.length;
    });
  }, [artists.length]);

  useEffect(() => {
    if (artists.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(goNext, AUTO_ADVANCE_MS);
    return () => window.clearInterval(intervalId);
  }, [artists.length, goNext]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = event.clientX;
    pointerCurrentRef.current = event.clientX;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current === null) return;
    pointerCurrentRef.current = event.clientX;
  };

  const handlePointerEnd = () => {
    if (pointerStartRef.current === null || pointerCurrentRef.current === null) {
      pointerStartRef.current = null;
      pointerCurrentRef.current = null;
      return;
    }

    const distance = pointerStartRef.current - pointerCurrentRef.current;

    if (Math.abs(distance) > 45) {
      if (distance > 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    pointerStartRef.current = null;
    pointerCurrentRef.current = null;
  };

  const activeArtist = useMemo(
    () => (artists.length > 0 ? artists[activeIndex] : null),
    [activeIndex, artists],
  );

  return (
    <section
      id="project"
      className="relative overflow-hidden bg-surface-dark px-6 py-32 md:px-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,55,55,0.12),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,55,55,0.08),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-muted-foreground"
            >
              Top Artists
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl text-foreground sm:text-7xl md:text-8xl"
            >
              Featured Artists
            </motion.h2>
          </div>
        </div>

        {loadingArtists ? (
          <div className="flex min-h-[360px] items-center justify-center border border-border/20 bg-background/20 md:min-h-[470px]">
            <div className="inline-flex items-center gap-3 font-body text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
              Loading artists
            </div>
          </div>
        ) : artists.length > 0 ? (
          <div
            className="touch-pan-y select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerLeave={handlePointerEnd}
          >
            <div
              ref={viewportRef}
              className="relative min-h-[360px] overflow-hidden md:min-h-[470px]"
            >
              <div className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface-dark to-transparent md:w-20" />
              <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface-dark to-transparent md:w-20" />

              <div className="relative flex min-h-[360px] items-start justify-center md:min-h-[470px]">
                <div
                  className="flex items-start"
                  style={{
                    gap: `${cardGap}px`,
                    transform: `translate3d(calc(50% - ${activeIndex * cardStep + cardSize / 2}px), 0, 0)`,
                    transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "transform",
                  }}
                >
                  {artists.map((artist, index) => (
                    <ArtistCard
                      key={artist.key}
                      artist={artist}
                      size={cardSize}
                      isActive={index === activeIndex}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              key={activeArtist?.key || "no-artist"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mx-auto mt-8 max-w-2xl text-center"
            >
              <p className="font-body text-sm leading-7 text-foreground/70">
                {activeArtist?.bio || "Selected top artists from the admin dashboard appear here."}
              </p>
            </motion.div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-12 w-12 items-center justify-center border border-border/40 text-foreground/80 transition-all duration-300 hover:border-primary hover:text-primary"
                aria-label="Previous artist"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Swipe or use arrows
              </span>
              <div className="ml-4 flex gap-2">
                {artists.map((artist, index) => (
                  <button
                    key={artist.key}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: index === activeIndex ? 28 : 8,
                      backgroundColor:
                        index === activeIndex
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground) / 0.35)",
                    }}
                    aria-label={`Go to artist ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goNext}
                className="flex h-12 w-12 items-center justify-center border border-border/40 text-foreground/80 transition-all duration-300 hover:border-primary hover:text-primary"
                aria-label="Next artist"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border/30 bg-background/20 p-10 text-center">
            <p className="font-body text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Top Artists
            </p>
            <p className="mt-4 font-body text-sm leading-7 text-foreground/70">
              No top artists have been selected yet. Choose artists from the admin dashboard to feature them here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectSection;
