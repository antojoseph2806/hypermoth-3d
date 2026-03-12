import { motion, useTransform } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import aboutArt from "@/assets/about-art.jpg";
import about2 from "@/assets/about-2.jpg";
import about3 from "@/assets/about-3.jpg";

const points = [
  { num: "01", text: "Designing unforgettable event experiences that leave lasting impressions." },
  { num: "02", text: "Leveraging cutting-edge technology to elevate every moment." },
  { num: "03", text: "A new era. A new vision. Immersive events.", muted: true },
];

const AboutSection = () => {
  const { ref, scrollYProgress } = useScrollProgress(["start end", "end start"]);
  const imgX = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const imgX2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotateCard = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const scaleSection = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);
  const perspective3d = useTransform(scrollYProgress, [0, 0.5], [5, 0]);

  return (
    <section id="about" ref={ref} className="relative py-32 px-6 md:px-16 bg-background overflow-hidden">
      <motion.div
        style={{ scale: scaleSection, rotateX: perspective3d, transformStyle: "preserve-3d" as any }}
        className="max-w-5xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body"
        >
          We are — creativity, courage, future
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-5xl sm:text-7xl md:text-8xl text-foreground mb-20"
          style={{ transformStyle: "preserve-3d" as any }}
        >
          We craft extraordinary events
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* 3D Images with parallax */}
          <motion.div
            style={{ rotateY: rotateCard, transformStyle: "preserve-3d" as any }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 overflow-hidden"
              style={{ transformStyle: "preserve-3d" as any }}
            >
              <img src={aboutArt} alt="Event production" className="w-full h-72 md:h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </motion.div>
            <motion.img
              style={{ x: imgX, translateZ: 40 }}
              src={about2}
              alt="Event setup"
              className="absolute -bottom-8 -left-8 w-40 h-28 md:w-56 md:h-40 object-cover z-20 opacity-80 shadow-2xl"
            />
            <motion.img
              style={{ x: imgX2, translateZ: 20 }}
              src={about3}
              alt="Event tech"
              className="absolute -bottom-12 -right-4 w-36 h-24 md:w-48 md:h-32 object-cover z-20 opacity-70 shadow-xl"
            />
          </motion.div>

          {/* Points with 3D stagger */}
          <div className="space-y-10 pt-4" style={{ perspective: "600px" }}>
            {points.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.7 }}
                className="flex gap-6 items-start border-b border-border/30 pb-8 group cursor-default"
                whileHover={{ x: 8, transition: { duration: 0.3 } }}
              >
                <span className="font-display text-3xl text-primary group-hover:scale-110 transition-transform duration-300">{p.num}</span>
                <p className={`font-body text-sm leading-relaxed pt-2 ${p.muted ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                  {p.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
