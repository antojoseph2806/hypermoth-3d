import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CalendarPlus2,
  CalendarRange,
  CreditCard,
  Edit3,
  ImageUp,
  LoaderCircle,
  Plus,
  type LucideIcon,
  ShieldCheck,
  Ticket,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLenis } from "@/hooks/useLenis";
import DashboardNavbar from "@/components/DashboardNavbar";
import type { ShowcaseSlide } from "@/components/EventShowcaseStrip";
import FeaturedEventsSection from "@/components/EventsSection";
import AboutSection from "@/components/AboutSection";
import ProjectSection from "@/components/ProjectSection";
import TeamSection from "@/components/TeamSection";
import ServicesSection from "@/components/ServicesSection";
import ContactSection from "@/components/ContactSection";
import StatusBar from "@/components/StatusBar";
import { API_URL } from "@/config/api";
import { AppUser, clearAuthSession, getStoredUser, isAdminUser } from "@/lib/auth";

type AdminStats = {
  total_users: number;
  total_events: number;
  total_bookings: number;
};

type AdminBooking = {
  id: string;
  status: string;
  created_at: string;
  user?: {
    email?: string;
    user_metadata?: {
      name?: string;
    };
  };
  events?: {
    title?: string;
    date?: string;
    location?: string;
  };
};

type AdminUserRecord = {
  id: string;
  email: string;
  created_at: string | null;
  booking_count: number;
  user_metadata?: {
    name?: string;
  };
};

type AdminArtistRecord = {
  key: string;
  name: string;
  image_url: string;
  specialization: string;
  bio: string;
  event_count: number;
  events: Array<{
    event_id: string;
    title: string;
    date: string | null;
  }>;
};

type AdminSectionId =
  | "overview"
  | "events-admin"
  | "events-view"
  | "showcase"
  | "top-artists"
  | "bookings"
  | "users";

type AdminEventRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  image_url?: string;
  price?: number;
  gallery_images?: string[];
  preferred_dates?: string[];
  artists?: Array<{
    name: string;
    image_url?: string;
    specialization?: string;
    bio?: string;
  }>;
};

type EventArtistInput = {
  id: string;
  name: string;
  image_url: string;
  specialization: string;
  bio: string;
};

type EventFormState = {
  title: string;
  description: string;
  date: string;
  preferred_dates: string[];
  location: string;
  price: string;
  capacity: string;
  image_url: string;
  image_urls: string[];
  artists: EventArtistInput[];
};

const createArtistInput = (): EventArtistInput => ({
  id: crypto.randomUUID(),
  name: "",
  image_url: "",
  specialization: "",
  bio: "",
});

const createInitialEventForm = (): EventFormState => ({
  title: "",
  description: "",
  date: "",
  preferred_dates: ["", "", ""],
  location: "",
  price: "",
  capacity: "",
  image_url: "",
  image_urls: [],
  artists: [createArtistInput()],
});

const memberSections = (
  <>
    <FeaturedEventsSection />
    <AboutSection />
    <ProjectSection />
    <TeamSection />
    <ServicesSection />
    <ContactSection />
  </>
);

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Pending";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AdminMetricCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative overflow-hidden border border-border/40 bg-surface-elevated/90 p-6"
  >
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    <div className="mb-6 flex items-center justify-between">
      <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <p className="font-display text-5xl leading-none text-foreground">{value}</p>
  </motion.div>
);

const Dashboard = () => {
  useLenis();

  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_events: 0,
    total_bookings: 0,
  });
  const [events, setEvents] = useState<AdminEventRecord[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [topArtists, setTopArtists] = useState<AdminArtistRecord[]>([]);
  const [selectedTopArtistKeys, setSelectedTopArtistKeys] = useState<string[]>([]);
  const [showcaseSlides, setShowcaseSlides] = useState<ShowcaseSlide[]>([
    { id: 1, image_url: "", title: "", subtitle: "" },
    { id: 2, image_url: "", title: "", subtitle: "" },
    { id: 3, image_url: "", title: "", subtitle: "" },
  ]);
  const [eventForm, setEventForm] = useState<EventFormState>(() => createInitialEventForm());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [uploadingEventImages, setUploadingEventImages] = useState(false);
  const [uploadingArtistId, setUploadingArtistId] = useState<string | null>(null);
  const [eventFeedback, setEventFeedback] = useState("");
  const [savingShowcase, setSavingShowcase] = useState(false);
  const [showcaseFeedback, setShowcaseFeedback] = useState("");
  const [savingTopArtistKey, setSavingTopArtistKey] = useState<string | null>(null);
  const [topArtistsFeedback, setTopArtistsFeedback] = useState("");
  const [uploadingSlideId, setUploadingSlideId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return;
    }

    setUser(storedUser);
    setIsAuthorized(true);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !isAdminUser(user)) {
      return;
    }

    const fetchAdminDashboard = async () => {
      setLoadingAdmin(true);
      setAdminError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [statsResponse, bookingsResponse, usersResponse, eventsResponse] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { headers }),
          fetch(`${API_URL}/api/admin/bookings`, { headers }),
          fetch(`${API_URL}/api/admin/users`, { headers }),
          fetch(`${API_URL}/api/events`, { headers }),
        ]);

        if ([statsResponse, bookingsResponse, usersResponse, eventsResponse].some((response) => !response.ok)) {
          const failingResponse = [statsResponse, bookingsResponse, usersResponse, eventsResponse].find(
            (response) => !response.ok,
          );
          const errorData = await failingResponse?.json().catch(() => null);

          if (failingResponse?.status === 401 || failingResponse?.status === 403) {
            clearAuthSession();
            navigate("/signin", { replace: true });
            return;
          }

          throw new Error(errorData?.detail || "Unable to load admin dashboard");
        }

        const [statsData, bookingsData, usersData, eventsData] = await Promise.all([
          statsResponse.json(),
          bookingsResponse.json(),
          usersResponse.json(),
          eventsResponse.json(),
        ]);

        const [showcaseResponse, topArtistsResponse] = await Promise.all([
          fetch(`${API_URL}/api/admin/showcase`, { headers }),
          fetch(`${API_URL}/api/admin/top-artists`, { headers }),
        ]);
        const showcaseData = showcaseResponse.ok ? await showcaseResponse.json() : null;
        const topArtistsData = topArtistsResponse.ok ? await topArtistsResponse.json() : null;

        setStats(statsData);
        setEvents(eventsData.events || []);
        setBookings(bookingsData.bookings || []);
        setUsers(usersData.users || []);
        if (Array.isArray(showcaseData?.slides)) {
          setShowcaseSlides(showcaseData.slides);
        }
        if (Array.isArray(topArtistsData?.artists)) {
          setTopArtists(topArtistsData.artists);
        }
        if (Array.isArray(topArtistsData?.selected_artist_keys)) {
          setSelectedTopArtistKeys(topArtistsData.selected_artist_keys);
        }
      } catch (error) {
        setAdminError(error instanceof Error ? error.message : "Unable to load admin dashboard");
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdminDashboard();
  }, [navigate, user]);

  if (!isAuthorized || !user) {
    return null;
  }

  if (!isAdminUser(user)) {
    return (
      <div className="bg-background text-foreground">
        <DashboardNavbar />
        {memberSections}
        <StatusBar />
        <div className="h-12" />
      </div>
    );
  }

  const activeAdminSection = (() => {
    const rawHash = location.hash.replace("#", "");
    const allowedSections: AdminSectionId[] = [
      "overview",
      "events-admin",
      "events-view",
      "showcase",
      "top-artists",
      "bookings",
      "users",
    ];

    return allowedSections.includes(rawHash as AdminSectionId)
      ? (rawHash as AdminSectionId)
      : "overview";
  })();

  const highlightedBookings = bookings.slice(0, 6);
  const highlightedUsers = users.slice(0, 6);

  const updateShowcaseSlide = (
    slideId: number,
    field: keyof Omit<ShowcaseSlide, "id">,
    value: string,
  ) => {
    setShowcaseFeedback("");
    setShowcaseSlides((current) =>
      current.map((slide) => (slide.id === slideId ? { ...slide, [field]: value } : slide)),
    );
  };

  const persistShowcaseSlides = async (slidesToSave: ShowcaseSlide[]) => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return false;
    }

    const response = await fetch(`${API_URL}/api/admin/showcase`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slides: slidesToSave }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to save showcase");
    }

    setShowcaseSlides(data.slides || slidesToSave);
    return true;
  };

  const handleShowcaseSave = async () => {
    setSavingShowcase(true);
    setShowcaseFeedback("");

    try {
      await persistShowcaseSlides(showcaseSlides);
      setShowcaseFeedback("Homepage showcase updated.");
    } catch (error) {
      setShowcaseFeedback(error instanceof Error ? error.message : "Unable to save showcase");
    } finally {
      setSavingShowcase(false);
    }
  };

  const handleShowcaseUpload = async (slideId: number, file: File | null) => {
    const token = localStorage.getItem("token");

    if (!file) {
      return;
    }

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return;
    }

    setUploadingSlideId(slideId);
    setShowcaseFeedback("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/api/admin/showcase/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to upload image");
      }

      const nextSlides = showcaseSlides.map((slide) =>
        slide.id === slideId ? { ...slide, image_url: data.image_url || "" } : slide,
      );

      setShowcaseSlides(nextSlides);
      await persistShowcaseSlides(nextSlides);
      setShowcaseFeedback(`Slide ${slideId} image uploaded and saved.`);
    } catch (error) {
      setShowcaseFeedback(error instanceof Error ? error.message : "Unable to upload image");
    } finally {
      setUploadingSlideId(null);
    }
  };

  const persistTopArtists = async (artistKeys: string[]) => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return null;
    }

    const response = await fetch(`${API_URL}/api/admin/top-artists`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artist_keys: artistKeys }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to save top artists");
    }

    setTopArtists(Array.isArray(data.artists) ? data.artists : []);
    setSelectedTopArtistKeys(Array.isArray(data.selected_artist_keys) ? data.selected_artist_keys : []);
    localStorage.setItem("topArtistsUpdatedAt", String(Date.now()));
    window.dispatchEvent(new CustomEvent("top-artists-updated"));
    return data;
  };

  const toggleTopArtist = async (artistKey: string) => {
    const previousKeys = selectedTopArtistKeys;
    const nextKeys = previousKeys.includes(artistKey)
      ? previousKeys.filter((key) => key !== artistKey)
      : [...previousKeys, artistKey];

    setTopArtistsFeedback("");
    setSavingTopArtistKey(artistKey);
    setSelectedTopArtistKeys(nextKeys);

    try {
      await persistTopArtists(nextKeys);
      setTopArtistsFeedback("Top artists updated.");
    } catch (error) {
      setSelectedTopArtistKeys(previousKeys);
      setTopArtistsFeedback(error instanceof Error ? error.message : "Unable to save top artists");
    } finally {
      setSavingTopArtistKey(null);
    }
  };

  const updateEventField = (
    field: Exclude<keyof EventFormState, "artists" | "image_urls" | "preferred_dates">,
    value: string,
  ) => {
    setEventFeedback("");
    setEventForm((current) => ({ ...current, [field]: value }));
  };

  const updateArtistField = (
    artistId: string,
    field: Exclude<keyof EventArtistInput, "id">,
    value: string,
  ) => {
    setEventFeedback("");
    setEventForm((current) => ({
      ...current,
      artists: current.artists.map((artist) =>
        artist.id === artistId ? { ...artist, [field]: value } : artist,
      ),
    }));
  };

  const updatePreferredDate = (index: number, value: string) => {
    setEventFeedback("");
    setEventForm((current) => ({
      ...current,
      preferred_dates: current.preferred_dates.map((dateValue, dateIndex) =>
        dateIndex === index ? value : dateValue,
      ),
    }));
  };

  const addPreferredDateRow = () => {
    setEventFeedback("");
    setEventForm((current) => ({
      ...current,
      preferred_dates: [...current.preferred_dates, ""],
    }));
  };

  const removePreferredDateRow = (index: number) => {
    setEventFeedback("");
    setEventForm((current) => ({
      ...current,
      preferred_dates:
        current.preferred_dates.length === 1
          ? current.preferred_dates
          : current.preferred_dates.filter((_, dateIndex) => dateIndex !== index),
    }));
  };

  const addArtistRow = () => {
    setEventFeedback("");
    setEventForm((current) => ({
      ...current,
      artists: [...current.artists, createArtistInput()],
    }));
  };

  const removeArtistRow = (artistId: string) => {
    setEventFeedback("");
    setEventForm((current) => ({
      ...current,
      artists:
        current.artists.length === 1
          ? current.artists
          : current.artists.filter((artist) => artist.id !== artistId),
    }));
  };

  const handleEventCreate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return;
    }

    setSavingEvent(true);
    setEventFeedback("");

    try {
      const eventDate = new Date(eventForm.date);

      if (Number.isNaN(eventDate.getTime())) {
        throw new Error("Please choose a valid event date and time.");
      }

      const payload = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        date: eventDate.toISOString(),
        preferred_dates: eventForm.preferred_dates
          .map((dateValue) => dateValue.trim())
          .filter(Boolean),
        location: eventForm.location.trim(),
        price: Number(eventForm.price),
        capacity: Number(eventForm.capacity),
        image_url: (eventForm.image_urls[0] || eventForm.image_url).trim(),
        gallery_images: Array.from(
          new Set(
            [eventForm.image_url.trim(), ...eventForm.image_urls].filter(Boolean),
          ),
        ),
        artists: eventForm.artists
          .map((artist) => ({
            name: artist.name.trim(),
            image_url: artist.image_url.trim(),
            specialization: artist.specialization.trim(),
            bio: artist.bio.trim(),
          }))
          .filter(
            (artist) =>
              artist.name || artist.image_url || artist.specialization || artist.bio,
          ),
      };

      if (!payload.title || !payload.location || !payload.description) {
        throw new Error("Title, description, location, and date are required.");
      }

      if (!Number.isFinite(payload.price) || payload.price < 0) {
        throw new Error("Please enter a valid ticket price.");
      }

      if (!Number.isInteger(payload.capacity) || payload.capacity <= 0) {
        throw new Error("Please enter a valid event capacity.");
      }

      if (
        payload.artists.some(
          (artist) => !artist.name || !artist.specialization,
        )
      ) {
        throw new Error("Each artist needs at least a name and specialization.");
      }

      const response = await fetch(
        editingEventId ? `${API_URL}/api/events/${editingEventId}` : `${API_URL}/api/events`,
        {
          method: editingEventId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to create event.");
      }

      if (editingEventId) {
        setEvents((current) =>
          current.map((event) =>
            event.id === editingEventId ? (data as AdminEventRecord) : event,
          ),
        );
      } else {
        setStats((current) => ({
          ...current,
          total_events: current.total_events + 1,
        }));
        setEvents((current) => [data as AdminEventRecord, ...current]);
      }

      setEditingEventId(null);
      setEventForm(createInitialEventForm());
      setEventFeedback(
        editingEventId
          ? "Event updated successfully."
          : payload.artists.length > 0
            ? "Event and artist details saved successfully."
            : "Event created successfully.",
      );
    } catch (error) {
      setEventFeedback(error instanceof Error ? error.message : "Unable to create event.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleEventImageUpload = async (files: FileList | null) => {
    const token = localStorage.getItem("token");

    if (!files || files.length === 0) {
      return;
    }

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return;
    }

    setUploadingEventImages(true);
    setEventFeedback("");

    try {
      const formData = new FormData();
      formData.append("folder", "events");
      Array.from(files).forEach((file) => formData.append("images", file));

      const response = await fetch(`${API_URL}/api/admin/events/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to upload event images.");
      }

      const uploadedUrls = Array.isArray(data.image_urls) ? data.image_urls : [];

      setEventForm((current) => {
        const mergedUrls = Array.from(new Set([...current.image_urls, ...uploadedUrls]));

        return {
          ...current,
          image_urls: mergedUrls,
          image_url: current.image_url || uploadedUrls[0] || "",
        };
      });

      setEventFeedback("Event images uploaded.");
    } catch (error) {
      setEventFeedback(error instanceof Error ? error.message : "Unable to upload event images.");
    } finally {
      setUploadingEventImages(false);
    }
  };

  const handleArtistImageUpload = async (artistId: string, file: File | null) => {
    const token = localStorage.getItem("token");

    if (!file) {
      return;
    }

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return;
    }

    setUploadingArtistId(artistId);
    setEventFeedback("");

    try {
      const formData = new FormData();
      formData.append("folder", "artists");
      formData.append("images", file);

      const response = await fetch(`${API_URL}/api/admin/events/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to upload artist image.");
      }

      const imageUrl =
        Array.isArray(data.image_urls) && typeof data.image_urls[0] === "string"
          ? data.image_urls[0]
          : "";

      updateArtistField(artistId, "image_url", imageUrl);
      setEventFeedback("Artist image uploaded.");
    } catch (error) {
      setEventFeedback(error instanceof Error ? error.message : "Unable to upload artist image.");
    } finally {
      setUploadingArtistId(null);
    }
  };

  const removeEventImage = (imageUrl: string) => {
    setEventFeedback("");
    setEventForm((current) => {
      const nextImageUrls = current.image_urls.filter((url) => url !== imageUrl);
      const nextPrimary =
        current.image_url === imageUrl ? nextImageUrls[0] || "" : current.image_url;

      return {
        ...current,
        image_urls: nextImageUrls,
        image_url: nextPrimary,
      };
    });
  };

  const handleEventEdit = (event: AdminEventRecord) => {
    setEditingEventId(event.id);
    setEventFeedback("");
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
      preferred_dates: event.preferred_dates?.length ? event.preferred_dates : ["", "", ""],
      location: event.location || "",
      price: typeof event.price === "number" ? String(event.price) : "",
      capacity: typeof event.capacity === "number" ? String(event.capacity) : "",
      image_url: event.image_url || "",
      image_urls: event.gallery_images || [],
      artists:
        event.artists?.length
          ? event.artists.map((artist) => ({
              id: crypto.randomUUID(),
              name: artist.name || "",
              image_url: artist.image_url || "",
              specialization: artist.specialization || "",
              bio: artist.bio || "",
            }))
          : [createArtistInput()],
    });
    window.location.hash = "events-admin";
  };

  const handleEventDelete = async (eventId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearAuthSession();
      navigate("/signin", { replace: true });
      return;
    }

    const confirmed = window.confirm("Delete this event? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setEventFeedback("");

    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete event.");
      }

      setEvents((current) => current.filter((event) => event.id !== eventId));
      setStats((current) => ({
        ...current,
        total_events: Math.max(0, current.total_events - 1),
      }));

      if (editingEventId === eventId) {
        setEditingEventId(null);
        setEventForm(createInitialEventForm());
      }

      setEventFeedback("Event deleted successfully.");
    } catch (error) {
      setEventFeedback(error instanceof Error ? error.message : "Unable to delete event.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNavbar />

      <main className="relative overflow-hidden px-6 pb-20 pt-32 md:px-16">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-80 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        {activeAdminSection === "overview" ? (
          <section
            id="overview"
            className="relative mx-auto flex max-w-7xl flex-col gap-10 border border-border/30 bg-surface-dark/85 px-6 py-8 md:px-10"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 font-body text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                  Admin Control Room
                </p>
                <h1 className="font-display text-6xl leading-none text-foreground md:text-8xl">
                  HyperMoth Dashboard
                </h1>
                <p className="mt-5 max-w-2xl font-body text-sm leading-7 text-foreground/70 md:text-base">
                  Track platform activity, review recent bookings, and keep a pulse on users from one place.
                </p>
              </div>

              <div className="grid gap-4 border border-border/30 bg-background/40 p-5 sm:grid-cols-2">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="mt-2 font-display text-3xl text-foreground">
                    {user.name || "Administrator"}
                  </p>
                </div>
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Access level
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="font-body text-xs uppercase tracking-[0.2em] text-foreground">
                      Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <AdminMetricCard label="Active Users" value={stats.total_users} icon={Users} />
              <AdminMetricCard label="Published Events" value={stats.total_events} icon={CalendarRange} />
              <AdminMetricCard label="Bookings" value={stats.total_bookings} icon={Ticket} />
            </div>
          </section>
        ) : null}

        {adminError ? (
          <section className="relative mx-auto mt-8 max-w-7xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
            {adminError}
          </section>
        ) : null}

        {activeAdminSection === "events-admin" ? (
        <section
          id="events-admin"
          className="relative mx-auto mt-8 max-w-7xl border border-border/30 bg-surface-elevated/80 p-6 md:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Event Publishing
              </p>
              <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
                {editingEventId ? "Edit Event" : "Add New Event"}
              </h2>
              <p className="mt-3 font-body text-sm leading-6 text-foreground/70">
                {editingEventId
                  ? "Update the selected event and keep its artist lineup in sync."
                  : "Publish a new event for the public site and attach the featured artist lineup in the same flow."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground">
              <CalendarPlus2 className="h-4 w-4 text-primary" />
              Admin publishing mode
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
            <div className="border border-border/25 bg-background/45 p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Event Details
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-foreground">
                    Main Information
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(event) => updateEventField("title", event.target.value)}
                    placeholder="Midnight Motion"
                    className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={eventForm.description}
                    onChange={(event) => updateEventField("description", event.target.value)}
                    placeholder="Describe the atmosphere, format, lineup, and what guests should expect."
                    className="w-full resize-none border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.date}
                    onChange={(event) => updateEventField("date", event.target.value)}
                    className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(event) => updateEventField("location", event.target.value)}
                    placeholder="Kochi Waterfront Arena"
                    className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2 border border-border/25 bg-surface-dark/40 p-4">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <label className="block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Preferred Dates
                      </label>
                      <p className="mt-2 font-body text-sm leading-6 text-foreground/65">
                        Add the schedule choices shown in the event details mobile layout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addPreferredDateRow}
                      className="inline-flex items-center gap-2 border border-border/40 px-4 py-3 font-body text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Add Date Option
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {eventForm.preferred_dates.map((preferredDate, index) => (
                      <div key={`preferred-date-${index}`} className="flex items-center gap-3">
                        <input
                          type="datetime-local"
                          value={preferredDate}
                          onChange={(event) => updatePreferredDate(index, event.target.value)}
                          className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removePreferredDateRow(index)}
                          disabled={eventForm.preferred_dates.length === 1}
                          className="inline-flex items-center justify-center border border-border/40 px-3 py-3 font-body text-[11px] uppercase tracking-[0.18em] text-foreground/75 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Ticket Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={eventForm.price}
                    onChange={(event) => updateEventField("price", event.target.value)}
                    placeholder="2499"
                    className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={eventForm.capacity}
                    onChange={(event) => updateEventField("capacity", event.target.value)}
                    placeholder="500"
                    className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={eventForm.image_url}
                    onChange={(event) => updateEventField("image_url", event.target.value)}
                    placeholder="https://..."
                    className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Upload Event Images
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border/40 bg-background px-4 py-4 font-body text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary">
                    {uploadingEventImages ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Uploading images...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        Choose multiple files
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        void handleEventImageUpload(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <p className="mt-2 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Uploaded images are stored and the first image becomes the main event cover.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border/25 bg-background/45 p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Preview
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-foreground">
                    Event Card
                  </h3>
                </div>
              </div>

              <div className="overflow-hidden border border-border/25 bg-surface-dark">
                {(eventForm.image_urls[0] || eventForm.image_url).trim() ? (
                  <img
                    src={eventForm.image_urls[0] || eventForm.image_url}
                    alt={eventForm.title || "Event preview"}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gradient-to-br from-surface-elevated to-background font-body text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Event artwork preview
                  </div>
                )}
                <div className="border-t border-border/20 p-5">
                  <p className="font-display text-3xl leading-none text-foreground">
                    {eventForm.title.trim() || "Untitled Event"}
                  </p>
                  <p className="mt-3 font-body text-sm leading-6 text-foreground/70">
                    {eventForm.description.trim() || "Your event summary will appear here once you start typing."}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="border border-border/20 bg-background/40 px-4 py-3">
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        When
                      </p>
                      <p className="mt-2 font-body text-sm text-foreground/85">
                        {eventForm.date ? new Date(eventForm.date).toLocaleString("en-IN") : "Select schedule"}
                      </p>
                    </div>
                    <div className="border border-border/20 bg-background/40 px-4 py-3">
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Where
                      </p>
                      <p className="mt-2 font-body text-sm text-foreground/85">
                        {eventForm.location.trim() || "Add venue"}
                      </p>
                    </div>
                  </div>
                  {eventForm.preferred_dates.some((dateValue) => dateValue.trim()) ? (
                    <div className="mt-5">
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Date Options
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {eventForm.preferred_dates
                          .filter((dateValue) => dateValue.trim())
                          .map((dateValue) => (
                            <div
                              key={dateValue}
                              className="border border-border/20 bg-background/40 px-4 py-3 font-body text-xs uppercase tracking-[0.18em] text-foreground/80"
                            >
                              {new Date(dateValue).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : null}
                  {eventForm.image_urls.length > 0 ? (
                    <div className="mt-5">
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Gallery Images
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {eventForm.image_urls.map((imageUrl, index) => (
                          <div key={imageUrl} className="relative h-16 w-16 overflow-hidden border border-border/25">
                            <img src={imageUrl} alt={`Event gallery ${index + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEventImage(imageUrl)}
                              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white"
                              aria-label={`Remove event image ${index + 1}`}
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-border/25 bg-background/45 p-5 md:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Featured Artists
                </p>
                <h3 className="mt-2 font-display text-3xl text-foreground">
                  Artist Lineup
                </h3>
                <p className="mt-2 font-body text-sm leading-6 text-foreground/70">
                  Add the artist cards you want to keep with the event entry.
                </p>
              </div>

              <button
                type="button"
                onClick={addArtistRow}
                className="inline-flex items-center gap-2 border border-border/40 px-4 py-3 font-body text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Artist
              </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {eventForm.artists.map((artist, index) => (
                <div key={artist.id} className="border border-border/25 bg-surface-dark/70 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Artist {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeArtistRow(artist.id)}
                      disabled={eventForm.artists.length === 1}
                      className="inline-flex items-center gap-2 border border-border/40 px-3 py-2 font-body text-[11px] uppercase tracking-[0.18em] text-foreground/75 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Name
                      </label>
                      <input
                        type="text"
                        value={artist.name}
                        onChange={(event) => updateArtistField(artist.id, "name", event.target.value)}
                        placeholder="Sofia Reyes"
                        className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Photo URL
                      </label>
                      <input
                        type="url"
                        value={artist.image_url}
                        onChange={(event) => updateArtistField(artist.id, "image_url", event.target.value)}
                        placeholder="https://..."
                        className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Upload Artist Photo
                      </label>
                      <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border/40 bg-background px-4 py-3 font-body text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary">
                        {uploadingArtistId === artist.id ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <ImageUp className="h-4 w-4" />
                            Choose File
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            void handleArtistImageUpload(artist.id, file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={artist.specialization}
                        onChange={(event) => updateArtistField(artist.id, "specialization", event.target.value)}
                        placeholder="Deep House / Live Visuals"
                        className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Short Bio
                      </label>
                      <textarea
                        rows={4}
                        value={artist.bio}
                        onChange={(event) => updateArtistField(artist.id, "bio", event.target.value)}
                        placeholder="Optional background or artist note."
                        className="w-full resize-none border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    <div className="overflow-hidden border border-border/25 bg-background/40">
                      {artist.image_url.trim() ? (
                        <img src={artist.image_url} alt={artist.name || "Artist preview"} className="h-40 w-full object-cover" />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-surface-elevated to-background font-body text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Artist photo preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-border/20 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="max-w-2xl font-body text-sm leading-6 text-foreground/65">
                Artists are saved together with the event submission. Use this section to prepare the lineup metadata at the same time.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {editingEventId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm(createInitialEventForm());
                      setEventFeedback("");
                    }}
                    className="inline-flex items-center justify-center border border-border/40 px-5 py-3 font-body text-xs uppercase tracking-[0.22em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                  >
                    Cancel Edit
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleEventCreate}
                  disabled={savingEvent}
                  className="inline-flex items-center justify-center border border-primary/60 px-6 py-3 font-body text-xs uppercase tracking-[0.22em] text-foreground transition-all duration-300 hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEvent ? "Saving..." : editingEventId ? "Update Event" : "Publish Event"}
                </button>
              </div>
            </div>

            {eventFeedback ? (
              <p className="mt-5 font-body text-sm text-primary">{eventFeedback}</p>
            ) : null}
          </div>
        </section>
        ) : null}

        {activeAdminSection === "events-view" ? (
        <section
          id="events-view"
          className="relative mx-auto mt-8 max-w-7xl border border-border/30 bg-surface-elevated/80 p-6 md:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Event Library
              </p>
              <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
                View Events
              </h2>
              <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-foreground/70">
                Browse the published events and review the saved artwork, gallery images, and featured artists.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 border border-border/40 bg-background/35 px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground/80">
              <Ticket className="h-4 w-4 text-primary" />
              {events.length} events
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {events.map((event) => (
                <article key={event.id} className="overflow-hidden border border-border/25 bg-background/45">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="h-64 w-full object-cover" />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-gradient-to-br from-surface-elevated to-background font-body text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Event artwork pending
                    </div>
                  )}

                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-display text-3xl leading-none text-foreground">
                          {event.title}
                        </p>
                        <p className="mt-3 font-body text-sm leading-6 text-foreground/70">
                          {event.description || "No event description added yet."}
                        </p>
                      </div>
                      <div className="border border-border/25 bg-surface-dark/60 px-4 py-3 text-right">
                        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          Ticket
                        </p>
                        <p className="mt-2 font-display text-2xl text-foreground">
                          {typeof event.price === "number" ? `Rs ${event.price}` : "TBD"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="border border-border/20 bg-surface-dark/50 px-4 py-3">
                        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          Date
                        </p>
                        <p className="mt-2 font-body text-sm text-foreground/85">
                          {event.date ? new Date(event.date).toLocaleString("en-IN") : "TBD"}
                        </p>
                      </div>
                      <div className="border border-border/20 bg-surface-dark/50 px-4 py-3">
                        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          Venue
                        </p>
                        <p className="mt-2 font-body text-sm text-foreground/85">
                          {event.location}
                        </p>
                      </div>
                      <div className="border border-border/20 bg-surface-dark/50 px-4 py-3">
                        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          Capacity
                        </p>
                        <p className="mt-2 font-body text-sm text-foreground/85">
                          {event.capacity} guests
                        </p>
                      </div>
                    </div>

                    {event.artists?.length ? (
                      <div className="mt-6">
                        <p className="font-body text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                          Artists
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {event.artists.map((artist, index) => (
                            <div key={`${event.id}-artist-${index}`} className="flex gap-3 border border-border/20 bg-surface-dark/50 p-3">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-border/25 bg-background/50">
                                {artist.image_url ? (
                                  <img src={artist.image_url} alt={artist.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                    No photo
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-body text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                                  {artist.name}
                                </p>
                                <p className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-primary/80">
                                  {artist.specialization || "Artist"}
                                </p>
                                <p className="mt-2 font-body text-xs leading-5 text-foreground/65">
                                  {artist.bio || "No artist note added."}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {event.gallery_images?.length ? (
                      <div className="mt-6">
                        <p className="font-body text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                          Gallery
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {event.gallery_images.map((imageUrl) => (
                            <div key={imageUrl} className="h-16 w-16 overflow-hidden border border-border/25 bg-background/50">
                              <img src={imageUrl} alt={`${event.title} gallery`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/20 pt-5">
                      <button
                        type="button"
                        onClick={() => handleEventEdit(event)}
                        className="inline-flex items-center gap-2 border border-border/40 px-4 py-3 font-body text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEventDelete(event.id)}
                        className="inline-flex items-center gap-2 border border-destructive/40 px-4 py-3 font-body text-xs uppercase tracking-[0.2em] text-destructive transition-colors hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border/40 p-8 font-body text-sm text-muted-foreground">
              No events available yet. Use Events &gt; Add Event to publish the first one.
            </div>
          )}
        </section>
        ) : null}

        {activeAdminSection === "showcase" ? (
        <section
          id="showcase"
          className="relative mx-auto mt-8 max-w-7xl border border-border/30 bg-surface-elevated/80 p-6 md:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Homepage Showcase
              </p>
              <h2 className="font-display text-4xl text-foreground">Sliding Images</h2>
              <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-foreground/70">
                Pick the 3 images and captions that appear above the public events section.
              </p>
            </div>

            <button
              type="button"
              onClick={handleShowcaseSave}
              disabled={savingShowcase}
              className="inline-flex h-fit items-center justify-center border border-primary/60 px-6 py-3 font-body text-xs uppercase tracking-[0.22em] text-foreground transition-all duration-300 hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingShowcase ? "Saving..." : "Save Showcase"}
            </button>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {showcaseSlides.map((slide) => (
              <div key={slide.id} className="border border-border/25 bg-background/50 p-4">
                <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Slide {slide.id}
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={slide.image_url}
                      onChange={(event) => updateShowcaseSlide(slide.id, "image_url", event.target.value)}
                      placeholder="https://..."
                      className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Upload Image
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border/40 bg-background px-4 py-3 font-body text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary">
                      {uploadingSlideId === slide.id ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageUp className="h-4 w-4" />
                          Choose File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          void handleShowcaseUpload(slide.id, file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(event) => updateShowcaseSlide(slide.id, "title", event.target.value)}
                      placeholder={`Enter title for slide ${slide.id}`}
                      className="w-full border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Subtitle
                    </label>
                    <textarea
                      value={slide.subtitle}
                      onChange={(event) => updateShowcaseSlide(slide.id, "subtitle", event.target.value)}
                      rows={3}
                      placeholder={`Enter subtitle for slide ${slide.id}`}
                      className="w-full resize-none border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Use either a URL or upload. Upload fills the URL automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => updateShowcaseSlide(slide.id, "image_url", "")}
                    className="border border-border/40 px-3 py-2 font-body text-[11px] uppercase tracking-[0.18em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                  >
                    Clear Image
                  </button>
                </div>

                <div className="mt-5 overflow-hidden border border-border/25 bg-surface-dark">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt={slide.title} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-surface-elevated to-background font-body text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Add image URL to preview
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showcaseFeedback ? (
            <p className="mt-5 font-body text-sm text-primary">{showcaseFeedback}</p>
          ) : null}
        </section>
        ) : null}

        {activeAdminSection === "top-artists" ? (
        <section
          id="top-artists"
          className="relative mx-auto mt-8 max-w-7xl border border-border/30 bg-surface-elevated/80 p-6 md:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Manage Content
              </p>
              <h2 className="font-display text-4xl text-foreground">Top Artists</h2>
              <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-foreground/70">
                Review all available artist profiles from published events and choose which ones appear on the homepage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex h-fit items-center gap-2 border border-border/40 bg-background/35 px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground/80">
                <Users className="h-4 w-4 text-primary" />
                {topArtists.length} artists
              </div>
              <div className="inline-flex h-fit items-center gap-2 border border-primary/30 bg-primary/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground/80">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {selectedTopArtistKeys.length} selected
              </div>
              <div className="inline-flex h-fit items-center justify-center border border-border/40 px-4 py-3 font-body text-xs uppercase tracking-[0.22em] text-foreground/70">
                {savingTopArtistKey ? "Updating..." : "Live Sync Enabled"}
              </div>
            </div>
          </div>

          {topArtists.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {topArtists.map((artist) => (
                <article key={artist.key} className="border border-border/25 bg-background/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-border/25 bg-surface-dark">
                      {artist.image_url ? (
                        <img src={artist.image_url} alt={artist.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {artist.event_count} {artist.event_count === 1 ? "event" : "events"}
                      </p>
                      <h3 className="mt-2 font-display text-3xl leading-none text-foreground">
                        {artist.name}
                      </h3>
                      <p className="mt-2 font-body text-[11px] uppercase tracking-[0.2em] text-primary/80">
                        {artist.specialization}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 font-body text-sm leading-6 text-foreground/70">
                    {artist.bio || "This artist profile will appear here once a bio is added to an event artist entry."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {artist.events.slice(0, 3).map((event) => (
                      <div
                        key={`${artist.key}-${event.event_id}`}
                        className="border border-border/20 bg-surface-dark/40 px-3 py-2 font-body text-[10px] uppercase tracking-[0.18em] text-foreground/70"
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => void toggleTopArtist(artist.key)}
                    disabled={savingTopArtistKey === artist.key}
                    className={`mt-6 inline-flex w-full items-center justify-center border px-4 py-3 font-body text-xs uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedTopArtistKeys.includes(artist.key)
                        ? "border-primary bg-primary text-background"
                        : "border-border/40 text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {savingTopArtistKey === artist.key
                      ? "Updating..."
                      : selectedTopArtistKeys.includes(artist.key)
                        ? "Top Artist Selected"
                        : "Set As Top Artist"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border/40 p-8 font-body text-sm text-muted-foreground">
              No artists available yet. Add artist details to an event to populate this section.
            </div>
          )}

          {topArtistsFeedback ? (
            <p className="mt-5 font-body text-sm text-primary">{topArtistsFeedback}</p>
          ) : null}
        </section>
        ) : null}

        {activeAdminSection === "bookings" ? (
        <section className="relative mx-auto mt-8 max-w-7xl">
          <div id="bookings" className="border border-border/30 bg-surface-elevated/80 p-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  Recent Activity
                </p>
                <h2 className="font-display text-4xl text-foreground">Latest Bookings</h2>
              </div>
              <div className="inline-flex items-center gap-2 border border-border/40 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
                <Activity className="h-4 w-4 text-primary" />
                {loadingAdmin ? "Refreshing" : `${bookings.length} Records`}
              </div>
            </div>

            <div className="space-y-3">
              {highlightedBookings.length > 0 ? (
                highlightedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="grid gap-4 border border-border/25 bg-background/50 p-4 md:grid-cols-[1.2fr_1fr_auto]"
                  >
                    <div>
                      <p className="font-display text-2xl text-foreground">
                        {booking.events?.title || "Untitled Event"}
                      </p>
                      <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {booking.user?.user_metadata?.name || booking.user?.email || "Unknown guest"}
                      </p>
                    </div>
                    <div className="font-body text-sm text-foreground/75">
                      <p>{booking.events?.location || "Location pending"}</p>
                      <p className="mt-1">{formatDate(booking.events?.date || booking.created_at)}</p>
                    </div>
                    <div className="inline-flex h-fit items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-2 font-body text-[11px] uppercase tracking-[0.2em] text-foreground">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {booking.status || "confirmed"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-border/40 p-6 font-body text-sm text-muted-foreground">
                  {loadingAdmin ? "Loading booking activity..." : "No bookings found yet."}
                </div>
              )}
            </div>
          </div>
        </section>
        ) : null}

        {activeAdminSection === "users" ? (
        <section className="relative mx-auto mt-8 max-w-7xl">
          <div id="users" className="border border-border/30 bg-surface-elevated/80 p-6">
            <div className="mb-6">
              <p className="font-body text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Audience Snapshot
              </p>
              <h2 className="font-display text-4xl text-foreground">Users</h2>
            </div>

            <div className="space-y-3">
              {highlightedUsers.length > 0 ? (
                highlightedUsers.map((entry) => (
                  <div key={entry.id} className="border border-border/25 bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-body text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                          {entry.user_metadata?.name || entry.email}
                        </p>
                        <p className="mt-1 font-body text-xs text-muted-foreground">{entry.email}</p>
                      </div>
                      <div className="border border-border/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                        {entry.booking_count} bookings
                      </div>
                    </div>
                    <p className="mt-3 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Joined {formatDate(entry.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-border/40 p-6 font-body text-sm text-muted-foreground">
                  {loadingAdmin ? "Loading user records..." : "No users available yet."}
                </div>
              )}
            </div>
          </div>
        </section>
        ) : null}
      </main>

      <StatusBar />
    </div>
  );
};

export default Dashboard;
