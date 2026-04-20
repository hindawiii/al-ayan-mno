import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppLayout from "@/components/AppLayout";
import ScrollToTop from "@/components/ScrollToTop";
import "./i18n";

const Index = lazy(() => import("./pages/Index"));
const Simulations = lazy(() => import("./pages/Simulations"));
const Pharmacist = lazy(() => import("./pages/Pharmacist"));
const Community = lazy(() => import("./pages/Community"));
const MassageCare = lazy(() => import("./pages/MassageCare"));
const FirstAid = lazy(() => import("./pages/FirstAid"));
const About = lazy(() => import("./pages/About"));
const BloodTypes = lazy(() => import("./pages/BloodTypes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/simulations" element={<Simulations />} />
                <Route path="/pharmacist" element={<Pharmacist />} />
                <Route path="/community" element={<Community />} />
                <Route path="/massage" element={<MassageCare />} />
                <Route path="/first-aid" element={<FirstAid />} />
                <Route path="/blood-types" element={<BloodTypes />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
