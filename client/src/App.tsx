import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
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
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:userId" component={ProfilePage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/dashboard" component={DashboardPage} />
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
          <FloatingWhatsApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
