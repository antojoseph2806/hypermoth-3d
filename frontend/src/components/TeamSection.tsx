import { motion, useTransform } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";

const TeamSection = () => {
  const { ref, scrollYProgress } = useScrollProgress(["start end", "end start"]);

  const imgWidth1 = useTransform(scrollYProgress, [0.2, 0.5], [0, 96]);
  const imgHeight1 = useTransform(scrollYProgress, [0.2, 0.5], [0, 64]);
  const imgWidth2 = useTransform(scrollYProgress, [0.3, 0.55], [0, 96]);
  const imgHeight2 = useTransform(scrollYProgress, [0.3, 0.55], [0, 64]);
  const imgWidth3 = useTransform(scrollYProgress, [0.35, 0.6], [0, 96]);
  const imgHeight3 = useTransform(scrollYProgress, [0.35, 0.6], [0, 64]);

  const sectionRotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [5, 0, 0, -5]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.3], [0.92, 1]);

  return (
    <section ref={ref} className="relative py-32 px-6 md:px-16 bg-background overflow-hidden" style={{ perspective: "1200px" }}>
      <motion.div
        style={{ rotateX: sectionRotateX, scale: sectionScale, transformStyle: "preserve-3d" as any }}
        className="max-w-5xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body text-center"
        >
          The Visionaries Behind DID
        </motion.p>

        {/* Flowing text with inline 3D images */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-12">
          <motion.span
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-primary"
            style={{ transformStyle: "preserve-3d" as any }}
          >
            Our team
          </motion.span>

          <motion.div
            style={{ width: imgWidth1, height: imgHeight1, transformStyle: "preserve-3d" as any }}
            className="overflow-hidden rounded-sm flex-shrink-0 shadow-lg"
            whileHover={{ scale: 1.1, rotateY: 5 }}
          >
            <img src={team1} alt="Team" className="w-full h-full object-cover" />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground"
          >
            redefines
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground/60"
          >
            event experiences
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground"
          >
            with
          </motion.span>

          <motion.div
            style={{ width: imgWidth2, height: imgHeight2 }}
            className="overflow-hidden rounded-sm flex-shrink-0 shadow-lg"
            whileHover={{ scale: 1.1, rotateY: -5 }}
          >
            <img src={team2} alt="On event" className="w-full h-full object-cover" />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-primary"
          >
            originality &
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground"
          >
            excellence
          </motion.span>

          <motion.div
            style={{ width: imgWidth3, height: imgHeight3 }}
            className="overflow-hidden rounded-sm flex-shrink-0 shadow-lg"
            whileHover={{ scale: 1.1, rotateY: 5 }}
          >
            <img src={team3} alt="Production" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="#contact"
            className="inline-block font-body text-xs tracking-[0.2em] uppercase text-foreground border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
          >
            Get in touch
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TeamSection;
