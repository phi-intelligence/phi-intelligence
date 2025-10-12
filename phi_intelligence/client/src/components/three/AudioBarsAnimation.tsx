import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


interface AudioBarsAnimationProps {
  className?: string;
  barCount?: number;
  animationSpeed?: number;
  enableInteraction?: boolean;
}

export default function AudioBarsAnimation({ 
  className = '',
  barCount = 7,
  animationSpeed = 1.0,
  enableInteraction = false
}: AudioBarsAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const audioBarsRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number | null>(null);
  

  const {
    trackGeometry,
    trackMaterial,
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
    scene.background = new THREE.Color(0x000000); // Pure black background
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    mountRef.current.appendChild(renderer.domElement);

    // Create the audio bars visualization
    const audioBars = createAudioBars(barCount);
    scene.add(audioBars);

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    // Initial resize
    handleResize();
    
    // Add resize listener with safe tracking
    addSafeEventListener(window, 'resize', handleResize);

    // Add lighting
    setupLighting(scene);

    // Initialize audio data
    const audioData = new Array(barCount).fill(0);

    // Animation variables
    let time = 0;
    const clock = new THREE.Clock();
    const sensitivity = 1;
    const animSpeed = animationSpeed;

    // Animation function
    const animate = () => {
      // Use safe animation frame
      animationIdRef.current = createSafeAnimationFrame(animate);
      
      const deltaTime = clock.getDelta();
      time += deltaTime;
      
      // Update audio data (simulated)
      updateAudioData(audioData, barCount, time, animSpeed, sensitivity);
      
      // Update audio bars
      audioBarsRef.current.forEach((bar, index) => {
        const audioValue = audioData[index] || 0;
        
        // Dynamic height animation
        const targetHeight = 0.3 + audioValue * 4; // Increased height range
        bar.userData.currentHeight += (targetHeight - bar.userData.currentHeight) * 0.15;
        bar.scale.y = bar.userData.currentHeight;
        
        // Material animation with enhanced effects
        if (Array.isArray(bar.material)) {
          // Handle array of materials
          bar.material.forEach(mat => {
            if (mat && 'opacity' in mat) {
              (mat as any).opacity = 0.8 + audioValue * 0.2;
            }
          });
        } else if (bar.material && 'opacity' in bar.material) {
          // Handle single material
          (bar.material as any).opacity = 0.8 + audioValue * 0.2;
        }
      });
      
      // Camera stays static for clean up/down movement only
      
      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up AudioBarsAnimation...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (mountRef.current && renderer.domElement && 
          renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      

    };
      }, [barCount, animationSpeed, cleanup]);

  const createAudioBars = (barCount: number) => {
    const audioBarsGroup = new THREE.Group();
    
    // Track group for cleanup
    trackObject(audioBarsGroup);
    
    const audioBars: THREE.Mesh[] = [];
    
    for (let i = 0; i < barCount; i++) {
      // Increased cylinder dimensions
      const barGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1, 16); // Increased radius from 0.15 to 0.25
      const barMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Pure white bars
        transparent: true,
        opacity: 0.95
      });
      
      // Track geometry and material for cleanup
      trackGeometry(barGeometry);
      trackMaterial(barMaterial);
      
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      
      // Track bar object for cleanup
      trackObject(bar);
      
      // Position bars in a row with adjusted spacing for wider bars
      const spacing = 0.7; // Increased spacing from 0.5 to 0.7
      const totalWidth = (barCount - 1) * spacing;
      bar.position.x = (i * spacing) - (totalWidth / 2);
      bar.position.y = 0;
      
      // No shadows for clean white appearance
      
      // Store original properties
      bar.userData = {
        originalHeight: 1,
        targetHeight: 1,
        currentHeight: 1,
        index: i
      };
      
      audioBars.push(bar);
      audioBarsGroup.add(bar);
    }
    
    audioBarsRef.current = audioBars;
    return audioBarsGroup;
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Simple, bright lighting to ensure pure white bars
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    // Additional directional light for clarity
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);
  };

  const updateAudioData = (audioData: number[], barCount: number, time: number, animSpeed: number, sensitivity: number) => {
    // Generate simulated audio data with more variation
    for (let i = 0; i < barCount; i++) {
      const baseFreq = (i + 1) * 0.4;
      const noise = Math.random() * 0.4; // Increased noise for more dynamic movement
      const waveVariation = Math.sin(time * 0.2 + i) * 0.2;
      
      audioData[i] = (
        Math.sin(time * baseFreq * animSpeed) * 0.5 + 
        0.5 + 
        noise + 
        waveVariation
      ) * sensitivity;
    }
  };

  return (
    <div 
      ref={mountRef} 
      className={`audio-bars-animation ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        overflow: 'hidden',
        pointerEvents: enableInteraction ? 'auto' : 'none'
      }}
    />
  );
}

