import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { RoleProvider } from "@/hooks/useRole";
import { CreditsProvider } from "@/hooks/useCredits";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Product from "./pages/Product";
import UseCases from "./pages/UseCases";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

// Dashboard imports
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import GeneratePage from "./pages/dashboard/GeneratePage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import ProjectDetailPage from "./pages/dashboard/ProjectDetailPage";
import HistoryPage from "./pages/dashboard/HistoryPage";
import UsagePage from "./pages/dashboard/UsagePage";
import SettingsPage from "./pages/dashboard/SettingsPage";

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUsage from "./pages/admin/AdminUsage";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminFlags from "./pages/admin/AdminFlags";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
  <AuthProvider>
      <SubscriptionProvider>
        <CreditsProvider>
          <RoleProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product" element={<Product />} />
                <Route path="/use-cases" element={<UseCases />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="generate" element={<GeneratePage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="usage" element={<UsagePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="usage" element={<AdminUsage />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="flags" element={<AdminFlags />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RoleProvider>
        </CreditsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
