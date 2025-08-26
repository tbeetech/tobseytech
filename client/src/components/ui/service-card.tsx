import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  className?: string;
}

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  features,
  gradient,
  className,
  ...props
}: ServiceCardProps) {
  return (
    <div 
      className={cn("service-card p-6 rounded-xl hover-glow transition-all duration-300", className)}
      {...props}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-lg mb-4 flex items-center justify-center`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-orbitron text-xl font-bold mb-3 text-galactic-orange">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <ul className="text-sm text-gray-400 space-y-1">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
    </div>
  );
}
