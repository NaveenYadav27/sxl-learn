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
import SessionPlanDuration from "./pages/SessionPlanDuration.tsx";
import Module from "./pages/Module.tsx";
import ServiceNowJourney from "./pages/ServiceNowJourney.tsx";
import SocProgram from "./pages/SocProgram.tsx";
import ItsmProgram from "./pages/ItsmProgram.tsx";
import Pen200Program from "./pages/Pen200Program.tsx";
import Pending from "./pages/Pending.tsx";
import AdminEnrollments from "./pages/AdminEnrollments.tsx";
import AdminLearners from "./pages/AdminLearners.tsx";
import AdminLearnerDetail from "./pages/AdminLearnerDetail.tsx";
import Terms from "./pages/Terms.tsx";
import InstructorCohort from "./pages/InstructorCohort.tsx";
import AdminContent from "./pages/AdminContent.tsx";

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
            <Route path="/soc" element={<SocProgram />} />
            <Route path="/itsm" element={<ItsmProgram />} />
            <Route path="/pen200" element={<Pen200Program />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
            <Route path="/admin/learners" element={<AdminLearners />} />
            <Route path="/admin/learners/:userId" element={<AdminLearnerDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/lab/:slug" element={<Lab />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/session-plan" element={<SessionPlan />} />
            <Route path="/session-plan/:duration" element={<SessionPlanDuration />} />
            <Route path="/module/:slug" element={<Module />} />
            <Route path="/defender" element={<Defender />} />
            <Route path="/portal/:sim" element={<PortalSandbox />} />
            <Route path="/purview" element={<Purview />} />
            <Route path="/tenant" element={<Tenant />} />
            <Route path="/licensing" element={<Licensing />} />
            <Route path="/servicenow-journey" element={<ServiceNowJourney />} />
            <Route path="/instructor/cohort" element={<InstructorCohort />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CourseProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
