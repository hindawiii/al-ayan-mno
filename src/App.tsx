import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Simulations from "./pages/Simulations";
import Pharmacist from "./pages/Pharmacist";
import Community from "./pages/Community";
import MassageCare from "./pages/MassageCare";
import FirstAid from "./pages/FirstAid";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/simulations" element={<Simulations />} />
              <Route path="/pharmacist" element={<Pharmacist />} />
              <Route path="/community" element={<Community />} />
              <Route path="/massage" element={<MassageCare />} />
              <Route path="/first-aid" element={<FirstAid />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
