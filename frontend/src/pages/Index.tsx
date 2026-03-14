import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/Navbar";
import FeaturedEventsSection from "@/components/EventsSection";
import AboutSection from "@/components/AboutSection";
import ProjectSection from "@/components/ProjectSection";
import TeamSection from "@/components/TeamSection";
import ServicesSection from "@/components/ServicesSection";
import ContactSection from "@/components/ContactSection";
import StatusBar from "@/components/StatusBar";
import EventShowcaseStrip, { type ShowcaseSlide } from "@/components/EventShowcaseStrip";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/api";

const Index = () => {
  useLenis();
  const [showcaseSlides, setShowcaseSlides] = useState<ShowcaseSlide[]>([]);

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

  const visibleShowcaseSlides = showcaseSlides.filter(
    (slide) => typeof slide.image_url === "string" && slide.image_url.trim().length > 0
  );

  return (
    <div className="bg-background text-foreground">
      <Navbar />
      {/* Spacer for fixed navbar */}
      <div className="h-[60px] md:h-[68px]" />
      {/* Netflix-style Hero Section */}
      {visibleShowcaseSlides.length > 0 && (
        <EventShowcaseStrip slides={visibleShowcaseSlides} />
      )}
      {/* Events Section - Full Section Below Hero */}
      <div className="relative z-10">
        <FeaturedEventsSection />
      </div>
      <AboutSection />
      <ProjectSection />
      <TeamSection />
      <ServicesSection />
      <ContactSection />
      <StatusBar />
      <div className="h-12" />
    </div>
  );
};

export default Index;
