import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


interface GlobeProps {
  className?: string;
  isMobile?: boolean; // Mobile-specific behavior
}

const Globe = React.memo(function Globe({ className = '', isMobile = false }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<THREE.Points>();
  const logoSpriteRef = useRef<THREE.Sprite>();
  

  const {
    trackGeometry,
    trackMaterial,
    trackTexture,
    trackRenderer,
    trackScene,
    trackCamera,
    trackAnimationFrame,
    trackEventListener,
    trackObject,
    createSafeAnimationFrame,
    addSafeEventListener,
    cleanup
  } = useThreeCleanup();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Make background transparent
    
    // Track scene for cleanup
    trackScene(scene);
    
    // Camera setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Responsive camera distance - closer on mobile for larger appearance
    camera.position.z = isMobile ? 8 : 10;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear any existing canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    trackObject(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    trackObject(pointLight);

    // Create points for the globe
    const points: number[] = [];
    const geometry = new THREE.BufferGeometry();
    
    // Track geometry for cleanup
    trackGeometry(geometry);
    
    // Generate points on a sphere
    const radius = 3.0// Reduced from 2.6 to 1.8 for smaller globe
    const totalPoints = 4000;
    
    for (let i = 0; i < totalPoints; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      points.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    
    // Create points material
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    // Track material for cleanup
    trackMaterial(pointsMaterial);
    
    // Create points mesh
    const particles = new THREE.Points(geometry, pointsMaterial);
    
    // Track particles object for cleanup
    trackObject(particles);
    
    scene.add(particles);
    particlesRef.current = particles;
    
    // Create lines between nearby points
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25
    });
    
    // Create lines between nearby points
    const maxDistance = 0.5;
    const lineSegments: THREE.Vector3[] = [];
    
    for (let i = 0; i < totalPoints; i += 3) {
      const x1 = points[i];
      const y1 = points[i + 1];
      const z1 = points[i + 2];
      
      for (let j = i + 3; j < totalPoints; j += 3) {
        const x2 = points[j];
        const y2 = points[j + 1];
        const z2 = points[j + 2];
        
        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) + 
          Math.pow(y2 - y1, 2) + 
          Math.pow(z2 - z1, 2)
        );
        
        if (distance < maxDistance) {
          lineSegments.push(
            new THREE.Vector3(x1, y1, z1),
            new THREE.Vector3(x2, y2, z2)
          );
        }
      }
    }
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(lineSegments);
    trackGeometry(lineGeometry);
    trackMaterial(lineMaterial);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    trackObject(lines);
    scene.add(lines);

    // Create a solid blue logo sprite in the centre of the globe
    const createLogoSprite = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, size, size);

        // Replace every non-transparent pixel with phi-blue (#00A3FF)
        // Use darker sRGB-compensated values so Three.js renders the correct hue
        const imageData = ctx.getImageData(0, 0, size, size);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 30) {
            d[i]     = 0;
            d[i + 1] = 100;
            d[i + 2] = 200;
            d[i + 3] = 240;
          }
        }
        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        trackTexture(texture);

        const logoSize = isMobile ? 2.2 : 2.0;
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          opacity: 0.95,
        });
        trackMaterial(spriteMaterial);

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(logoSize, logoSize, 1);
        sprite.renderOrder = 10;
        scene.add(sprite);
        logoSpriteRef.current = sprite;
      };
      img.src = '/assets/logophi.png';
    };

    createLogoSprite();

    // Animation loop
    const animate = () => {
      // Use safe animation frame
      animationRef.current = createSafeAnimationFrame(animate);
      
      // Rotate only the globe particles and lines
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
      }
      
      // Logo sprite always faces the camera automatically (no rotation needed)
      
      renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    // Add resize listener with safe tracking
    addSafeEventListener(window, 'resize', handleResize);
    animate();
    
    // Cleanup
    return () => {
      console.log('🧹 Cleaning up Globe...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (mountRef.current && renderer.domElement && 
          renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      

    };
  }, [cleanup]);

  return (
    <div 
      ref={mountRef} 
      className={`globe-component ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative' 
      }} 
    />
  );
});

export default Globe;