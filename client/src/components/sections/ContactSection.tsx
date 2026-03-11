import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type InsertContact } from "@shared/schema";
import { Mail, MessageCircle, Linkedin } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent" });
      setFormData({ name: "", email: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: () => {
      toast({ title: "Transmission failed", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    contactMutation.mutate({
      name: formData.name,
      email: formData.email,
      message: formData.message,
      projectType: "",
      budgetRange: "",
    });
  };

  return (
    <section id="contact" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Contact
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Let's talk about your automation goals.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="glass-effect p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-neon-yellow font-orbitron">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-neon-yellow font-orbitron">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-neon-yellow font-orbitron">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-deep-space border-galactic-orange/30 focus:border-galactic-orange text-white h-32"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-neon-yellow text-black font-medium rounded-lg hover:bg-yellow-400"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-neon-yellow" />
              <a href="mailto:hello@tobseytech.com" className="text-gray-300">
                hello@tobseytech.com
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <MessageCircle className="w-6 h-6 text-neon-yellow" />
              <a href="https://wa.me/2340000000000" className="text-gray-300" target="_blank" rel="noopener">
                WhatsApp
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://www.linkedin.com/in/oyebade-tobi/" target="_blank" rel="noopener noreferrer" className="text-neon-yellow" aria-label="LinkedIn">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
