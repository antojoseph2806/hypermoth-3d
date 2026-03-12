import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Presentation, Megaphone, ChevronRight } from "lucide-react";

const services = [
  {
    icon: Calendar,
    title: "Event Production",
    desc: "End-to-end production for conferences, galas, festivals, and corporate events.",
  },
  {
    icon: Presentation,
    title: "Stage Design",
    desc: "Immersive stage design, AV solutions, and cutting-edge event technology.",
  },
  {
    icon: Megaphone,
    title: "Event Marketing",
    desc: "Strategic promotion, branding, and audience engagement campaigns.",
  },
];

const ServicesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="services" className="relative py-32 px-6 md:px-16 bg-background overflow-hidden">
      <div className="max-w-5xl mx-auto" style={{ perspective: "1000px" }}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body"
            >
              Our Services
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40, rotateX: 12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-display text-6xl sm:text-8xl text-foreground"
              style={{ transformStyle: "preserve-3d" as any }}
            >
              Beyond Events
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-sm text-muted-foreground max-w-xs"
          >
            Comprehensive event solutions. From concept to execution, we deliver exceptional experiences.
          </motion.p>
        </div>

        <div className="divide-y divide-border">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className="group py-8 flex items-center gap-8 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{
                x: 12,
                transition: { duration: 0.3 },
              }}
              style={{ transformStyle: "preserve-3d" as any }}
            >
              <motion.div
                className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-primary transition-all duration-300"
                whileHover={{ rotateY: 180 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" as any }}
              >
                <s.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-display text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors duration-300">
                  {s.title}
                </h3>
              </div>
              <AnimatePresence>
                {hoveredIndex === i && (
                  <motion.p
                    initial={{ opacity: 0, x: 20, rotateY: 5 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="hidden md:block font-body text-xs text-muted-foreground max-w-xs"
                  >
                    {s.desc}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.div
                animate={{ x: hoveredIndex === i ? 5 : 0, opacity: hoveredIndex === i ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
