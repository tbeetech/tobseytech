import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@shared/schema";
import { useState } from "react";

export default function ProductsSection() {
  const [isScrollPaused, setIsScrollPaused] = useState(false);
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <section id="products" className="page-section py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 text-glow text-cyber-cyan">
              PRODUCT SHOWCASE
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Loading our innovative digital products...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-effect p-6 rounded-xl animate-pulse">
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 w-20 bg-gray-700 rounded"></div>
                  <div className="h-8 w-24 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="page-section py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 gradient-text">
            PRODUCT SHOWCASE
          </h2>
          <p className="text-xl text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Innovative digital products and solutions ready for deployment
          </p>
          
          {/* Scroll Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setIsScrollPaused(!isScrollPaused)}
              className="galactic-button px-6 py-2 font-orbitron font-bold text-galactic-orange"
            >
              {isScrollPaused ? 'PLAY' : 'PAUSE'}
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div className={`infinite-scroll ${isScrollPaused ? 'paused' : ''} gap-8`}>
            {/* First set of products */}
            {products?.map((product) => (
              <div 
                key={product.id} 
                className="glass-effect p-6 rounded-xl hover-glow transition-all duration-300 min-w-80 flex-shrink-0"
                data-testid={`product-card-${product.id}`}
              >
                <img 
                  src={product.imageUrl || ''} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  data-testid={`product-image-${product.id}`}
                />
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-xl font-bold text-galactic-orange" data-testid={`product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <Badge 
                    variant={product.status === 'Live' ? 'default' : 'secondary'}
                    className={`
                      ${product.status === 'Live' ? 'bg-galactic-green/20 text-galactic-green' : ''}
                      ${product.status === 'Beta' ? 'bg-galactic-gold/20 text-galactic-gold' : ''}
                      ${product.status === 'Coming Soon' ? 'bg-galactic-red/20 text-galactic-red' : ''}
                    `}
                    data-testid={`product-status-${product.id}`}
                  >
                    {product.status}
                  </Badge>
                </div>
                <p className="text-gray-300 mb-4" data-testid={`product-description-${product.id}`}>
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-galactic-gold" data-testid={`product-price-${product.id}`}>
                    ${(product.price / 100).toFixed(0)}
                  </span>
                  <button
                    className="galactic-button px-4 py-2 font-orbitron font-bold text-galactic-orange"
                    data-testid={`button-view-product-${product.id}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for infinite scroll */}
            {products?.map((product) => (
              <div 
                key={`duplicate-${product.id}`} 
                className="glass-effect p-6 rounded-xl hover-glow transition-all duration-300 min-w-80 flex-shrink-0"
              >
                <img 
                  src={product.imageUrl || ''} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-xl font-bold text-galactic-orange">
                    {product.name}
                  </h3>
                  <Badge 
                    variant={product.status === 'Live' ? 'default' : 'secondary'}
                    className={`
                      ${product.status === 'Live' ? 'bg-galactic-green/20 text-galactic-green' : ''}
                      ${product.status === 'Beta' ? 'bg-galactic-gold/20 text-galactic-gold' : ''}
                      ${product.status === 'Coming Soon' ? 'bg-galactic-red/20 text-galactic-red' : ''}
                    `}
                  >
                    {product.status}
                  </Badge>
                </div>
                <p className="text-gray-300 mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-galactic-gold">
                    ${(product.price / 100).toFixed(0)}
                  </span>
                  <button className="galactic-button px-4 py-2 font-orbitron font-bold text-galactic-orange">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
