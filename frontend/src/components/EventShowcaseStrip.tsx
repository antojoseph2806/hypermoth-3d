import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";


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

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="relative h-[480px] overflow-hidden border border-border/30 bg-black md:h-[640px]">
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
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex items-end">
        <div className="w-full p-6 md:p-10">
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
