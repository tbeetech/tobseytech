export default function PatriotSection() {
  return (
    <section id="patriot" className="page-section patriot-section py-20 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 gradient-text">
            PATRIOT DIVISION
          </h2>
          <p className="text-xl text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Government-funded projects and cybersecurity solutions for national infrastructure
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="glass-effect p-6 rounded-xl border-2 border-galactic-green/50 hover-glow transition-all duration-300" data-testid="project-cybersecurity">
              <h3 className="font-orbitron text-2xl font-bold mb-4 text-galactic-green">Cybersecurity Infrastructure</h3>
              <p className="text-gray-300 mb-4">Advanced threat detection and prevention systems for critical government networks</p>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-galactic-green rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Classified Security Level: ALPHA</span>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl border-2 border-galactic-gold/50 hover-glow transition-all duration-300" data-testid="project-smart-city">
              <h3 className="font-orbitron text-2xl font-bold mb-4 text-galactic-gold">Smart City Solutions</h3>
              <p className="text-gray-300 mb-4">IoT-enabled urban management systems with AI-driven optimization</p>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-galactic-gold rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Deployment Status: Phase 2</span>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl border-2 border-galactic-red/50 hover-glow transition-all duration-300" data-testid="project-digital-identity">
              <h3 className="font-orbitron text-2xl font-bold mb-4 text-galactic-red">Digital Identity Platform</h3>
              <p className="text-gray-300 mb-4">Blockchain-based citizen identification with biometric security</p>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-galactic-red rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Research Phase: OMEGA</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Futuristic cyberpunk cityscape" 
              className="w-full h-96 object-cover rounded-xl"
              data-testid="patriot-cityscape-image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-dark via-transparent to-transparent rounded-xl"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass-effect p-4 rounded-lg">
                <div className="font-tech text-galactic-red text-sm mb-2">GOVERNMENT CLEARANCE REQUIRED</div>
                <div className="font-orbitron text-xl font-bold gradient-text">Security Level: CLASSIFIED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced physics effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-galactic-green rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-galactic-gold rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-galactic-red rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-galactic-orange rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
      </div>
    </section>
  );
}
