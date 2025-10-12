import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';

import TWEEN from 'three/examples/jsm/libs/tween.module.js';

interface RobotArmAnimationProps {
  className?: string;
  enableInteraction?: boolean;
  scale?: number;
  animationSpeed?: number;
}

export default function RobotArmAnimation({ 
  className = '', 
  enableInteraction = true,
  scale = 2.0,
  animationSpeed = 1.0
}: RobotArmAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

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

  // Initialize animation
  const initAnimation = useCallback(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(3, 3, 5);
    cameraRef.current = camera;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Grid helper (optional - can be removed for cleaner look)
    // const grid = new THREE.GridHelper(20, 20, 0x333333, 0x666666);
    // scene.add(grid);

    // Lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.9);
    scene.add(hemisphereLight);

    // Add directional light for better shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    // Add to DOM with proper positioning
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '0';
    container.appendChild(renderer.domElement);

    // Load the GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/assets/robot2.glb', // Updated path for public folder
      (gltf) => {
        const model = gltf.scene;
        
        // Apply materials to all meshes
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Scale the model
        model.scale.setScalar(scale);
        model.updateMatrix();

        // Track model for cleanup
        trackObject(model);
        
        // Store references
        modelRef.current = model;
        
        // Setup animation mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          
          // Track mixer for cleanup
          trackObject(mixer as any);
          
          // Play the first animation
          const action = mixer.clipAction(gltf.animations[0]);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        }

        // Add to scene
        scene.add(model);

        setIsLoading(false);
      },
      (progress) => {
        // Loading progress (optional)
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading GLB model:', error);
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      if (isLoading) return;

      TWEEN.update();
      
      // Update animation mixer if available
      if (mixerRef.current) {
        const delta = 0.016; // 60fps
        mixerRef.current.update(delta);
      }
      
      // Camera animation - DISABLED
      // const timer = Date.now() * 0.0001 * animationSpeed;
      // camera.position.x = Math.cos(timer) * 20;
      // camera.position.y = 10;
      // camera.position.z = Math.sin(timer) * 20;
      // camera.lookAt(0, 5, 0);
      
      // Static camera position - better framing for full robot view
      camera.position.set(3, 3, 5);
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
      // Use safe animation frame
      animationIdRef.current = createSafeAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up RobotArmAnimation...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (mountRef.current && renderer.domElement && 
          renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      

    };
      }, [scale, animationSpeed, isLoading, cleanup]);

  // Handle container resize
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
    
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    const cleanup = initAnimation();
    addSafeEventListener(window, 'resize', handleResize);
    
    return () => {
      cleanup?.();
      // Event listener cleanup is handled by the cleanup system
    };
  }, [initAnimation, handleResize]);

  if (error) {
    return (
      <div className={`robot-arm-animation ${className}`}>
        <div className="text-center text-red-500 p-8">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mountRef} 
      className={`robot-arm-animation ${className}`}
      style={{ 
        position: 'relative',
        width: '100%', 
        height: '100%', 
        zIndex: 0,
        pointerEvents: enableInteraction ? 'auto' : 'none',
        overflow: 'hidden'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-white text-sm opacity-60">Loading Robot Arm...</div>
        </div>
      )}
    </div>
  );
}