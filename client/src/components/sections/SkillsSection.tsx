import { useQuery } from "@tanstack/react-query";
import CourseCard from "@/components/ui/course-card";
import CyberButton from "@/components/ui/cyber-button";
import { Brain, Code, Shield } from "lucide-react";
import { type Course } from "@shared/schema";

export default function SkillsSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: featuredCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses/featured"],
  });

  const categories = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      description: "Master artificial intelligence, neural networks, and advanced algorithms",
      courseCount: "12 Courses • 80+ Hours",
      color: "cyber-blue"
    },
    {
      icon: Code,
      title: "Full-Stack Development",
      description: "Complete web development from frontend to backend and deployment",
      courseCount: "15 Courses • 120+ Hours",
      color: "cyber-purple"
    },
    {
      icon: Shield,
      title: "Cybersecurity",
      description: "Advanced security protocols, ethical hacking, and threat analysis",
      courseCount: "8 Courses • 60+ Hours",
      color: "cyber-green"
    }
  ];

  const featuredCourse = featuredCourses?.[0];

  if (isLoading) {
    return (
      <section id="skills" className="page-section py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 text-glow text-cyber-blue">
              SKILLS ACADEMY
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Loading our comprehensive learning platform...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="page-section py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 gradient-text">
            SKILLS ACADEMY
          </h2>
          <p className="text-xl text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Master cutting-edge technologies with our comprehensive online learning platform
          </p>
        </div>
        
        {/* Course Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {categories.map((category, index) => (
            <CourseCard
              key={category.title}
              icon={category.icon}
              title={category.title}
              description={category.description}
              courseCount={category.courseCount}
              color={category.color}
              data-testid={`course-category-${index}`}
            />
          ))}
        </div>
        
        {/* Featured Course */}
        {featuredCourse && (
          <div className="glass-effect p-8 rounded-2xl border-2 border-galactic-orange/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-galactic-orange/20 text-galactic-orange rounded-full text-sm">Featured Course</span>
                  {featuredCourse.originalPrice && (
                    <span className="px-3 py-1 bg-galactic-green/20 text-galactic-green rounded-full text-sm">Limited Time</span>
                  )}
                </div>
                <h3 className="font-orbitron text-2xl md:text-3xl font-bold mb-4 gradient-text" data-testid="featured-course-title">
                  {featuredCourse.title}
                </h3>
                <p className="text-gray-300 mb-6" data-testid="featured-course-description">
                  {featuredCourse.description}
                </p>
                <div className="space-y-2 mb-6">
                  {(featuredCourse.features as string[])?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-galactic-orange rounded-full animate-pulse"></div>
                      <span className="text-sm">{feature as string}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-galactic-gold" data-testid="featured-course-price">
                    ${(featuredCourse.price / 100).toFixed(0)}
                  </span>
                  {featuredCourse.originalPrice && (
                    <span className="text-lg text-gray-400 line-through" data-testid="featured-course-original-price">
                      ${(featuredCourse.originalPrice / 100).toFixed(0)}
                    </span>
                  )}
                  <button
                    className="galactic-button px-6 py-3 font-orbitron font-bold text-galactic-orange"
                    data-testid="button-enroll-featured"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={featuredCourse.imageUrl || ''} 
                  alt={featuredCourse.title} 
                  className="w-full h-80 object-cover rounded-xl"
                  data-testid="featured-course-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-galactic-orange/20 via-transparent to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
