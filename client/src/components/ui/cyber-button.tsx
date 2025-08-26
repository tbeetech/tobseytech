import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function CyberButton({ 
  children, 
  className, 
  size = "md", 
  ...props 
}: CyberButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-12 py-6 text-lg"
  };

  return (
    <button
      className={cn(
        "galactic-button font-orbitron font-bold relative overflow-hidden transition-all duration-300",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
