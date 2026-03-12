import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, LogOut, Shield, User, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getStoredUser, isAdminUser } from "@/lib/auth";

type DashboardNavItem = {
  label: string;
  href?: string;
  children?: Array<{ label: string; href: string }>;
};

const userNavItems: DashboardNavItem[] = [
  { label: "EVENTS", href: "/dashboard#events" },
  { label: "MANAGE TICKETS" },
];

const adminNavItems: DashboardNavItem[] = [
  { label: "OVERVIEW", href: "/dashboard#overview" },
  {
    label: "EVENTS",
    children: [
      { label: "Add Event", href: "/dashboard#events-admin" },
      { label: "View Events", href: "/dashboard#events-view" },
    ],
  },
  {
    label: "MANAGE CONTENT",
    children: [
      { label: "Showcase", href: "/dashboard#showcase" },
      { label: "Top Artists", href: "/dashboard#top-artists" },
    ],
  },
  { label: "BOOKINGS", href: "/dashboard#bookings" },
  { label: "USERS", href: "/dashboard#users" },
];

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();
  const adminUser = isAdminUser(user);
  const navItems = adminUser ? adminNavItems : userNavItems;
  const activeHref = adminUser
    ? `/dashboard${location.hash || "#overview"}`
    : `/dashboard${location.hash || "#events"}`;

  const handleLogout = () => {
    clearAuthSession();
    navigate("/signin", { replace: true });
  };

  const closeDropdown = () => {
    setOpenDropdownIndex(null);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 bg-background/80 backdrop-blur-md border-b border-border/20"
      >
        <a href="/dashboard" className="z-10 flex items-center">
          <img 
            src="/hyper.png" 
            alt="Company Logo" 
            className="h-8 md:h-10 w-auto object-contain"
          />
        </a>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item, i) =>
            item.children?.length ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  setOpenDropdownIndex(i);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setOpenDropdownIndex((current) => (current === i ? null : current));
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdownIndex((current) => (current === i ? null : i))
                  }
                  className="relative inline-flex items-center gap-2 font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground/80 hover:text-foreground transition-colors duration-300 uppercase"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                  {(hoveredIndex === i ||
                    item.children.some((child) => activeHref === child.href)) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>

                {openDropdownIndex === i ? (
                  <div className="absolute left-0 top-full min-w-[220px] border border-border/30 bg-background/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={closeDropdown}
                        className={`block border px-4 py-3 font-body text-[11px] uppercase tracking-[0.2em] transition-colors ${
                          activeHref === child.href
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-transparent text-foreground/75 hover:border-border/30 hover:text-primary"
                        }`}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="relative font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground/80 hover:text-foreground transition-colors duration-300 uppercase"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}
                {(hoveredIndex === i || activeHref === item.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                className="font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground/80 uppercase"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}
              </button>
            )
          )}
          
          {/* User info and logout */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border/30">
            <div className="flex items-center gap-2 text-foreground/80">
              {adminUser ? <Shield className="w-4 h-4 text-primary" /> : <User className="w-4 h-4" />}
              <span className="font-body text-[11px] tracking-[0.15em] uppercase">
                {user?.name || user?.email || "Guest"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="font-body text-[11px] md:text-[12px] font-semibold tracking-[0.22em] text-foreground border border-primary/60 px-5 py-2 hover:bg-primary hover:text-background transition-all duration-300 uppercase flex items-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
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
          {navItems.map((item) =>
            item.children?.length ? (
              <div key={item.label} className="flex flex-col items-center gap-4">
                <p className="font-display text-3xl text-foreground">{item.label}</p>
                <div className="flex flex-col items-center gap-3">
                  {item.children.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="font-body text-sm uppercase tracking-[0.22em] text-foreground/75 hover:text-primary transition-colors"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : item.href ? (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-3xl text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => setMobileOpen(false)}
                className="font-display text-3xl text-foreground transition-colors"
              >
                {item.label}
              </button>
            )
          )}
          
          {/* Mobile user info and logout */}
          <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-border/30 w-64">
            <div className="flex items-center gap-2 text-foreground/80">
              {adminUser ? <Shield className="w-4 h-4 text-primary" /> : <User className="w-4 h-4" />}
              <span className="font-body text-sm tracking-[0.15em] uppercase">
                {user?.name || user?.email || "Guest"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="font-body text-sm tracking-[0.2em] text-foreground border border-primary/50 px-8 py-3 hover:bg-primary hover:text-background transition-all duration-300 uppercase w-full text-center flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default DashboardNavbar;
