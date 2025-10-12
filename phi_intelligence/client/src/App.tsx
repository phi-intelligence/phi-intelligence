import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// FrameworkWrapper removed - will be loaded only on voice pages
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useProductionMonitoring } from "./hooks/use-production-monitoring";
import { useConditionalLogging } from "./hooks/use-conditional-logging";
import { useEffect } from "react";
import AOS from 'aos';

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Products from "@/pages/products";
import Careers from "@/pages/careers";
import Blog from "@/pages/blog";
import Chat from "@/pages/chat";
import VoicebotDashboard from "@/pages/VoicebotDashboard";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { AdminProvider } from "@/contexts/AdminContext";

// Service Pages
import AIMLPage from "@/pages/services/AIMLPage";
import SoftwareDevelopmentPage from "@/pages/services/SoftwareDevelopmentPage";
import IoTPage from "@/pages/services/IoTPage";
import DataSciencePage from "@/pages/services/DataSciencePage";
import CustomVoiceBotsPage from "@/pages/services/CustomVoiceBotsPage";
import ConversationalAIPage from "@/pages/services/ConversationalAIPage";
import AgenticSoftwarePage from "@/pages/services/AgenticSoftwarePage";
import SmartHomesPage from "@/pages/services/SmartHomesPage";
import AICamerasPage from "@/pages/services/AICamerasPage";
import SmartNotificationsPage from "@/pages/services/SmartNotificationsPage";
import AIBusinessIntelligencePage from "@/pages/services/AIBusinessIntelligencePage";
import CustomAnalyticsPage from "@/pages/services/CustomAnalyticsPage";
import WebDevelopmentPage from "@/pages/services/WebDevelopmentPage";
import MobileDevelopmentPage from "@/pages/services/MobileDevelopmentPage";

// Product Pages
import WorkstreamPage from "@/pages/products/WorkstreamPage";
import VoicebotBuilderPage from "@/pages/products/VoicebotBuilderPage";

// Company Pages
import RDPage from "@/pages/company/RDPage";
import ContactPage from "@/pages/company/ContactPage";
import AboutPage from "@/pages/about";

// Careers Pages
import JobApplicationForm from "@/pages/careers/apply/[jobId]";



function Router() {
  const { trackNavigation } = useProductionMonitoring();
  const { info } = useConditionalLogging();
  const [location] = useLocation();

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

  // Don't show navigation on chat page and voicebot dashboard
  const showNavigation = location !== '/chat' && location !== '/voicebot-dashboard';

  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {showNavigation && <Navigation />}
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Service Routes */}
        <Route path="/services" component={Services} />
        <Route path="/services/ai-ml" component={AIMLPage} />
        <Route path="/services/software-development" component={SoftwareDevelopmentPage} />
        <Route path="/services/iot" component={IoTPage} />
        <Route path="/services/data-science" component={DataSciencePage} />
        <Route path="/services/custom-voice-bots" component={CustomVoiceBotsPage} />
        <Route path="/services/conversational-ai" component={ConversationalAIPage} />
        <Route path="/services/agentic-software" component={AgenticSoftwarePage} />

        <Route path="/services/smart-homes" component={SmartHomesPage} />
        <Route path="/services/ai-cameras" component={AICamerasPage} />
        <Route path="/services/smart-notifications" component={SmartNotificationsPage} />
        <Route path="/services/ai-business-intelligence" component={AIBusinessIntelligencePage} />
        <Route path="/services/custom-analytics" component={CustomAnalyticsPage} />
        <Route path="/services/web-development" component={WebDevelopmentPage} />
        <Route path="/services/mobile-development" component={MobileDevelopmentPage} />
        
        {/* Product Routes */}
        <Route path="/products" component={Products} />
        <Route path="/products/workstream" component={WorkstreamPage} />
        <Route path="/products/voicebot-builder" component={VoicebotBuilderPage} />
        
        {/* Company Routes */}
        <Route path="/about" component={AboutPage} />
        <Route path="/company/rd" component={RDPage} />
        <Route path="/company/contact" component={ContactPage} />
        
        {/* Careers Routes */}
        <Route path="/careers/apply/:jobId" component={JobApplicationForm} />
        
        {/* Admin Routes - PROTECTED */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/*">
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        </Route>
        
        {/* Other Routes */}
        <Route path="/careers" component={Careers} />
        <Route path="/blog" component={Blog} />
        <Route path="/chat" component={Chat} />
        <Route path="/voicebot-dashboard" component={VoicebotDashboard} />
        <Route component={NotFound} />
      </Switch>
      {showNavigation && <Footer />}
    </div>
  );
}

function App() {
  const { trackPageLoad } = useProductionMonitoring();
  const { info } = useConditionalLogging();

  // Track app initialization
  useEffect(() => {
    trackPageLoad();
    info('Application initialized', undefined, 'App', 'initialization');
  }, [trackPageLoad, info]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminProvider>
            <Toaster />
            <Router />

          </AdminProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
