import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import LeadMagnetModal from "@/components/LeadMagnetModal";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PricingPage from "@/pages/pricing";
import ContactPage from "@/pages/contact";
import BookDemoPage from "@/pages/book-demo";
import CaseStudiesPage from "@/pages/case-studies";
import AuthPage from "@/pages/auth";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import BlogEditorPage from "@/pages/blog-editor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/book-demo" component={BookDemoPage} />
      <Route path="/case-studies" component={CaseStudiesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/new" component={BlogEditorPage} />
      <Route path="/blog/edit/:id" component={BlogEditorPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LeadMagnetModal />
          <Toaster />
          <Router />
          <FloatingWhatsApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
