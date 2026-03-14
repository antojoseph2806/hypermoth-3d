import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  image_url: string;
};

export type ShowcaseSlide = {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
};

const AUTO_ADVANCE_MS = 5000;

const EventShowcaseStrip = ({ slides }: { slides: ShowcaseSlide[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const upcoming = (data.events || [])
          .filter((e: Event) => new Date(e.date) >= new Date())
          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 10);
        setUpcomingEvents(upcoming);
      })
      .catch(() => setUpcomingEvents([]));
  }, []);

  const goToSlide = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    setDirection(normalizedIndex > activeIndex ? 1 : -1);
    setActiveIndex(normalizedIndex);
  };

  const goNext = () => {
    setDirection(1);
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length <= 1) return;

    const intervalId = window.setInterval(() => {
      goNext();
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('events-scroll-container');
    if (!container) return;
    
    const scrollAmount = 320 + 24; // card width + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount * 2)
      : scrollPosition + scrollAmount * 2;
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleEventClick = (eventId: number) => {
    // Scroll to events section
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Navigate with event query parameter to open modal
    setTimeout(() => {
      navigate(`/?event=${eventId}`);
    }, 500);
  };

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="relative h-[85vh] md:h-[90vh] overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,55,55,0.18),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,55,55,0.1),transparent_35%)]" />

      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, x: direction > 0 ? 28 : -28, scale: 1.01 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction > 0 ? -28 : 28, scale: 1.01 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={activeSlide.image_url}
            alt={activeSlide.title}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex flex-col justify-between">
        <div className="flex-1 flex items-center p-6 md:p-10">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-foreground/65">
              Featured Visual
            </p>
            {activeSlide.title?.trim() ? (
              <h3 className="mt-3 max-w-3xl font-display text-3xl leading-none text-foreground md:text-6xl">
                {activeSlide.title}
              </h3>
            ) : null}
            {activeSlide.subtitle?.trim() ? (
              <p className="mt-4 max-w-xl font-body text-sm leading-6 text-foreground/75 md:text-base">
                {activeSlide.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* Netflix-style Upcoming Events Row */}
        {upcomingEvents.length > 0 && (
          <div className="pb-8 md:pb-12 px-6 md:px-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-foreground/65 mb-2">
                  Upcoming Events
                </p>
                <h3 className="font-display text-2xl md:text-3xl text-foreground">
                  Our Events
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleScroll('left')}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/20 hover:border-primary/50 transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/20 hover:border-primary/50 transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div 
              id="events-scroll-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer"
                >
                  <div className="relative h-[180px] md:h-[200px] overflow-hidden bg-surface-elevated border border-border/30">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="font-display text-base md:text-lg text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] text-white/70 font-body">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? 30 : 10,
                backgroundColor:
                  index === activeIndex
                    ? "hsl(var(--primary))"
                    : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Go to showcase slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default EventShowcaseStrip;
