import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/Navbar";
import FeaturedEventsSection from "@/components/EventsSection";
import AboutSection from "@/components/AboutSection";
import ProjectSection from "@/components/ProjectSection";
import TeamSection from "@/components/TeamSection";
import ServicesSection from "@/components/ServicesSection";
import ContactSection from "@/components/ContactSection";
import StatusBar from "@/components/StatusBar";

const Index = () => {
  useLenis();

  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <FeaturedEventsSection />
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
