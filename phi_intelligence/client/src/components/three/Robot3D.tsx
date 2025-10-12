import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';

import { GLTFLoader, OrbitControls } from 'three-stdlib';
const robotModelUrl = '/assets/meshkh.glb';

interface Robot3DProps {
  animationState: 'stationary' | 'connected' | 'disconnected';
  isConnected?: boolean;
  isActive?: boolean;
  isSpeaking?: boolean;
  error?: string;
}

const Robot3D: React.FC<Robot3DProps> = ({ 
  animationState = 'stationary',
  isConnected = false,
  isActive = false,
  isSpeaking = false,
  error
}) => {
  // Refs for Three.js objects
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Mesh | null>(null);
  const rightArmRef = useRef<THREE.Mesh | null>(null);
  const headRef = useRef<THREE.Mesh | null>(null);
  const neckRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  // State
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Animation state refs
  const currentAnimationState = useRef<'stationary' | 'connected' | 'disconnected'>('stationary');
  const waveOffset = useRef(0);
  const headNodOffset = useRef(0);
  const breathingOffset = useRef(0);
  

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

  // Update animation state when props change
  useEffect(() => {
    currentAnimationState.current = animationState;
  }, [animationState]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth || 400;
    const height = container.offsetHeight || 400;

    // Scene setup with deep black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Deep black
    scene.fog = new THREE.Fog(0x000000, 1, 15);
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 2.5); 
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    // Lighting setup for futuristic look
    const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.8); // Subtle ambient light
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);

    // Add cyan accent light for neon glow effect
    const cyanLight = new THREE.PointLight(0x00f5ff, 0.5, 10);
    cyanLight.position.set(0, 2, 0);
    scene.add(cyanLight);

    // Robot group
    const robotGroup = new THREE.Group();
    robotGroup.position.y = -0.5; 
    
    // Track robot group for cleanup
    trackObject(robotGroup);
    
    scene.add(robotGroup);
    robotRef.current = robotGroup;

    // Orbit controls (disabled but kept for potential debugging)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Disable orbit controls
    controlsRef.current = controls;
    
    // Track controls for cleanup
    trackObject(controls as any);

    // Model loader
    const loader = new GLTFLoader();

    // Load robot model
    loader.load(
      robotModelUrl,
      (gltf: any) => {
        console.log('Robot model loaded successfully');
        const robotModel = gltf.scene;
        robotModel.scale.set(0.12, 0.12, 0.12); // Reduced from 0.15 to 0.12
        robotModel.position.set(0, 0, 0);
        
        // Set up materials and shadows
        robotModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply futuristic black and neon cyan color scheme
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => {
                  if (material instanceof THREE.Material) {
                    // Main body: dark matte gray
                    (material as any).color = new THREE.Color(0x1a1a1a);
                    (material as any).metalness = 0.1;
                    (material as any).roughness = 0.8;
                    (material as any).envMapIntensity = 0.2;
                    
                    // Check if this is an accent part (eyes, mouth, chest lights)
                    if (child.name.toLowerCase().includes('eye') || 
                        child.name.toLowerCase().includes('mouth') || 
                        child.name.toLowerCase().includes('chest') ||
                        child.name.toLowerCase().includes('light') ||
                        child.name.toLowerCase().includes('accent')) {
                      // Neon cyan accents
                      (material as any).color = new THREE.Color(0x00f5ff);
                      (material as any).emissive = new THREE.Color(0x00f5ff);
                      (material as any).emissiveIntensity = 0.8;
                      (material as any).metalness = 0.0;
                      (material as any).roughness = 0.1;
                    }
                  }
                });
              } else {
                // Main body: dark matte gray
                (child.material as any).color = new THREE.Color(0x1a1a1a);
                (child.material as any).metalness = 0.1;
                (child.material as any).roughness = 0.8;
                (child.material as any).envMapIntensity = 0.2;
                
                // Check if this is an accent part
                if (child.name.toLowerCase().includes('eye') || 
                    child.name.toLowerCase().includes('mouth') || 
                    child.name.toLowerCase().includes('chest') ||
                    child.name.toLowerCase().includes('light') ||
                    child.name.toLowerCase().includes('accent')) {
                  // Neon cyan accents
                  (child.material as any).color = new THREE.Color(0x00f5ff);
                  (child.material as any).emissive = new THREE.Color(0x00f5ff);
                  (child.material as any).emissiveIntensity = 0.8;
                  (child.material as any).metalness = 0.0;
                  (child.material as any).roughness = 0.1;
                }
              }
            }
            
            // Find body parts for animation
            if (child.name.toLowerCase().includes('arm')) {
              if (child.name.toLowerCase().includes('left')) {
                leftArmRef.current = child;
              } else if (child.name.toLowerCase().includes('right')) {
                rightArmRef.current = child;
              }
            }
            
            // Find head and neck for speaking animation
            if (child.name.toLowerCase().includes('head')) {
              headRef.current = child;
            } else if (child.name.toLowerCase().includes('neck')) {
              neckRef.current = child;
            }
          }
        });
        
        robotGroup.add(robotModel);
        setModelLoaded(true);
      },
      (xhr: any) => {
        if (xhr.lengthComputable) {
          const percent = (xhr.loaded / xhr.total) * 100;
          console.log(`Robot loading: ${percent.toFixed(2)}%`);
        }
      },
      (error: any) => {
        console.error('Error loading robot model:', error);
        // Create a simple fallback geometry
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          wireframe: true
        });
        const cube = new THREE.Mesh(geometry, material);
        robotGroup.add(cube);
        setModelLoaded(true);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      // Use safe animation frame
      animationIdRef.current = createSafeAnimationFrame(animate);
      
      if (!modelLoaded) return;
      
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      
      if (robotRef.current) {
        const state = currentAnimationState.current;
        
        // Update animation offsets
        waveOffset.current += delta * 2;
        headNodOffset.current += delta * 1.5;
        breathingOffset.current += delta * 1;
        
        // Reset robot to neutral position
        robotRef.current.rotation.x = 0;
        robotRef.current.rotation.y = 0;
        robotRef.current.position.y = -0.5;
        
        // Apply state-specific animations
        switch (state) {
          case 'stationary':
            // No movement - robot stands completely still
            break;
            
          case 'connected':
            // Natural talking animation with expressive hand movements
            if (leftArmRef.current) {
              leftArmRef.current.rotation.z = Math.sin(waveOffset.current * 3) * 0.4 - 0.2;
              leftArmRef.current.rotation.x = Math.sin(waveOffset.current * 2.5) * 0.2;
              leftArmRef.current.rotation.y = Math.sin(waveOffset.current * 1.8) * 0.15;
            }
            if (rightArmRef.current) {
              rightArmRef.current.rotation.z = Math.sin(waveOffset.current * 3 + Math.PI) * 0.4 + 0.2;
              rightArmRef.current.rotation.x = Math.sin(waveOffset.current * 2.5 + Math.PI) * 0.2;
              rightArmRef.current.rotation.y = Math.sin(waveOffset.current * 1.8 + Math.PI) * 0.15;
            }
            
            // Head movement - SAME AS DISCONNECTED STATE
            if (headRef.current) {
              headRef.current.rotation.x = Math.sin(headNodOffset.current * 2) * 0.1;
            }
            if (neckRef.current) {
              neckRef.current.rotation.x = Math.sin(headNodOffset.current * 2) * 0.05;
            }
            
            // Body movement for natural talking
            robotRef.current.position.y = -0.5 + Math.sin(time * 4) * 0.02;
            robotRef.current.rotation.y = Math.sin(time * 1.2) * 0.05;
            break;
            
          case 'disconnected':
            // Speaking animation - head nodding + expressive arm gestures
            if (headRef.current) {
              headRef.current.rotation.x = Math.sin(headNodOffset.current * 2) * 0.1;
            }
            if (neckRef.current) {
              neckRef.current.rotation.x = Math.sin(headNodOffset.current * 2) * 0.05;
            }
            
            // More expressive arm movements
            if (leftArmRef.current) {
              leftArmRef.current.rotation.z = Math.sin(waveOffset.current * 2.5) * 0.3 - 0.2;
              leftArmRef.current.rotation.x = Math.sin(waveOffset.current * 1.5) * 0.1;
            }
            if (rightArmRef.current) {
              rightArmRef.current.rotation.z = Math.sin(waveOffset.current * 2.5 + Math.PI) * 0.3 + 0.2;
              rightArmRef.current.rotation.x = Math.sin(waveOffset.current * 1.5 + Math.PI) * 0.1;
            }
            
            // Slight body movement suggesting speech
            robotRef.current.position.y = -0.5 + Math.sin(time * 3) * 0.015;
            break;
        }
      }
      
      // Update controls if needed
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Render scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Handle window resize
    const handleResize = () => {
      const w = container.offsetWidth || 400;
      const h = container.offsetHeight || 400;
      
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(w, h);
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    
    // Add event listeners with safe tracking
    addSafeEventListener(window, 'resize', handleResize);
    
    // Start animation loop
    animate();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Robot3D...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (containerRef.current && rendererRef.current?.domElement && 
          rendererRef.current.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      

    };
  }, [modelLoaded, cleanup]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2e 100%)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    />
  );
};

export default Robot3D;