import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PricingPage from "@/pages/pricing";
import ContactPage from "@/pages/contact";
import CaseStudiesPage from "@/pages/case-studies";
import AuthPage from "@/pages/auth";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import BlogEditorPage from "@/pages/blog-editor";
import ProfilePage from "@/pages/profile";
import ChatPage from "@/pages/chat";
import DashboardPage from "@/pages/dashboard";
import FeaturesPage from "@/pages/features";
import LearningPathPage from "@/pages/learning-path";
import CareerHubPage from "@/pages/career-hub";
import FeatureROICalculatorPage from "@/pages/feature-roi-calculator";
import FeatureInnovationRoadmapPage from "@/pages/feature-innovation-roadmap";
import FeatureSkillsQuizPage from "@/pages/feature-skills-quiz";
import FeatureTechTrendsPage from "@/pages/feature-tech-trends";
import FeatureResourcesPage from "@/pages/feature-resources";
import FeatureServiceComparisonPage from "@/pages/feature-service-comparison";
import FeatureStartupToolkitPage from "@/pages/feature-startup-toolkit";
import FeatureSportaPage from "@/pages/feature-sporta";
import SportaPage from "@/pages/sporta";
import ProphetChat from "@/components/ProphetChat";
import TestDataPage from "@/pages/testdata";
import VlogPage from "@/pages/vlog";
import VlogPostPage from "@/pages/vlog-post";
import AdminSpeedCrackerPage from "@/pages/admin-speed-cracker";
import AdminSpeedCrackerWorkflowsPage from "@/pages/admin-speed-cracker-workflows";
import AdminSpeedCrackerApprovalPage from "@/pages/admin-speed-cracker-approval";
import AdminSpeedCrackerVlogPage from "@/pages/admin-speed-cracker-vlog";
import AdminSpeedCrackerBlogPage from "@/pages/admin-speed-cracker-blog";
import AdminSpeedCrackerAnalyticsPage from "@/pages/admin-speed-cracker-analytics";
import AdminSpeedCrackerSettingsPage from "@/pages/admin-speed-cracker-settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/contact" component={ContactPage} />
      {/* Book-demo redirects to contact */}
      <Route path="/book-demo"><Redirect to="/contact" /></Route>
      <Route path="/case-studies" component={CaseStudiesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/new" component={BlogEditorPage} />
      <Route path="/blog/edit/:id" component={BlogEditorPage} />
      <Route path="/blog/slug/:slug">
        {(params) => <Redirect to={`/blog/${params.slug}`} />}
      </Route>
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:userId" component={ProfilePage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/learning-path" component={LearningPathPage} />
      <Route path="/career-hub" component={CareerHubPage} />
      <Route path="/feature/roi-calculator" component={FeatureROICalculatorPage} />
      <Route path="/feature/innovation-roadmap" component={FeatureInnovationRoadmapPage} />
      <Route path="/feature/skills-quiz" component={FeatureSkillsQuizPage} />
      <Route path="/feature/tech-trends" component={FeatureTechTrendsPage} />
      {/* Removed features — redirect to features hub */}
      <Route path="/feature/challenges"><Redirect to="/features" /></Route>
      <Route path="/feature/investor-metrics"><Redirect to="/features" /></Route>
      <Route path="/feature/mentorship"><Redirect to="/features" /></Route>
      <Route path="/feature/live-demo"><Redirect to="/features" /></Route>
      <Route path="/feature/global-impact"><Redirect to="/features" /></Route>
      {/* Partner network is now part of About, no longer a standalone feature */}
      <Route path="/feature/partners"><Redirect to="/#about" /></Route>
      <Route path="/feature/resources" component={FeatureResourcesPage} />
      <Route path="/feature/service-comparison" component={FeatureServiceComparisonPage} />
      <Route path="/feature/startup-toolkit" component={FeatureStartupToolkitPage} />
      <Route path="/feature/sporta" component={FeatureSportaPage} />
      {/* SPORTA — accessible to all authenticated users */}
      <Route path="/sporta" component={SportaPage} />
      <Route path="/testdata" component={TestDataPage} />
      {/* Vlog (public) */}
      <Route path="/vlog" component={VlogPage} />
      <Route path="/vlog/:slug" component={VlogPostPage} />
      {/* Speed Cracker — admin-only routes */}
      <Route path="/admin/speed-cracker" component={AdminSpeedCrackerPage} />
      <Route path="/admin/speed-cracker/workflows" component={AdminSpeedCrackerWorkflowsPage} />
      <Route path="/admin/speed-cracker/approval-center" component={AdminSpeedCrackerApprovalPage} />
      <Route path="/admin/speed-cracker/vlog-manager" component={AdminSpeedCrackerVlogPage} />
      <Route path="/admin/speed-cracker/blog-manager" component={AdminSpeedCrackerBlogPage} />
      <Route path="/admin/speed-cracker/analytics" component={AdminSpeedCrackerAnalyticsPage} />
      <Route path="/admin/speed-cracker/settings" component={AdminSpeedCrackerSettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
            <ProphetChat />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
