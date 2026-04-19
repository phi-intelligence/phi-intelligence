import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useProductionMonitoring } from "./hooks/use-production-monitoring";
import { useConditionalLogging } from "./hooks/use-conditional-logging";
import { useEffect } from "react";
import AOS from 'aos';

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Careers from "@/pages/careers";
import Insights from "@/pages/blog";
import Chat from "@/pages/chat";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { AdminProvider } from "@/contexts/AdminContext";

// Employee Portal
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { EmployeeGuard } from "@/components/employee/EmployeeGuard";
import EmployeeLogin from "@/pages/employee/EmployeeLogin";
import EmployeeLayout from "@/pages/employee/EmployeeLayout";
import EmployeeHome, { EmployeeOnly, AdminOnly } from "@/pages/employee/EmployeeHome";
import AttendanceClock from "@/pages/employee/attendance/AttendanceClock";
import AttendanceHistory from "@/pages/employee/attendance/AttendanceHistory";
import Leaves from "@/pages/employee/leaves/Leaves";
import MyTasks from "@/pages/employee/tasks/MyTasks";
import ProjectList from "@/pages/employee/projects/ProjectList";
import ProjectDetail from "@/pages/employee/projects/ProjectDetail";
import TaskBoard from "@/pages/employee/projects/TaskBoard";
import Timesheet from "@/pages/employee/time/Timesheet";
import ApprovalsDefaultRoute from "@/pages/employee/admin/ApprovalsDefaultRoute";
import ApprovalsLeaveRoute from "@/pages/employee/admin/ApprovalsLeaveRoute";
import EmployeeAdminDashboard from "@/pages/employee/admin/EmployeeAdminDashboard";
import EmployeeDirectory from "@/pages/employee/admin/EmployeeDirectory";
import EmployeeAdminSettings from "@/pages/employee/admin/EmployeeAdminSettings";
import EmployeeAnalytics from "@/pages/employee/admin/EmployeeAnalytics";
import AdminAttendanceReport from "@/pages/employee/attendance/AdminAttendanceReport";
import PlanPage from "@/pages/employee/ai/PlanPage";
import ReportPage from "@/pages/employee/ai/ReportPage";
import ProjectFormPage from "@/pages/employee/projects/ProjectFormPage";
import AdminReports from "@/pages/employee/admin/AdminReports";

// Service Pages
import ServicesIndex from "@/pages/services";
import AIConsultingPage from "@/pages/services/AIConsultingPage";
import DocumentProcessingPage from "@/pages/services/DocumentProcessingPage";
import VoiceAutomationPage from "@/pages/services/VoiceAutomationPage";
import DigitalMarketingPage from "@/pages/services/DigitalMarketingPage";
import AIDevelopmentPage from "@/pages/services/AIDevelopmentPage";
import SaaSPage from "@/pages/services/SaaSPage";
import WebDevelopmentPage from "@/pages/services/WebDevelopmentPage";
import MobileAppPage from "@/pages/services/MobileAppPage";
import ProcessAutomationPage from "@/pages/services/ProcessAutomationPage";
import ComputerVisionPage from "@/pages/services/ComputerVisionPage";

// Other Pages
import TechnologyPage from "@/pages/technology";
import IndustriesPage from "@/pages/industries";
import PortfolioPage from "@/pages/portfolio";
import ProductsPage from "@/pages/products";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/company/ContactPage";

// Careers Pages
import JobApplicationForm from "@/pages/careers/apply/[jobId]";



function Router() {
  const { trackNavigation } = useProductionMonitoring();
  const { info } = useConditionalLogging();
  const [location] = useLocation();

  // Normalize trailing slashes for consistent routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== '/' && path.endsWith('/')) {
      const newPath = path.slice(0, -1);
      window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
      info(`Normalized URL: ${path} → ${newPath}`, undefined, 'Router', 'url-normalization');
    }
  }, [info]);

  // Scroll to top when route changes and initialize AOS
  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.init({
      duration: 1000,
      easing: 'ease-out',
      once: true,
      offset: 100
    });
  }, [location]);

  // Track route changes
  const handleRouteChange = (path: string) => {
    trackNavigation(window.location.pathname, path);
    info(`Route changed to: ${path}`, undefined, 'Router', 'navigation');
  };

  const isChatRoute = location === "/chat";
  const isEmployeeRoute = location.startsWith("/employee");
  const hideHeaderFooter = isChatRoute || isEmployeeRoute;

  return (
    <div className="min-h-screen bg-black text-white">
      {!hideHeaderFooter && <Navigation />}
      <Switch>
        <Route path="/" component={Home} />

        {/* Services Routes */}
        <Route path="/services" component={ServicesIndex} />
        <Route path="/services/ai-consulting" component={AIConsultingPage} />
        <Route path="/services/document-processing" component={DocumentProcessingPage} />
        <Route path="/services/voice-automation" component={VoiceAutomationPage} />
        <Route path="/services/digital-marketing" component={DigitalMarketingPage} />
        <Route path="/services/ai-development" component={AIDevelopmentPage} />
        <Route path="/services/saas" component={SaaSPage} />
        <Route path="/services/web-development" component={WebDevelopmentPage} />
        <Route path="/services/mobile-development" component={MobileAppPage} />
        <Route path="/services/process-automation" component={ProcessAutomationPage} />
        <Route path="/services/computer-vision" component={ComputerVisionPage} />

        {/* Company Routes */}
        <Route path="/about" component={AboutPage} />
        <Route path="/technology" component={TechnologyPage} />
        <Route path="/industries" component={IndustriesPage} />
        <Route path="/portfolio" component={PortfolioPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/contact" component={ContactPage} />

        {/* Careers Routes */}
        <Route path="/careers" component={Careers} />
        <Route path="/careers/apply/:jobId" component={JobApplicationForm} />

        {/* Admin Routes - PROTECTED */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/*">
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        </Route>

        {/* Employee Portal Routes */}
        <Route path="/employee/login" component={EmployeeLogin} />
        {/* /employee/*? matches /employee and /employee/... (bare /employee is not matched by /employee/* alone in wouter v3) */}
        <Route path="/employee/*?">
          <EmployeeGuard>
            <EmployeeLayout>
              <Switch>
                <Route path="/employee" component={EmployeeHome} />
                <Route path="/employee/admin/dashboard" component={EmployeeAdminDashboard} />
                <Route path="/employee/admin/employees" component={EmployeeDirectory} />
                <Route path="/employee/admin/settings" component={EmployeeAdminSettings} />
                <Route path="/employee/admin/analytics" component={EmployeeAnalytics} />
                <Route path="/employee/admin/reports" component={AdminReports} />
                <Route path="/employee/attendance/admin" component={AdminAttendanceReport} />
                <Route path="/employee/attendance/history">
                  <EmployeeOnly><AttendanceHistory /></EmployeeOnly>
                </Route>
                <Route path="/employee/attendance">
                  <EmployeeOnly><AttendanceClock /></EmployeeOnly>
                </Route>
                <Route path="/employee/ai/plan">
                  <AdminOnly><PlanPage /></AdminOnly>
                </Route>
                <Route path="/employee/ai/report">
                  <EmployeeOnly><ReportPage /></EmployeeOnly>
                </Route>
                <Route path="/employee/leaves">
                  <EmployeeOnly><Leaves /></EmployeeOnly>
                </Route>
                <Route path="/employee/tasks">
                  <EmployeeOnly><MyTasks /></EmployeeOnly>
                </Route>
                <Route path="/employee/projects/new">
                  <AdminOnly><ProjectFormPage /></AdminOnly>
                </Route>
                <Route path="/employee/projects/:id/edit" component={ProjectFormPage} />
                <Route path="/employee/projects/:id/tasks" component={TaskBoard} />
                <Route path="/employee/projects/:id" component={ProjectDetail} />
                <Route path="/employee/projects" component={ProjectList} />
                <Route path="/employee/timesheet">
                  <EmployeeOnly><Timesheet /></EmployeeOnly>
                </Route>
                <Route path="/employee/time/approvals" component={ApprovalsDefaultRoute} />
                <Route path="/employee/leave/admin" component={ApprovalsLeaveRoute} />
                <Route path="/employee/approvals" component={ApprovalsDefaultRoute} />
              </Switch>
            </EmployeeLayout>
          </EmployeeGuard>
        </Route>

        {/* Other Routes */}
        <Route path="/insights" component={Insights} />
        <Route path="/blog" component={Insights} />
        <Route path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  const { trackPageLoad } = useProductionMonitoring();
  const { info } = useConditionalLogging();

  useEffect(() => {
    trackPageLoad();
    info('Application initialized', undefined, 'App', 'initialization');
  }, [trackPageLoad, info]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminProvider>
            <EmployeeProvider>
              <Toaster />
              <Router />
            </EmployeeProvider>
          </AdminProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
