import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCursor from "./components/CustomCursor";
import WebsitePreloader from "./components/WebsitePreloader";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MIN_PRELOADER_MS = 1100;

const App = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    let isWindowLoaded = document.readyState === "complete";
    let hasMinDelayPassed = false;

    document.body.style.overflow = "hidden";

    const closeWhenReady = () => {
      if (!isWindowLoaded || !hasMinDelayPassed) return;

      setShowPreloader(false);
      document.body.style.overflow = "";
    };

    const onWindowLoad = () => {
      isWindowLoaded = true;
      closeWhenReady();
    };

    window.addEventListener("load", onWindowLoad);

    const minDelayTimer = window.setTimeout(() => {
      hasMinDelayPassed = true;
      closeWhenReady();
    }, MIN_PRELOADER_MS);

    return () => {
      window.clearTimeout(minDelayTimer);
      window.removeEventListener("load", onWindowLoad);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CustomCursor />
        <WebsitePreloader isVisible={showPreloader} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
