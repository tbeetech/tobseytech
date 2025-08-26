import { LucideIcon } from "lucide-react";
import CyberButton from "@/components/ui/cyber-button";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  courseCount: string;
  color: string;
  className?: string;
}

export default function CourseCard({
  icon: Icon,
  title,
  description,
  courseCount,
  color,
  className,
  ...props
}: CourseCardProps) {
  const colorClasses = {
    "cyber-blue": "from-cyber-blue to-cyber-cyan",
    "cyber-purple": "from-cyber-purple to-cyber-pink",
    "cyber-green": "from-cyber-green to-cyber-cyan"
  };

  return (
    <div 
      className={cn("course-card p-6 rounded-xl hover-glow transition-all duration-300", className)}
      {...props}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses["cyber-blue"]} rounded-lg mb-4 flex items-center justify-center`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className={`font-orbitron text-xl font-bold mb-3 text-${color}`}>{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <div className="text-sm text-gray-400 mb-4">{courseCount}</div>
      <CyberButton 
        size="sm"
        className={`w-full text-${color}`}
      >
        Explore Courses
      </CyberButton>
    </div>
  );
}
