import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import TWEEN from 'three/examples/jsm/libs/tween.module.js';

interface CubeGridAnimationProps {
  className?: string;
  cubeCount?: number;
  enableInteraction?: boolean;
}

export default function CubeGridAnimation({ 
  className = '',
  cubeCount = 48, // Reduced for better performance
  enableInteraction = false
}: CubeGridAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Mouse position tracking
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseNormalizedRef = useRef({ x: 0, y: 0 });
  

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

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback((event: Event) => {
    if (!mountRef.current) return;
    
    const mouseEvent = event as MouseEvent;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = mouseEvent.clientX - rect.left;
    mouseRef.current.y = mouseEvent.clientY - rect.top;
    
    // Normalize mouse coordinates to -1 to 1 range
    mouseNormalizedRef.current.x = (mouseRef.current.x / rect.width) * 2 - 1;
    mouseNormalizedRef.current.y = (mouseRef.current.y / rect.height) * 2 - 1;
  }, []);

  // Initialize animation
  const initAnimation = useCallback(() => {
    if (!mountRef.current || isReducedMotion) return;

    const amount = cubeCount;
    const count = Math.pow(amount, 2);
    const dummy = new THREE.Object3D();
    
    const seeds: number[] = [];
    // Store original positions for animation
    const originalPositions: THREE.Vector3[] = [];
    
    const maxDistance = 75;
    const cameraTarget = new THREE.Vector3();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Let renderer handle background
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Get container dimensions
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Camera setup - lower FOV for closer look
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(-8, 8, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup optimized for specular highlights
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,                        // Opaque black background
      powerPreference: 'high-performance'
    });
    // Physically correct lighting enabled by default in Three.js
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    
    // Enable shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    // No environment map - neutral to avoid tint
    scene.environment = null;
    
    // Comprehensive lighting system covering entire mesh
    // Top lighting - covers entire grid from above
    const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
    topLight.position.set(0, 20, 0);
    topLight.castShadow = true;
    scene.add(topLight);
    
    // Left side lighting - covers entire left side
    const leftLight = new THREE.DirectionalLight(0xffffff, 2.0);
    leftLight.position.set(-20, 10, 0);
    leftLight.castShadow = true;
    scene.add(leftLight);
    
    // Right side lighting - covers entire right side
    const rightLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rightLight.position.set(20, 10, 0);
    rightLight.castShadow = true;
    scene.add(rightLight);
    
    // Front lighting - additional coverage from front
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
    frontLight.position.set(0, 8, 20);
    scene.add(frontLight);
    
    // Back lighting - additional coverage from back
    const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
    backLight.position.set(0, 8, -20);
    scene.add(backLight);
    
    // Ambient fill light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Create instanced mesh with rounded edges for light catching
    const geometry = new RoundedBoxGeometry(0.9, 0.9, 0.9, 6, 0.04); // Rounded cubes with smaller bevel
    
    // Track geometry for cleanup
    trackGeometry(geometry);
    
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x000000,         // pure black base
      metalness: 0.01,     // NOT metal — lets clearcoat make white rims
      roughness: 0.18,         // glossy but not mirror
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1,    // keep low since no environment
    });
    
    // Track material for cleanup
    trackMaterial(material);

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshRef.current = mesh;
    
    // Track mesh for cleanup
    trackObject(mesh);
    
    scene.add(mesh);
    
    // Initialize cube positions and store originals
    let i = 0;
    const offset = (amount - 1) / 2;

    for (let x = 0; x < amount; x++) {
      for (let z = 0; z < amount; z++) {
        const xPos = offset - x;
        const zPos = offset - z;
        
        // Store original position
        originalPositions[i] = new THREE.Vector3(xPos, 0, zPos);
        
        dummy.position.set(xPos, 0, zPos);
        dummy.scale.set(1, 1.8, 1); // Adjusted for new geometry height
        dummy.updateMatrix();

        mesh.setMatrixAt(i, dummy.matrix);
        i++;
        seeds.push(Math.random());
      }
    }

    // Add to DOM
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = (time: number) => {
      if (isReducedMotion) return;

      TWEEN.update();

      // Animate camera with very subtle movement
      const elapsedTime = time * 0.001;
      
      // Very subtle camera movement (small amplitude)
      camera.position.x = -8 + Math.sin(elapsedTime * 0.3) * 0.8; // Small horizontal movement
      camera.position.y = 8 + Math.cos(elapsedTime * 0.2) * 0.4;  // Small vertical movement
      camera.position.z = 14 + Math.sin(elapsedTime * 0.25) * 0.6; // Small depth movement
      
      camera.lookAt(cameraTarget);

      // Animate cube positions based on mouse interaction
      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        // Get original position
        const originalPos = originalPositions[i];
        
        // Map cube world position to normalized screen coordinates
        // Convert from world space to normalized screen space
        const worldPos = new THREE.Vector3(originalPos.x, originalPos.y, originalPos.z);
        worldPos.project(camera);
        
        // Flip the Y coordinate to fix inverted mouse movement
        const flippedMouseY = -mouseNormalizedRef.current.y;
        
        // Calculate distance from mouse to this cube (in normalized space)
        const distanceFromMouse = Math.sqrt(
          Math.pow(worldPos.x - mouseNormalizedRef.current.x, 2) + 
          Math.pow(worldPos.y - flippedMouseY, 2)
        );
        
        // Create wave effect - cubes closer to mouse rise higher
        const maxHeight = 6; // Maximum height for cubes
        const influenceRadius = 0.3; // How far the mouse influence reaches (smaller = more focused)
        
        let heightOffset = 0;
        if (distanceFromMouse < influenceRadius) {
          // Smooth falloff based on distance
          const influence = 1 - (distanceFromMouse / influenceRadius);
          const waveHeight = Math.sin(influence * Math.PI) * maxHeight;
          heightOffset = waveHeight * influence;
        }
        
        // Add subtle base wave animation for all cubes (0.1 amplitude)
        const baseWaveHeight = Math.sin((time * 0.001 + seeds[i]) * 2 + seeds[i]) * 0.1;
        
        // Set position - only Y changes, X and Z stay constant
        dummy.position.x = originalPos.x; // Keep X constant
        dummy.position.y = originalPos.y + heightOffset + baseWaveHeight; // Y changes based on mouse + base wave
        dummy.position.z = originalPos.z; // Keep Z constant
        
        // Add subtle rotation for dynamic reflection movement
        dummy.rotation.y = Math.sin((time * 0.001 + seeds[i]) * 0.5) * 0.1;
        dummy.rotation.x = Math.cos((time * 0.001 + seeds[i]) * 0.3) * 0.05;

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      // Use safe animation frame
      animationIdRef.current = createSafeAnimationFrame(animate);
    };

    // Start animation
    animate(0);
    setIsInitialized(true);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up CubeGridAnimation...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (mountRef.current && renderer.domElement && 
          renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      

    };
      }, [cubeCount, isReducedMotion, cleanup]);

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
    
    // Always add mouse event listeners for interaction with safe tracking
    addSafeEventListener(window, 'mousemove', handleMouseMove);
    
    addSafeEventListener(window, 'resize', handleResize);
    
    return () => {
      cleanup?.();
      // Event listener cleanup is handled by the cleanup system
    };
  }, [initAnimation, handleResize, handleMouseMove]);

  // Don't render if reduced motion is preferred
  if (isReducedMotion) {
    return null;
  }

  return (
    <div 
      ref={mountRef} 
      className={`cube-grid-animation ${className}`}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto' // Always allow mouse interaction
      }}
    >
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-white text-sm opacity-60">Loading Cube Grid...</div>
        </div>
      )}
    </div>
  );
}