import { AnimatePresence, motion } from "framer-motion";

type WebsitePreloaderProps = {
  isVisible: boolean;
};

const WebsitePreloader = ({ isVisible }: WebsitePreloaderProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="website-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] bg-background"
          aria-live="polite"
          aria-label="Loading website"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.12),transparent_48%)]" />
            <motion.div
              className="absolute -left-1/4 top-1/2 h-px w-[150%] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              animate={{ y: [-120, 120, -120] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative flex h-full w-full items-center justify-center px-6">
            <div className="flex flex-col items-center gap-8">
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute h-28 w-28 rounded-full border border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute h-36 w-36 rounded-full border border-primary/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                <motion.img
                  src="/hyper.png"
                  alt="Hyper Moth"
                  className="relative z-10 h-12 w-auto object-contain"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="w-56 space-y-3">
                <div className="h-[2px] w-full overflow-hidden bg-border/40">
                  <motion.div
                    className="h-full w-1/2 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
                    animate={{ x: ["-120%", "220%"] }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <motion.p
                  className="text-center font-body text-[10px] tracking-[0.28em] text-muted-foreground uppercase"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  Preparing your experience
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WebsitePreloader;
