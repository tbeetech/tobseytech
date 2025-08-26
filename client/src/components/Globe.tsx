import { useEffect, useRef } from "react";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined' || !window.THREE) {
      return;
    }

    const canvas = canvasRef.current;
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, 600 / 600, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(600, 600);

    // Create globe
    const geometry = new window.THREE.SphereGeometry(1.5, 64, 64);
    const material = new window.THREE.MeshBasicMaterial({
      color: 0xFF8C00,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const globe = new window.THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add points for connectivity
    const pointsGeometry = new window.THREE.BufferGeometry();
    const pointsCount = 100;
    const positions = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointsCount);
      const theta = Math.sqrt(pointsCount * Math.PI) * phi;
      
      positions[i * 3] = 1.1 * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = 1.1 * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = 1.1 * Math.cos(phi);
    }
    
    pointsGeometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));
    const pointsMaterial = new window.THREE.PointsMaterial({ 
      color: 0xFFD700, 
      size: 0.08,
      transparent: true,
      opacity: 0.9
    });
    const points = new window.THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    camera.position.z = 3;

    function animate() {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.008;
      globe.rotation.x += 0.002;
      points.rotation.y += 0.005;
      points.rotation.x -= 0.001;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div className="large-globe">
      <canvas ref={canvasRef} id="globe-canvas" />
    </div>
  );
}

// Type declaration for Three.js
declare global {
  interface Window {
    THREE: any;
  }
}
