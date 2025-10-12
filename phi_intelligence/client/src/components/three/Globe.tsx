import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';

import { TextureLoader } from 'three';
// Logo path updated to public folder

interface GlobeProps {
  className?: string;
  isMobile?: boolean; // Mobile-specific behavior
}

const Globe = React.memo(function Globe({ className = '', isMobile = false }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<THREE.Points>();
  const logoRef = useRef<{ particles: THREE.Points; lines: THREE.LineSegments }>();
  

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
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

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
      opacity: 0.8,
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
      opacity: 0.5
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
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Create a network-formed logo based on the actual logophi.png image
    const createNetworkLogo = () => {
      return new Promise<void>((resolve) => {
        const textureLoader = new TextureLoader();
        textureLoader.load('/assets/logophi.png', (texture) => {
          // Create a canvas to analyze the logo image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          canvas.width = texture.image.width;
          canvas.height = texture.image.height;
          
          // Draw the logo image
          ctx.drawImage(texture.image, 0, 0);
          
          // Get image data to analyze pixel density
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          const logoLineSegments: THREE.Vector3[] = [];
          const logoParticles: number[] = [];
          
          // Generate particles specifically for the logo based on actual image
          const logoTotalParticles = 3000; // Dense particles for logo
          // Responsive logo size - larger on mobile for better visibility
          const logoSize = isMobile ? 2.2 : 2;
          const halfSize = logoSize / 2;
          
          for (let i = 0; i < logoTotalParticles; i++) {
            // Generate particles in logo area
            const x = (Math.random() - 0.5) * logoSize;
            const y = (Math.random() - 0.5) * logoSize;
            
            // Check if particle should be inside logo shape based on actual image
            const isInLogo = isInsideActualLogo(x, y, data, canvas.width, canvas.height, logoSize);
            
            if (isInLogo) {
              const z = (Math.random() - 0.8) * 0.5; // Thin layer for logo
              logoParticles.push(x, y, z);
            }
          }
          
          // Create connections between logo particles
          const logoMaxDistance = 0.12; // Tighter connections for logo
          
          for (let i = 0; i < logoParticles.length; i += 3) {
            const x1 = logoParticles[i];
            const y1 = logoParticles[i + 1];
            const z1 = logoParticles[i + 2];
            
            for (let j = i + 3; j < logoParticles.length; j += 3) {
              const x2 = logoParticles[j];
              const y2 = logoParticles[j + 1];
              const z2 = logoParticles[j + 2];
              
              const distance = Math.sqrt(
                Math.pow(x2 - x1, 2) + 
                Math.pow(y2 - y1, 2) + 
                Math.pow(z2 - z1, 2)
              );
              
              if (distance < logoMaxDistance) {
                logoLineSegments.push(
                  new THREE.Vector3(x1, y1, z1),
                  new THREE.Vector3(x2, y2, z2)
                );
              }
            }
          }
          
          // Create logo particles geometry
          const logoParticleGeometry = new THREE.BufferGeometry();
          logoParticleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(logoParticles, 3));
          
          const logoParticleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02, // Slightly larger particles for logo
            transparent: true,
            opacity: 1, // Full opacity for logo
            sizeAttenuation: true
          });
          
          const logoParticlesMesh = new THREE.Points(logoParticleGeometry, logoParticleMaterial);
          logoParticlesMesh.position.set(0, 0, 0);
          logoParticlesMesh.rotation.set(0, 0, Math.PI); // Rotate 180 degrees to match navbar orientation
          logoParticlesMesh.renderOrder = 10; // Ensure it renders on top
          scene.add(logoParticlesMesh);
          
          // Create logo connections geometry
          const logoLineGeometry = new THREE.BufferGeometry().setFromPoints(logoLineSegments);
          const logoLineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9 // Higher opacity for logo connections
          });
          
          const logoLines = new THREE.LineSegments(logoLineGeometry, logoLineMaterial);
          logoLines.position.set(0, 0, 0);
          logoLines.rotation.set(0, 0, Math.PI); // Rotate 180 degrees to match navbar orientation
          logoLines.renderOrder = 9; // Render below particles but above globe
          scene.add(logoLines);
          
          // Store references for animation
          logoRef.current = { particles: logoParticlesMesh, lines: logoLines };
          
          resolve();
        });
      });
    };
    
    // Function to check if a point is inside the actual logo based on image data
    const isInsideActualLogo = (x: number, y: number, imageData: Uint8ClampedArray, imageWidth: number, imageHeight: number, logoSize: number): boolean => {
      // Convert 3D coordinates to 2D image coordinates
      const halfSize = logoSize / 2;
      
      // Map 3D coordinates to image coordinates with correct orientation
      const imageX = Math.floor(((x + halfSize) / logoSize) * imageWidth);
      // Flip Y coordinate to match navbar orientation
      const imageY = Math.floor(((halfSize - y) / logoSize) * imageHeight);
      
      // Check bounds
      if (imageX < 0 || imageX >= imageWidth || 
          imageY < 0 || imageY >= imageHeight) {
        return false;
      }
      
      // Get pixel data at this position
      const index = (imageY * imageWidth + imageX) * 4;
      const alpha = imageData[index + 3]; // Alpha channel
      
      // Return true if pixel has significant alpha (is part of logo)
      return alpha > 50; // Threshold for logo pixels
    };

    // Add the logo to the scene
    createNetworkLogo().then(() => {
      // Logo has been created, now start animation
      console.log('Network logo created successfully');
    });

    // Animation loop
    const animate = () => {
      // Use safe animation frame
      animationRef.current = createSafeAnimationFrame(animate);
      
      // Rotate only the globe particles and lines
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
        lines.rotation.y += 0.001;
      }
      
      // Logo stays completely static - explicitly reset rotation to correct orientation
      if (logoRef.current && logoRef.current.particles) {
        logoRef.current.particles.rotation.set(0, 0, Math.PI); // Keep correct orientation
        logoRef.current.lines.rotation.set(0, 0, Math.PI); // Keep correct orientation
      }
      
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