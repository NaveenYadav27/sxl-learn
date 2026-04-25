import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Catalog from "./pages/Catalog.tsx";
import Lab from "./pages/Lab.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import ProgressPage from "./pages/Progress.tsx";
import Exam from "./pages/Exam.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/lab/:slug" element={<Lab />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/portal/entra" element={<Placeholder title="Microsoft Entra simulator" breadcrumb={[{ label: "Simulators" }, { label: "Entra" }]} />} />
            <Route path="/portal/defender" element={<Placeholder title="Defender XDR simulator" breadcrumb={[{ label: "Simulators" }, { label: "Defender" }]} />} />
            <Route path="/portal/purview" element={<Placeholder title="Microsoft Purview simulator" breadcrumb={[{ label: "Simulators" }, { label: "Purview" }]} />} />
            <Route path="/portal/sentinel" element={<Placeholder title="Microsoft Sentinel simulator" breadcrumb={[{ label: "Simulators" }, { label: "Sentinel" }]} />} />
            <Route path="/instructor/cohort" element={<Placeholder title="Instructor Cockpit" breadcrumb={[{ label: "Instructor" }, { label: "Cohort" }]} />} />
            <Route path="/admin/content" element={<Placeholder title="Content Management" breadcrumb={[{ label: "Admin" }, { label: "Content" }]} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
