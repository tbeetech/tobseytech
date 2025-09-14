import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import LeadMagnetModal from "@/components/LeadMagnetModal";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PricingPage from "@/pages/pricing";
import ContactPage from "@/pages/contact";
import BookDemoPage from "@/pages/book-demo";
import CaseStudiesPage from "@/pages/case-studies";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/book-demo" component={BookDemoPage} />
      <Route path="/case-studies" component={CaseStudiesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LeadMagnetModal />
        <Toaster />
        <Router />
        <FloatingWhatsApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
