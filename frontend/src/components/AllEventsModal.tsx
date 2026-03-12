import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  image_url?: string;
  price?: number;
  preferred_dates?: string[];
  artists?: Array<{
    name: string;
    image_url?: string;
    specialization?: string;
    bio?: string;
  }>;
}

interface AllEventsModalProps {
  events: Event[];
  isOpen: boolean;
  onClose: () => void;
  onEventClick: (event: Event) => void;
}

const AllEventsModal = ({ events, isOpen, onClose, onEventClick }: AllEventsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const filteredEvents = events.filter(
    (e) =>
      !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99999]"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 40, rotateX: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-[100000] bg-surface-dark border border-border/50 overflow-hidden flex flex-col"
            style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/60 z-10" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/60 z-10" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/60 z-10" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/60 z-10" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-3 border border-border hover:border-primary transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>

            <div className="p-8 pt-16 pb-6 border-b border-border/30">
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                All Events
              </h2>
              <p className="text-sm text-muted-foreground tracking-wider font-body mb-6">
                {filteredEvents.length} of {events.length} {events.length === 1 ? "event" : "events"}
              </p>
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full px-4 py-3 pr-12 bg-background/80 border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-body text-sm tracking-wider"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8" data-lenis-prevent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {filteredEvents.length === 0 ? (
                  <p className="col-span-full text-center py-16 text-muted-foreground font-body">
                    No events match your search
                  </p>
                ) : (
                filteredEvents.map((event, i) => (
                  <motion.button
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onEventClick(event)}
                    className="group text-left relative overflow-hidden bg-background/50 border border-border/30 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
                          <span className="text-4xl text-muted-foreground/30 font-display">DGC</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-body tracking-wider">
                        {formatDate(event.date)} · {event.location}
                      </p>
                    </div>
                  </motion.button>
                )))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AllEventsModal;
