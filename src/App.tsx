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
import LabSimulator from "./pages/LabSimulator.tsx";
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
import CsaProgram from "./pages/CsaProgram.tsx";
import K8sProgram from "./pages/K8sProgram.tsx";
import CdlProgram from "./pages/CdlProgram.tsx";
import CcnaProgram from "./pages/CcnaProgram.tsx";
import Pending from "./pages/Pending.tsx";
import AdminEnrollments from "./pages/AdminEnrollments.tsx";
import AdminBatches from "./pages/AdminBatches.tsx";
import AdminLearners from "./pages/AdminLearners.tsx";
import AdminLearnerDetail from "./pages/AdminLearnerDetail.tsx";
import Terms from "./pages/Terms.tsx";
import InstructorCohort from "./pages/InstructorCohort.tsx";
import AdminContent from "./pages/AdminContent.tsx";
import Demo from "./pages/Demo.tsx";
import { OpsLayout } from "./ops/layout/OpsLayout.tsx";
import OpsDashboard from "./ops/pages/OpsDashboard.tsx";
import IncidentsList from "./ops/modules/itsm/IncidentsList.tsx";
import IncidentDetail from "./ops/modules/itsm/IncidentDetail.tsx";
import ProblemsList from "./ops/modules/itsm/ProblemsList.tsx";
import ProblemDetail from "./ops/modules/itsm/ProblemDetail.tsx";
import ChangesList from "./ops/modules/itsm/ChangesList.tsx";
import ChangeDetail from "./ops/modules/itsm/ChangeDetail.tsx";
import CmdbList from "./ops/modules/itsm/CmdbList.tsx";
import CmdbDetail from "./ops/modules/itsm/CmdbDetail.tsx";
import AlertsList from "./ops/modules/soc/AlertsList.tsx";
import AlertDetail from "./ops/modules/soc/AlertDetail.tsx";
import NotablesList from "./ops/modules/soc/NotablesList.tsx";
import NotableDetail from "./ops/modules/soc/NotableDetail.tsx";
import SplunkLive from "./ops/pages/SplunkLive.tsx";
import ServicesList from "./ops/modules/sre/ServicesList.tsx";
import ServiceDetail from "./ops/modules/sre/ServiceDetail.tsx";
import SlosList from "./ops/modules/sre/SlosList.tsx";
import MonitoringList from "./ops/modules/sre/MonitoringList.tsx";
import ClustersList from "./ops/modules/k8s/ClustersList.tsx";
import WorkloadsList from "./ops/modules/k8s/WorkloadsList.tsx";
import PodsList from "./ops/modules/k8s/PodsList.tsx";
import ContainersList from "./ops/modules/k8s/ContainersList.tsx";
import PipelinesList from "./ops/modules/devops/PipelinesList.tsx";
import DeploymentsList from "./ops/modules/devops/DeploymentsList.tsx";
import RepositoriesList from "./ops/modules/devops/RepositoriesList.tsx";
import AccountsList from "./ops/modules/cloud/AccountsList.tsx";
import ResourcesList from "./ops/modules/cloud/ResourcesList.tsx";
import CostsList from "./ops/modules/cloud/CostsList.tsx";

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
            <Route path="/csa" element={<CsaProgram />} />
            <Route path="/k8s" element={<K8sProgram />} />
            <Route path="/cdl" element={<CdlProgram />} />
            <Route path="/ccna" element={<CcnaProgram />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
            <Route path="/admin/batches" element={<AdminBatches />} />
            <Route path="/admin/learners" element={<AdminLearners />} />
            <Route path="/admin/learners/:userId" element={<AdminLearnerDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/lab/:slug" element={<Lab />} />
            <Route path="/lab/:slug/sim" element={<LabSimulator />} />
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
            <Route path="/demo" element={<Demo />} />
            <Route path="/ops" element={<OpsLayout />}>
              <Route index element={<OpsDashboard />} />
              <Route path="incidents" element={<IncidentsList />} />
              <Route path="incidents/:number" element={<IncidentDetail />} />
              <Route path="problems" element={<ProblemsList />} />
              <Route path="problems/:number" element={<ProblemDetail />} />
              <Route path="changes" element={<ChangesList />} />
              <Route path="changes/:number" element={<ChangeDetail />} />
              <Route path="cmdb" element={<CmdbList />} />
              <Route path="cmdb/:id" element={<CmdbDetail />} />
              <Route path="alerts" element={<AlertsList />} />
              <Route path="alerts/:id" element={<AlertDetail />} />
              <Route path="notables" element={<NotablesList />} />
              <Route path="notables/:id" element={<NotableDetail />} />
              <Route path="monitoring" element={<MonitoringList />} />
              <Route path="sre" element={<ServicesList />} />
              <Route path="sre/services" element={<ServicesList />} />
              <Route path="sre/services/:id" element={<ServiceDetail />} />
              <Route path="sre/slos" element={<SlosList />} />
              <Route path="k8s" element={<ClustersList />} />
              <Route path="k8s/clusters" element={<ClustersList />} />
              <Route path="k8s/workloads" element={<WorkloadsList />} />
              <Route path="k8s/pods" element={<PodsList />} />
              <Route path="k8s/containers" element={<ContainersList />} />
              <Route path="devops" element={<PipelinesList />} />
              <Route path="devops/pipelines" element={<PipelinesList />} />
              <Route path="devops/deployments" element={<DeploymentsList />} />
              <Route path="devops/repos" element={<RepositoriesList />} />
              <Route path="cloud" element={<AccountsList />} />
              <Route path="cloud/accounts" element={<AccountsList />} />
              <Route path="cloud/resources" element={<ResourcesList />} />
              <Route path="cloud/costs" element={<CostsList />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CourseProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
