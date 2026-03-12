import { motion } from "framer-motion";
import joinImg from "@/assets/join-img.jpg";
import { useRef, useState } from "react";

const JoinSection = () => {
  const imgRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - rect.top) / rect.height - 0.5) * -10,
      y: ((e.clientX - rect.left) / rect.width - 0.5) * 10,
    });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <section id="team" className="relative py-32 px-6 md:px-16 bg-surface-dark overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body"
            >
              Be part of the experience
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-display text-6xl sm:text-8xl text-foreground mb-4"
              style={{ transformStyle: "preserve-3d" as any }}
            >
              Join us
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-body text-sm text-muted-foreground/60 leading-relaxed max-w-md"
            >
              We are always seeking creative talent. If you're passionate about producing extraordinary events and experiences, join our team.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            <a
              href="#contact"
              className="inline-block font-body text-xs tracking-[0.2em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
            >
              Join
            </a>
          </motion.div>
        </div>

        {/* 3D tilt image */}
        <motion.div
          ref={imgRef}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          style={{ perspective: "800px", transformStyle: "preserve-3d" as any }}
          className="relative cursor-pointer"
        >
          <img src={joinImg} alt="Join our events team" className="w-full h-[350px] md:h-[450px] object-cover shadow-2xl" />
          {/* SVG corner frames */}
          <div className="absolute top-3 left-3">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M0.5 16.9V0.9H16.5" stroke="white" /></svg>
          </div>
          <div className="absolute top-3 right-3">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M16 16.9V0.9H0" stroke="white" /></svg>
          </div>
          <div className="absolute bottom-3 left-3">
            <svg width="17" height="18" viewBox="0 0 17 18" fill="none"><path d="M0.5 0.9V16.9H16.5" stroke="white" /></svg>
          </div>
          <div className="absolute bottom-3 right-3">
            <svg width="17" height="18" viewBox="0 0 17 18" fill="none"><path d="M16 0.9V16.9H0" stroke="white" /></svg>
          </div>
          <div className="absolute inset-0 border border-foreground/10 pointer-events-none" />
          {/* 3D shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"
            animate={{ opacity: Math.abs(tilt.y) / 10 }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default JoinSection;
