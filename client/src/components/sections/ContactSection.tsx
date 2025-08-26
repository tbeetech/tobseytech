import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type InsertContact } from "@shared/schema";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState<InsertContact>({
    name: "",
    email: "",
    projectType: "",
    budgetRange: "",
    message: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Transmitted Successfully!",
        description: "We will respond within 4 hours.",
      });
      setFormData({
        name: "",
        email: "",
        projectType: "",
        budgetRange: "",
        message: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: () => {
      toast({
        title: "Transmission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.projectType || !formData.budgetRange || !formData.message) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertContact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="page-section py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 gradient-text">
            INITIALIZE CONTACT
          </h2>
          <p className="text-xl text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Ready to transform your digital presence? Let's build the future together.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Form */}
          <div className="glass-effect p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-galactic-orange font-orbitron mb-2">Name</label>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white"
                  data-testid="input-name"
                />
              </div>
              <div>
                <label className="block text-galactic-orange font-orbitron mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white"
                  data-testid="input-email"
                />
              </div>
              <div>
                <label className="block text-galactic-orange font-orbitron mb-2">Project Type</label>
                <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                  <SelectTrigger className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white" data-testid="select-project-type">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="AI Integration">AI Integration</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="Branding & Design">Branding & Design</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-galactic-orange font-orbitron mb-2">Budget Range</label>
                <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange("budgetRange", value)}>
                  <SelectTrigger className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white" data-testid="select-budget-range">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="$25,000 - $50,000">$25,000 - $50,000</SelectItem>
                    <SelectItem value="$50,000+">$50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-galactic-orange font-orbitron mb-2">Project Details</label>
                <Textarea
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white h-32"
                  data-testid="textarea-message"
                />
              </div>
              <button
                type="submit"
                disabled={contactMutation.isPending}
                className="galactic-button w-full py-4 font-orbitron font-bold text-galactic-orange hover-glow"
                data-testid="button-submit-contact"
              >
                {contactMutation.isPending ? "TRANSMITTING..." : "TRANSMIT MESSAGE"}
              </button>
            </form>
          </div>
          
          {/* Contact Info & Animation */}
          <div className="space-y-8">
            <div className="glass-effect p-6 rounded-xl hover-glow">
              <h3 className="font-orbitron text-xl font-bold mb-4 text-galactic-gold">Direct Communications</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4" data-testid="contact-email">
                  <div className="w-12 h-12 bg-galactic-orange/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-galactic-orange" />
                  </div>
                  <div>
                    <div className="font-orbitron text-galactic-orange">Email</div>
                    <div className="text-gray-300">hello@tobseytech.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4" data-testid="contact-whatsapp">
                  <div className="w-12 h-12 bg-galactic-green/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-galactic-green" />
                  </div>
                  <div>
                    <div className="font-orbitron text-galactic-green">WhatsApp</div>
                    <div className="text-gray-300">+234 XXX XXX XXXX</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4" data-testid="contact-location">
                  <div className="w-12 h-12 bg-galactic-gold/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-galactic-gold" />
                  </div>
                  <div>
                    <div className="font-orbitron text-galactic-gold">Location</div>
                    <div className="text-gray-300">Nigeria (Remote/Global)</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Response Time */}
            <div className="glass-effect p-6 rounded-xl hover-glow">
              <h3 className="font-orbitron text-xl font-bold mb-4 text-galactic-red">Response Protocol</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Initial Response</span>
                  <span className="text-galactic-red font-bold">&lt; 4 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Detailed Proposal</span>
                  <span className="text-galactic-red font-bold">24-48 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Project Kickoff</span>
                  <span className="text-galactic-red font-bold">1-2 weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
