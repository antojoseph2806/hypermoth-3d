import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = ["ABOUT US", "ARTISTS", "SERVICES", "GET IN TOUCH"];
const navLinks = ["/#about", "/#project", "/#services", "/#contact"];

const Navbar = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 bg-background/80 backdrop-blur-md border-b border-border/20"
      >
        <a href="/" className="z-10 flex items-center">
          <img 
            src="/hyper.png" 
            alt="Company Logo" 
            className="h-8 md:h-10 w-auto object-contain"
          />
        </a>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item, i) => (
            <a
              key={item}
              href={navLinks[i]}
              className="relative font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground/80 hover:text-foreground transition-colors duration-300 uppercase"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item}
              {hoveredIndex === i && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </a>
          ))}
          
          {/* Auth buttons */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border/30">
            <a
              href="/signin"
              className="font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground hover:text-primary transition-colors duration-300 uppercase"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground border border-primary/60 px-5 py-2 hover:bg-primary hover:text-background transition-all duration-300 uppercase"
            >
              Sign Up
            </a>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden z-10 text-foreground"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8"
        >
          {navItems.map((item, i) => (
            <a
              key={item}
              href={navLinks[i]}
              onClick={() => setMobileOpen(false)}
              className="font-display text-3xl text-foreground hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
          
          {/* Mobile auth buttons */}
          <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-border/30 w-64">
            <a
              href="/signin"
              onClick={() => setMobileOpen(false)}
              className="font-body text-sm tracking-[0.2em] text-foreground hover:text-primary transition-colors uppercase"
            >
              Sign In
            </a>
            <a
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="font-body text-sm tracking-[0.2em] text-foreground border border-primary/50 px-8 py-3 hover:bg-primary hover:text-background transition-all duration-300 uppercase w-full text-center"
            >
              Sign Up
            </a>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
