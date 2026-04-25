import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CourseProvider } from "@/hooks/useCourse";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Catalog from "./pages/Catalog.tsx";
import Lab from "./pages/Lab.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import ProgressPage from "./pages/Progress.tsx";
import Exam from "./pages/Exam.tsx";
import PortalSandbox from "./pages/PortalSandbox.tsx";
import Licensing from "./pages/Licensing.tsx";
import Tenant from "./pages/Tenant.tsx";
import Defender from "./pages/Defender.tsx";
import Purview from "./pages/Purview.tsx";
import SessionPlan from "./pages/SessionPlan.tsx";
import Module from "./pages/Module.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CourseProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/lab/:slug" element={<Lab />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/session-plan" element={<SessionPlan />} />
            <Route path="/module/:slug" element={<Module />} />
            <Route path="/defender" element={<Defender />} />
            <Route path="/portal/:sim" element={<PortalSandbox />} />
            <Route path="/purview" element={<Purview />} />
            <Route path="/tenant" element={<Tenant />} />
            <Route path="/licensing" element={<Licensing />} />
            <Route path="/instructor/cohort" element={<Placeholder title="Instructor Cockpit" breadcrumb={[{ label: "Instructor" }, { label: "Cohort" }]} />} />
            <Route path="/admin/content" element={<Placeholder title="Content Management" breadcrumb={[{ label: "Admin" }, { label: "Content" }]} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CourseProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
