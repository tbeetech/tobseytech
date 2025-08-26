export default function AboutSection() {
  return (
    <section id="about" className="page-section floating-section flex items-center py-20 relative bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-8 gradient-text">
              KINGDOM ENHANCEMENT CORP
            </h2>
            <div className="space-y-6 text-lg">
              <p className="text-gray-300 leading-relaxed">
                TOBSEYTECH represents the future of digital transformation. As Phase 1 of Kingdom Enhancement Corp (KEC), 
                we deliver cutting-edge solutions to SMEs, startups, and social-impact organizations across Africa and beyond.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our mission: Build sustainable technology ventures that provide practical solutions any business can use. 
                We're forward-thinking but always practical, delivering real value first, then refining and improving.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="glass-effect p-4 rounded-lg text-center hover-glow" data-testid="stat-leads">
                  <div className="text-2xl font-bold text-galactic-orange">30+</div>
                  <div className="text-sm text-gray-400">Qualified Leads</div>
                </div>
                <div className="glass-effect p-4 rounded-lg text-center hover-glow" data-testid="stat-delivery">
                  <div className="text-2xl font-bold text-galactic-green">95%</div>
                  <div className="text-sm text-gray-400">On-time Delivery</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass-effect p-8 rounded-2xl">
              <h3 className="font-orbitron text-2xl mb-6 gradient-text">Why Africa? Why Now?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg border border-galactic-orange/30 hover-glow">
                  <div className="w-3 h-3 bg-galactic-orange rounded-full animate-pulse"></div>
                  <span>Africa's digital economy expanding rapidly</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg border border-galactic-gold/30 hover-glow">
                  <div className="w-3 h-3 bg-galactic-gold rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span>AI-first approach saves costs, improves personalization</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg border border-galactic-green/30 hover-glow">
                  <div className="w-3 h-3 bg-galactic-green rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span>Trust gap: clients need clear scopes & quality</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg border border-galactic-red/30 hover-glow">
                  <div className="w-3 h-3 bg-galactic-red rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                  <span>Strategy + Design + Engineering unified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
