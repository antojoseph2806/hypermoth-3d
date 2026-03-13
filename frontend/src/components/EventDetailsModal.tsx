import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Menu,
  Share2,
  Ticket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/api";
import { getStoredUser } from "@/lib/auth";

interface Event {
  id: string | number;
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

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  initialBookingMode?: boolean;
}

const EventDetailsModal = ({
  event,
  isOpen,
  onClose,
  initialBookingMode = false,
}: EventDetailsModalProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [selectedPreferredDate, setSelectedPreferredDate] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("1");
  const [bookingFeedback, setBookingFeedback] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !event) {
      setIsBookingMode(false);
      setSelectedPreferredDate("");
      setTicketQuantity("1");
      setBookingFeedback("");
      setBookingError("");
      setBookingLoading(false);
      return;
    }

    const defaultPreferredDate =
      Array.isArray(event.preferred_dates) && event.preferred_dates.find((dateValue) => dateValue?.trim())
        ? event.preferred_dates.find((dateValue) => dateValue?.trim()) || event.date
        : event.date;

    setSelectedPreferredDate(defaultPreferredDate);
    setTicketQuantity("1");
    setBookingFeedback("");
    setBookingError("");
    setIsBookingMode(initialBookingMode);
  }, [event, initialBookingMode, isOpen]);

  if (!event) return null;

  const eventDate = new Date(event.date);
  const overview = event.description?.trim()
    ? event.description
    : "Event details will be updated soon.";
  const artists = Array.isArray(event.artists) ? event.artists.filter((artist) => artist?.name?.trim()) : [];
  const preferredDates = Array.isArray(event.preferred_dates)
    ? event.preferred_dates.filter((dateValue) => dateValue?.trim())
    : [];

  const ticketDates = preferredDates.length > 0 ? preferredDates : [event.date];
  const sortedTicketDates = [...ticketDates].sort(
    (firstDate, secondDate) => new Date(firstDate).getTime() - new Date(secondDate).getTime(),
  );
  const firstScheduleDate = new Date(sortedTicketDates[0] || event.date);
  const lastScheduleDate = new Date(sortedTicketDates[sortedTicketDates.length - 1] || event.date);

  const formatLongDate = (dateValue: Date, includeYear = false) =>
    dateValue.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      ...(includeYear ? { year: "numeric" as const } : {}),
    });

  const startDate = formatLongDate(firstScheduleDate);
  const endDateStr =
    sortedTicketDates.length > 1
      ? formatLongDate(lastScheduleDate, true)
      : formatLongDate(firstScheduleDate, true);
  const displayTime = firstScheduleDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const scheduleSummary =
    sortedTicketDates.length > 1
      ? `${startDate} - ${endDateStr}`
      : formatLongDate(firstScheduleDate, true);

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${event.id}`;
    const data = {
      title: event.title,
      text: `${event.title} on ${scheduleSummary}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url}`);
      window.alert("Event details copied to clipboard.");
    } catch {
      // User cancelled share interaction.
    }
  };

  const redirectToLoginForBooking = () => {
    window.alert("Please sign in to continue booking.");
    const redirectTo = `/?event=${encodeURIComponent(String(event.id))}&book=1#events`;
    navigate(`/signin?redirect=${encodeURIComponent(redirectTo)}`);
  };

  const handleOpenBooking = () => {
    const user = getStoredUser();

    if (!user) {
      redirectToLoginForBooking();
      return;
    }

    setBookingError("");
    setBookingFeedback("");
    setIsBookingMode(true);
  };

  const handleBookingSubmit = async () => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token || !user) {
      redirectToLoginForBooking();
      return;
    }

    const quantity = Number(ticketQuantity);

    if (!selectedPreferredDate) {
      setBookingError("Please choose a preferred date.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setBookingError("Please enter a valid number of tickets.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    setBookingFeedback("");

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          quantity,
          preferred_date: selectedPreferredDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to complete booking.");
      }

      setBookingFeedback("Booking confirmed successfully.");
      setIsBookingMode(false);
      window.dispatchEvent(new CustomEvent("booking-created"));
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Unable to complete booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTicketDate = (dateValue: string) =>
    new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

  const formatTicketMeta = (dateValue: string) =>
    new Date(dateValue).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
            className="fixed inset-0 z-[99990] bg-black/95 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 lg:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="relative isolate w-full max-w-[420px] lg:max-w-[900px] xl:max-w-[1000px] max-h-[96vh] rounded-2xl border border-white/10 bg-[#070b11] overflow-hidden pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={scrollContainerRef}
                className="h-full max-h-[96vh] overflow-y-auto custom-scrollbar scroll-smooth"
                data-lenis-prevent
                style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
              >
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:h-[96vh]">
                  <div className="relative border-r border-border/40 bg-surface-dark overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40 z-20" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40 z-20" />
                    <div className="sticky top-0 h-[96vh] p-6">
                      <div className="relative h-full w-full border border-border/40 overflow-hidden">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
                            <Ticket className="w-20 h-20 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5">
                          <p className="font-body text-[11px] tracking-[0.22em] uppercase text-foreground/70">
                            Hyper Moth Experience
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar bg-background/95">
                    <div className="sticky top-0 z-20 px-8 py-5 border-b border-border/30 bg-background/95 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={onClose}
                          className="h-10 px-5 border border-border text-xs tracking-[0.2em] uppercase font-body text-foreground/90 inline-flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <button
                          onClick={handleShare}
                          className="h-10 px-5 border border-primary/50 text-xs tracking-[0.2em] uppercase font-body text-foreground inline-flex items-center gap-2 hover:bg-primary hover:text-background transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>

                    <div className="px-8 py-8">
                      <div className="flex items-start justify-between gap-5 mb-8">
                        <div>
                          <p className="text-xs tracking-[0.26em] uppercase text-muted-foreground font-body mb-3">
                            Event Details
                          </p>
                          <h2 className="font-display text-5xl leading-[0.95] text-foreground max-w-[18ch]">
                            {event.title}
                          </h2>
                        </div>
                        <button className="h-12 w-12 border border-primary/40 bg-primary/10 inline-flex items-center justify-center text-primary shrink-0 hover:bg-primary/20 transition-colors">
                          <Ticket className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-8">
                        <div className="border border-border/40 bg-surface-elevated/40 p-4">
                          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-body mb-2">
                            Schedule
                          </p>
                          <div className="flex items-center gap-2 text-foreground/90">
                            <Clock3 className="w-4 h-4 text-primary" />
                            <span className="font-body text-sm">{scheduleSummary} | {displayTime}</span>
                          </div>
                        </div>
                        <div className="border border-border/40 bg-surface-elevated/40 p-4">
                          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-body mb-2">
                            Venue
                          </p>
                          <div className="flex items-start gap-2 text-foreground/90">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="font-body text-sm leading-relaxed">{event.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-body mb-3">
                          Description
                        </h3>
                        <p className="font-body text-sm leading-relaxed text-foreground/75 max-w-none">
                          {overview}
                        </p>
                      </div>

                      {artists.length > 0 ? (
                        <div className="mb-8">
                          <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-body mb-4">
                            Artists
                          </h3>
                          <div className="grid gap-4">
                            {artists.map((artist, index) => {
                              const artistKey = encodeURIComponent(artist.name?.trim().toLowerCase() || '');
                              return (
                                <div
                                  key={`${event.id}-artist-${index}`}
                                  className="flex gap-4 border border-border/30 bg-surface-elevated/30 p-4"
                                >
                                  <a
                                    href={`/artist/${artistKey}`}
                                    className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border/25 bg-background/50 hover:border-primary transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(`/artist/${artistKey}`);
                                    }}
                                  >
                                    {artist.image_url ? (
                                      <img
                                        src={artist.image_url}
                                        alt={artist.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                        Artist
                                      </div>
                                    )}
                                  </a>
                                  <div>
                                    <a
                                      href={`/artist/${artistKey}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/artist/${artistKey}`);
                                      }}
                                      className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                      {artist.name}
                                    </a>
                                    <p className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-primary/80">
                                      {artist.specialization || "Featured Artist"}
                                    </p>
                                    <p className="mt-2 font-body text-sm leading-6 text-foreground/70">
                                      {artist.bio || "Artist details will be added soon."}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {isBookingMode ? (
                        <div className="mb-8 border border-primary/30 bg-primary/5 p-5">
                          <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-body mb-4">
                            Complete Booking
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                                Preferred Date
                              </label>
                              <select
                                value={selectedPreferredDate}
                                onChange={(event) => setSelectedPreferredDate(event.target.value)}
                                className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                              >
                                {ticketDates.map((dateValue) => (
                                  <option key={dateValue} value={dateValue}>
                                    {formatTicketMeta(dateValue)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                                Number Of Tickets
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={ticketQuantity}
                                onChange={(event) => setTicketQuantity(event.target.value)}
                                className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                              />
                            </div>
                          </div>
                          {bookingError ? (
                            <p className="mt-4 text-sm text-destructive">{bookingError}</p>
                          ) : null}
                          {bookingFeedback ? (
                            <p className="mt-4 text-sm text-primary">{bookingFeedback}</p>
                          ) : null}
                          <div className="mt-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                              Available Date Options
                            </p>
                            <div className="mt-3 space-y-3">
                              {ticketDates.map((dateValue) => (
                                <div
                                  key={dateValue}
                                  className={`flex items-center justify-between border px-4 py-3 text-sm transition-colors ${
                                    selectedPreferredDate === dateValue
                                      ? "border-primary/60 bg-primary/10 text-foreground"
                                      : "border-border/40 bg-background text-foreground/75"
                                  }`}
                                >
                                  <div>
                                    <p className="font-body tracking-wide">{formatTicketDate(dateValue)}</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                                      {formatTicketMeta(dateValue)}
                                    </p>
                                  </div>
                                  {selectedPreferredDate === dateValue ? (
                                    <span className="text-[10px] uppercase tracking-[0.18em] text-primary">
                                      Selected
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-5 flex gap-3">
                            <button
                              type="button"
                              onClick={() => setIsBookingMode(false)}
                              className="w-full h-12 border border-border/50 text-xs tracking-[0.2em] uppercase font-body text-foreground/75"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleBookingSubmit()}
                              disabled={bookingLoading}
                              className="w-full h-12 border border-primary/60 bg-primary text-xs tracking-[0.2em] uppercase font-body text-background disabled:opacity-60"
                            >
                              {bookingLoading ? "Booking..." : "Confirm Booking"}
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <div className="pt-2 border-t border-border/30">
                        <button
                          type="button"
                          onClick={handleOpenBooking}
                          className="w-full h-12 border border-primary/50 bg-primary/10 text-xs tracking-[0.2em] uppercase font-body text-foreground hover:border-primary hover:bg-primary hover:text-background transition-colors"
                        >
                          Book Now
                        </button>
                        <button className="mt-3 w-full h-12 border border-border/50 text-xs tracking-[0.2em] uppercase font-body text-foreground/85 hover:border-primary hover:text-primary transition-colors">
                          Terms & Conditions
                        </button>
                        <p className="text-center text-[11px] tracking-[0.18em] uppercase text-muted-foreground mt-4 font-body">
                          Book Now Available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden flex flex-col" style={{ minHeight: '96vh' }}>
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-[#070b11] px-4 py-3 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={onClose}
                        className="h-9 px-4 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-medium text-red-100 inline-flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleShare}
                          className="h-9 px-4 rounded-full border border-red-500/30 bg-red-500 text-xs font-medium text-white inline-flex items-center gap-2 hover:bg-red-600 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          aria-label="Menu"
                          className="h-9 w-9 rounded-md border border-white/10 bg-white/5 inline-flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
                        >
                          <Menu className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pt-4">
                    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#0a111d] shadow-2xl">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="h-[280px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[280px] w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
                          <Ticket className="w-16 h-16 text-white/20" />
                        </div>
                      )}
                      <div className="border-t border-white/10 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-white/55">
                          Hyper Moth Experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pt-5">
                    <div className="rounded-[22px] border border-white/10 bg-[#0a111d] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">
                            Event Details
                          </p>
                          <h2 className="mt-2 font-display text-[28px] leading-[0.95] text-white">
                            {event.title}
                          </h2>
                        </div>
                        <button className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-100 transition-colors hover:bg-red-500/20">
                          <Ticket className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                            Schedule
                          </p>
                          <div className="mt-3 flex items-start gap-3 text-white/85">
                            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <div>
                              <p className="text-sm font-medium">{scheduleSummary}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">
                                {displayTime}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                            Venue
                          </p>
                          <div className="mt-3 flex items-start gap-3 text-white/85">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <p className="text-sm leading-6">{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                      About Event
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      {overview}
                    </p>
                  </div>

                  {artists.length > 0 ? (
                    <div className="px-4 pb-4">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                        Artists
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {artists.map((artist, index) => {
                          const artistKey = encodeURIComponent(artist.name?.trim().toLowerCase() || '');
                          return (
                            <a
                              key={`${event.id}-mobile-artist-${index}`}
                              href={`/artist/${artistKey}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/artist/${artistKey}`);
                              }}
                              className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center hover:border-primary/60 transition-colors"
                            >
                              <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/5">
                                {artist.image_url ? (
                                  <img
                                    src={artist.image_url}
                                    alt={artist.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.18em] text-white/40">
                                    Artist
                                  </div>
                                )}
                              </div>
                              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:text-primary transition-colors">
                                {artist.name}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
                                {artist.specialization || "Featured Artist"}
                              </p>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {isBookingMode ? (
                    <div className="px-4 pb-4">
                      <div className="rounded-[22px] border border-primary/30 bg-primary/5 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                          Complete Booking
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                              Preferred Date
                            </label>
                            <select
                              value={selectedPreferredDate}
                              onChange={(event) => setSelectedPreferredDate(event.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-[#0d1118] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-primary"
                            >
                              {ticketDates.map((dateValue) => (
                                <option key={dateValue} value={dateValue}>
                                  {formatTicketMeta(dateValue)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                              Number Of Tickets
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={ticketQuantity}
                              onChange={(event) => setTicketQuantity(event.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-[#0d1118] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-primary"
                            />
                          </div>
                        </div>

                        {bookingError ? (
                          <p className="mt-4 text-sm text-red-300">{bookingError}</p>
                        ) : null}
                        {bookingFeedback ? (
                          <p className="mt-4 text-sm text-emerald-300">{bookingFeedback}</p>
                        ) : null}

                        <div className="mt-4">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                            Available Date Options
                          </p>
                          <div className="mt-3 space-y-2">
                            {ticketDates.map((dateValue) => (
                              <div
                                key={dateValue}
                                className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                                  selectedPreferredDate === dateValue
                                    ? "border-primary/50 bg-primary/10 text-white"
                                    : "border-white/10 bg-[#0d1118] text-white/75"
                                }`}
                              >
                                <p className="font-semibold">{formatTicketDate(dateValue)}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                                  {formatTicketMeta(dateValue)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setIsBookingMode(false)}
                            className="w-full rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/75"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleBookingSubmit()}
                            disabled={bookingLoading}
                            className="w-full rounded-2xl border border-primary/60 bg-primary px-4 py-3 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-60"
                          >
                            {bookingLoading ? "Booking..." : "Confirm Booking"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Terms & Conditions */}
                  <div className="px-4 pb-[100px]">
                    <button className="w-full h-11 rounded-lg border border-white/15 bg-[#0d1118] text-sm font-medium text-white/80 hover:border-white/25 hover:bg-[#12161f] transition-colors">
                      Terms & Conditions
                    </button>
                    <p className="mt-4 text-center text-xs text-white/40">BOOK NOW AVAILABLE</p>
                  </div>

                  {/* Mobile Sticky Footer — Book Now */}
                  <div className="lg:hidden sticky bottom-0 left-0 right-0 z-20 px-4 pt-3 pb-5 bg-[#070b11] border-t border-white/10" style={{ backdropFilter: 'blur(12px)', background: 'rgba(7,11,17,0.97)' }}>
                    <button
                      type="button"
                      onClick={handleOpenBooking}
                      className="w-full h-12 rounded-lg border border-primary/50 bg-primary text-sm font-medium text-background hover:bg-primary/90 transition-colors tracking-[0.08em]"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <style>{`
            .custom-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .custom-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .scroll-smooth {
              scroll-behavior: smooth;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailsModal;
