import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PricingPage from "@/pages/pricing";
import ContactPage from "@/pages/contact";
import BookDemoPage from "@/pages/book-demo";
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
import FeatureChallengesPage from "@/pages/feature-challenges";
import FeatureResourcesPage from "@/pages/feature-resources";
import FeatureInvestorMetricsPage from "@/pages/feature-investor-metrics";
import FeatureServiceComparisonPage from "@/pages/feature-service-comparison";
import FeatureStartupToolkitPage from "@/pages/feature-startup-toolkit";
import FeaturePartnersPage from "@/pages/feature-partners";
import FeatureMentorshipPage from "@/pages/feature-mentorship";
import FeatureLiveDemoPage from "@/pages/feature-live-demo";
import FeatureGlobalImpactPage from "@/pages/feature-global-impact";
import ProphetChat from "@/components/ProphetChat";
import CosmoResearchPanel from "@/components/CosmoResearchPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/book-demo" component={BookDemoPage} />
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
      <Route path="/feature/challenges" component={FeatureChallengesPage} />
      <Route path="/feature/resources" component={FeatureResourcesPage} />
      <Route path="/feature/investor-metrics" component={FeatureInvestorMetricsPage} />
      <Route path="/feature/service-comparison" component={FeatureServiceComparisonPage} />
      <Route path="/feature/startup-toolkit" component={FeatureStartupToolkitPage} />
      <Route path="/feature/partners" component={FeaturePartnersPage} />
      <Route path="/feature/mentorship" component={FeatureMentorshipPage} />
      <Route path="/feature/live-demo" component={FeatureLiveDemoPage} />
      <Route path="/feature/global-impact" component={FeatureGlobalImpactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
          <ProphetChat />
          <CosmoResearchPanel />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
