import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import EventDetailsModal from "./EventDetailsModal";
import EventShowcaseStrip, { type ShowcaseSlide } from "./EventShowcaseStrip";
import AllEventsModal, { type Event } from "./AllEventsModal";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/config/api";

const DESKTOP_CARD_WIDTH = 320;
const DESKTOP_CARD_GAP = 40;
const MOBILE_CARD_GAP = 12;
const MOBILE_SIDE_PEEK = 68;
const MIN_MOBILE_CARD_WIDTH = 210;
const MOBILE_BREAKPOINT = 768;

const getCardMetrics = (containerWidth: number) => {
  if (containerWidth < MOBILE_BREAKPOINT) {
    const cardWidth = Math.round(
      Math.min(
        DESKTOP_CARD_WIDTH,
        Math.max(MIN_MOBILE_CARD_WIDTH, containerWidth - MOBILE_SIDE_PEEK * 2)
      )
    );

    return { cardWidth, cardGap: MOBILE_CARD_GAP };
  }

  return { cardWidth: DESKTOP_CARD_WIDTH, cardGap: DESKTOP_CARD_GAP };
};

const FeaturedEventCard = ({
  event,
  cardWidth,
  isActive,
  onClick,
}: {
  event: Event;
  cardWidth: number;
  isActive: boolean;
  onClick: () => void;
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 overflow-hidden border border-border/50 bg-surface-elevated text-left w-full"
      style={{
        width: cardWidth,
        height: 420,
        transform: isActive ? "scale(1)" : "scale(0.94)",
        opacity: isActive ? 1 : 0.75,
        transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
      }}
    >
      <div className="relative h-56 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
            <Calendar className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/40 to-transparent" />
        <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-primary/50" />
        <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-primary/50" />
      </div>
      <div className="p-6 space-y-3">
        <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors uppercase tracking-wide">
          {event.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body tracking-wider">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.location}
          </span>
        </div>
      </div>
    </button>
  );
};

const FeaturedEventCardSkeleton = ({ cardWidth }: { cardWidth: number }) => (
  <div
    className="relative flex-shrink-0 overflow-hidden border border-border/50 bg-surface-elevated w-full"
    style={{ width: cardWidth, height: 420 }}
  >
    <Skeleton className="h-56 w-full rounded-none bg-muted/60" />
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-11/12 rounded-sm bg-muted/60" />
      <Skeleton className="h-10 w-8/12 rounded-sm bg-muted/50" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-4 w-28 rounded-sm bg-muted/50" />
        <Skeleton className="h-4 w-32 rounded-sm bg-muted/40" />
      </div>
    </div>
  </div>
);

const EventsSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showcaseSlides, setShowcaseSlides] = useState<ShowcaseSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAllEventsOpen, setIsAllEventsOpen] = useState(false);
  const [startBookingMode, setStartBookingMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const hasDesktopDefaultedRef = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : DESKTOP_CARD_WIDTH * 2
  );

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data) => setEvents(data.events || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/events/showcase`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch showcase"))))
      .then((data) => {
        if (Array.isArray(data.slides)) {
          setShowcaseSlides(data.slides);
        }
      })
      .catch(() => {
        setShowcaseSlides([]);
      });
  }, []);

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  const allEvents = useMemo(
    () =>
      [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  const featuredCount = 5;
  const featuredEvents = useMemo(
    () => upcomingEvents.slice(0, featuredCount),
    [upcomingEvents]
  );

  const visibleShowcaseSlides = useMemo(
    () =>
      showcaseSlides.filter(
        (slide) => typeof slide.image_url === "string" && slide.image_url.trim().length > 0
      ),
    [showcaseSlides]
  );

  useEffect(() => {
    const el = carouselViewportRef.current;
    if (!el || featuredEvents.length === 0) return;

    const updateViewportWidth = () => {
      setViewportWidth(el.clientWidth);
    };

    updateViewportWidth();

    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(el);
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, [featuredEvents.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % Math.max(1, featuredEvents.length));
  }, [featuredEvents.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + Math.max(1, featuredEvents.length)) % Math.max(1, featuredEvents.length));
  }, [featuredEvents.length]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    touchEndRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartRef.current === null || touchEndRef.current === null) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [goNext, goPrev]);

  const { cardWidth, cardGap } = useMemo(() => getCardMetrics(viewportWidth), [viewportWidth]);
  const cardStep = cardWidth + cardGap;
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isMobile) return;

    // Keep swipe interactions for mobile only.
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    if (featuredEvents.length === 0) return;
    if (isMobile) return;
    if (hasDesktopDefaultedRef.current) return;

    setActiveIndex(Math.floor(featuredEvents.length / 2));
    hasDesktopDefaultedRef.current = true;
  }, [featuredEvents.length, isMobile]);

  const mobileCarouselEvents = useMemo(() => {
    if (featuredEvents.length === 0) return [];
    const lastIndex = featuredEvents.length - 1;
    const prevIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
    const nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;

    return [
      { event: featuredEvents[prevIndex], isActive: false, key: `prev-${featuredEvents[prevIndex].id}` },
      { event: featuredEvents[activeIndex], isActive: true, key: `active-${featuredEvents[activeIndex].id}` },
      { event: featuredEvents[nextIndex], isActive: false, key: `next-${featuredEvents[nextIndex].id}` },
    ];
  }, [featuredEvents, activeIndex]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setStartBookingMode(false);
    setIsDetailsOpen(true);
  };

  const handleAllEventClick = (event: Event) => {
    setIsAllEventsOpen(false);
    setTimeout(() => {
      setSelectedEvent(event);
      setStartBookingMode(false);
      setIsDetailsOpen(true);
    }, 300);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get("event");

    if (!eventId || events.length === 0) {
      return;
    }

    const matchedEvent = events.find((event) => String(event.id) === eventId);

    if (!matchedEvent) {
      return;
    }

    setSelectedEvent(matchedEvent);
    setStartBookingMode(searchParams.get("book") === "1");
    setIsDetailsOpen(true);
  }, [events, location.search]);

  const clearEventQueryParams = () => {
    if (!location.search.includes("event=") && !location.search.includes("book=")) {
      return;
    }

    navigate(
      {
        pathname: location.pathname,
        hash: location.hash,
      },
      { replace: true },
    );
  };

  if (loading) {
    return (
      <section id="events" className="relative py-32 px-6 md:px-16 bg-background overflow-x-clip md:overflow-hidden">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body">
                Upcoming Events
              </p>
              <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-foreground">
                Our Events
              </h2>
            </div>
          </div>
          <div className="relative min-h-[460px] flex items-center justify-center">
            <div className="hidden md:flex items-center px-6 md:px-0" style={{ gap: `${DESKTOP_CARD_GAP}px` }}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <FeaturedEventCardSkeleton key={`desktop-skeleton-${idx}`} cardWidth={DESKTOP_CARD_WIDTH} />
              ))}
            </div>
            <div className="md:hidden relative w-full h-[420px] overflow-hidden">
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <FeaturedEventCardSkeleton cardWidth={Math.max(MIN_MOBILE_CARD_WIDTH, 260)} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body">
              Loading events
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-32 px-6 md:px-16 bg-background">
        <div className="max-w-7xl mx-auto text-center text-destructive">{error}</div>
      </section>
    );
  }

  return (
    <section id="events" className="relative py-32 px-6 md:px-16 bg-background overflow-x-clip md:overflow-hidden">
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {visibleShowcaseSlides.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 w-[calc(100vw-3rem)] max-w-[1220px] md:w-[calc(100vw-6rem)]"
          >
            <EventShowcaseStrip slides={visibleShowcaseSlides} />
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body">
              Upcoming Events
            </p>
            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-foreground">
              Our Events
            </h2>
          </div>
          <div className="flex items-center gap-6">
            {allEvents.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => setIsAllEventsOpen(true)}
                className="font-body text-xs tracking-[0.2em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all duration-300"
              >
                {allEvents.length > featuredCount
                  ? `View all ${allEvents.length} events`
                  : "View all events"}
              </motion.button>
            )}
          </div>
        </motion.div>

        {featuredEvents.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-24 text-muted-foreground"
          >
            No upcoming events at the moment
          </motion.p>
        ) : (
          <div ref={scrollRef} className="touch-none select-none -mx-6 md:mx-0">
            {/* Container with proper overflow handling */}
            <div ref={carouselViewportRef} className="relative min-h-[460px] flex items-center justify-center">
              {/* Mobile: Very subtle edge fade - NOT blocking the cards */}
              <div className="md:hidden absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/20 to-transparent z-10 pointer-events-none" />
              <div className="md:hidden absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/20 to-transparent z-10 pointer-events-none" />
              
              {isMobile ? (
                <div className="relative w-full h-[420px] overflow-hidden">
                  {mobileCarouselEvents.map(({ event, isActive, key }, idx) => {
                    const centerLeft = (viewportWidth - cardWidth) / 2;
                    const baseLeft = centerLeft + (idx - 1) * (cardWidth + cardGap);

                    return (
                      <div
                        key={key}
                        className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
                        style={{
                          left: `${baseLeft}px`,
                          zIndex: isActive ? 20 : 10,
                        }}
                      >
                        <FeaturedEventCard
                          event={event}
                          cardWidth={cardWidth}
                          isActive={isActive}
                          onClick={() => handleEventClick(event)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative w-full flex items-center justify-center px-6 md:px-0">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-0 z-30 hidden md:flex h-16 w-16 items-center justify-center border border-border/40 bg-background/5 text-foreground/80 backdrop-blur-[1px] transition-all duration-300 hover:bg-background/20 hover:text-primary"
                    aria-label="Previous event"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <div
                    className="flex items-center"
                    style={{
                      gap: `${cardGap}px`,
                      transform: `translate3d(calc(50% - ${activeIndex * cardStep + cardWidth / 2}px), 0, 0)`,
                      transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      willChange: "transform",
                    }}
                  >
                    {featuredEvents.map((event, idx) => (
                      <FeaturedEventCard
                        key={event.id}
                        event={event}
                        cardWidth={cardWidth}
                        isActive={idx === activeIndex}
                        onClick={() => handleEventClick(event)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-0 z-30 hidden md:flex h-16 w-16 items-center justify-center border border-border/40 bg-background/5 text-foreground/80 backdrop-blur-[1px] transition-all duration-300 hover:bg-background/20 hover:text-primary"
                    aria-label="Next event"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-10">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body">
                {isMobile ? "Swipe to browse" : "Use arrows to browse"}
              </span>
              <div className="flex gap-2">
                {featuredEvents.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: i === activeIndex ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)",
                      transform: i === activeIndex ? "scale(1.5)" : "scale(1)",
                    }}
                    aria-label={`Event ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsOpen}
        initialBookingMode={startBookingMode}
        onClose={() => {
          setIsDetailsOpen(false);
          setStartBookingMode(false);
          clearEventQueryParams();
          setTimeout(() => setSelectedEvent(null), 300);
        }}
      />

      <AllEventsModal
        events={allEvents}
        isOpen={isAllEventsOpen}
        onClose={() => setIsAllEventsOpen(false)}
        onEventClick={handleAllEventClick}
      />
    </section>
  );
};

export default EventsSection;
