import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FrameRateController } from './FrameRateController';
import { LODController } from './LODController';
import { SpatialGridImpl } from './SpatialGridImpl';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


interface NeuralNetworkAnimationProps {
  className?: string;
  enableInteraction?: boolean;
  animationSpeed?: number;
  particleCount?: number;
  maxConnections?: number;
  minDistance?: number;
  showDots?: boolean;
  showLines?: boolean;
}

interface ParticleData {
  velocity: THREE.Vector3;
  numConnections: number;
}

export default function NeuralNetworkAnimation({ 
  className = '', 
  enableInteraction = true,
  animationSpeed = 1.0,
  particleCount = 500, // Balanced for performance and visual effect
  maxConnections = 40, // Balanced for network density
  minDistance = 120, // Balanced for connection visibility
  showDots = true,
  showLines = true
}: NeuralNetworkAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const pointCloudRef = useRef<THREE.Points | null>(null);
  const linesMeshRef = useRef<THREE.LineSegments | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Performance controllers
  const frameRateControllerRef = useRef<FrameRateController | null>(null);
  const lodControllerRef = useRef<LODController | null>(null);
  const spatialGridRef = useRef<SpatialGridImpl | null>(null);

  // Animation constants
  const maxParticleCount = 800; // Reduced for better performance
  const r = 1200; // Reduced boundary for better performance
  const rHalf = r / 2;
  
  // Network dynamics
  const connectionPulseSpeed = 0.003;
  const maxConnectionLifetime = 100;
  
  // Performance optimization
  const maxConnectionsPerFrame = 200; // Increased for better network effect
  const adaptiveQuality = true; // Enable adaptive quality based on performance
  const connectionBatchSize = 50; // Process connections in batches for smooth performance
  
  // Brain shape parameters (unused but kept for future reference)
  const brainRadius = 400;
  const brainHeight = 600;
  const brainDepth = 500;

  // Particle data storage
  const particlesDataRef = useRef<ParticleData[]>([]);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  

  const {
    trackGeometry,
    trackMaterial,
    trackRenderer,
    trackScene,
    trackCamera,
    trackControls,
    trackAnimationFrame,
    trackEventListener,
    trackObject,
    createSafeAnimationFrame,
    addSafeEventListener,
    cleanup
  } = useThreeCleanup();

  // Initialize performance controllers
  useEffect(() => {
    frameRateControllerRef.current = new FrameRateController({
      targetFPS: 30, // 30 FPS for background animations
      enableAdaptive: true,
      minFPS: 20,
      maxFPS: 60
    });

    lodControllerRef.current = new LODController({
      high: { particleCount: 800, maxConnections: 60, minDistance: 100 },
      medium: { particleCount: 600, maxConnections: 40, minDistance: 120 },
      low: { particleCount: 400, maxConnections: 25, minDistance: 150 }
    });

    spatialGridRef.current = new SpatialGridImpl(minDistance * 1.5);
  }, [minDistance]);

  // Initialize the neural network
  const initNeuralNetwork = useCallback(() => {
    if (!groupRef.current) return;

    // Clear existing particles
    groupRef.current.clear();

    // Initialize particle data
    particlesDataRef.current = [];
    particlePositionsRef.current = new Float32Array(maxParticleCount * 3);
    positionsRef.current = new Float32Array(maxParticleCount * maxParticleCount * 3);
    colorsRef.current = new Float32Array(maxParticleCount * maxParticleCount * 3);

    // Removed bounding box helper for more expansive animation spread
    // Particles will now move freely across the hero section

    // Create particles with more expansive distribution
    const particles = new THREE.BufferGeometry();
    
    // Track geometry for cleanup
    trackGeometry(particles);
    
    for (let i = 0; i < maxParticleCount; i++) {
          // Distribute particles across full hero section width and height
    const x = (Math.random() - 0.5) * r * 2.0; // Full width coverage
    const y = (Math.random() - 0.5) * r * 1.5; // Enhanced height coverage
    const z = (Math.random() - 0.5) * r * 1.2; // Better depth perception

      particlePositionsRef.current[i * 3] = x;
      particlePositionsRef.current[i * 3 + 1] = y;
      particlePositionsRef.current[i * 3 + 2] = z;

      // Add particle data
      particlesDataRef.current.push({
        velocity: new THREE.Vector3(
          -1 + Math.random() * 2,
          -1 + Math.random() * 2,
          -1 + Math.random() * 2
        ),
        numConnections: 0
      });
    }

    particles.setDrawRange(0, particleCount);
    particles.setAttribute(
      'position', 
      new THREE.BufferAttribute(particlePositionsRef.current, 3).setUsage(THREE.DynamicDrawUsage)
    );

    // Create particle material
    const pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false
    });
    
    // Track material for cleanup
    trackMaterial(pMaterial);

    // Create point cloud
    const pointCloud = new THREE.Points(particles, pMaterial);
    groupRef.current.add(pointCloud);
    pointCloudRef.current = pointCloud;
    pointCloud.visible = showDots;

    // Create lines geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position', 
      new THREE.BufferAttribute(positionsRef.current, 3).setUsage(THREE.DynamicDrawUsage)
    );
    geometry.setAttribute(
      'color', 
      new THREE.BufferAttribute(colorsRef.current, 3).setUsage(THREE.DynamicDrawUsage)
    );
    geometry.computeBoundingSphere();
    geometry.setDrawRange(0, 0);
    
    // Track geometry for cleanup
    trackGeometry(geometry);

    // Create lines material
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    // Track material for cleanup
    trackMaterial(material);

    // Create lines mesh
    const linesMesh = new THREE.LineSegments(geometry, material);
    groupRef.current.add(linesMesh);
    linesMeshRef.current = linesMesh;
    linesMesh.visible = showLines;
  }, [particleCount, showDots, showLines]);

  // Animation loop with performance monitoring
  const animate = useCallback(() => {
    if (!isInitialized || !particlePositionsRef.current || !positionsRef.current || !colorsRef.current) return;
    
    // Performance monitoring
    const startTime = performance.now();

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    // Reset connection counts
    for (let i = 0; i < particleCount; i++) {
      particlesDataRef.current[i].numConnections = 0;
    }
    
    // Smart connection processing - maintain visual effect while controlling performance
    let connectionsProcessed = 0;
    const maxConnectionsToProcess = Math.min(particleCount * 2, maxConnectionsPerFrame);

    // Update particle positions and check connections
    for (let i = 0; i < particleCount; i++) {
      const particleData = particlesDataRef.current[i];

      // Update position
      particlePositionsRef.current[i * 3] += particleData.velocity.x * animationSpeed;
      particlePositionsRef.current[i * 3 + 1] += particleData.velocity.y * animationSpeed;
      particlePositionsRef.current[i * 3 + 2] += particleData.velocity.z * animationSpeed;

      // Bounce off boundaries with full hero section coverage
      if (particlePositionsRef.current[i * 3 + 1] < -rHalf * 1.5 || particlePositionsRef.current[i * 3 + 1] > rHalf * 1.5) {
        particleData.velocity.y = -particleData.velocity.y;
      }
      if (particlePositionsRef.current[i * 3] < -rHalf * 2.0 || particlePositionsRef.current[i * 3] > rHalf * 2.0) {
        particleData.velocity.x = -particleData.velocity.x;
      }
      if (particlePositionsRef.current[i * 3 + 2] < -rHalf * 1.2 || particlePositionsRef.current[i * 3 + 2] > rHalf * 1.2) {
        particleData.velocity.z = -particleData.velocity.z;
      }

      // Check connections with smart optimization
      for (let j = i + 1; j < particleCount; j++) {
        const particleDataB = particlesDataRef.current[j];

        const dx = particlePositionsRef.current[i * 3] - particlePositionsRef.current[j * 3];
        const dy = particlePositionsRef.current[i * 3 + 1] - particlePositionsRef.current[j * 3 + 1];
        const dz = particlePositionsRef.current[i * 3 + 2] - particlePositionsRef.current[j * 3 + 2];
        const distSquared = dx * dx + dy * dy + dz * dz; // Use squared distance to avoid sqrt

        // Primary connections - the core network effect
        if (distSquared < minDistance * minDistance && particleData.numConnections < maxConnections && particleDataB.numConnections < maxConnections) {
          particleData.numConnections++;
          particleDataB.numConnections++;

          const dist = Math.sqrt(distSquared);
          const baseAlpha = 1.0 - dist / minDistance;
          const pulseAlpha = Math.sin(Date.now() * connectionPulseSpeed) * 0.2 + 0.8;
          const alpha = baseAlpha * pulseAlpha;

          // Add line vertices for connections
          positionsRef.current[vertexpos++] = particlePositionsRef.current[i * 3];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[i * 3 + 1];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[i * 3 + 2];

          positionsRef.current[vertexpos++] = particlePositionsRef.current[j * 3];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[j * 3 + 1];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[j * 3 + 2];

          // Add line colors for connections
          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;

          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;

          numConnected++;
        }
        
        // Secondary connections for extended network reach (but limited)
        else if (distSquared < (minDistance * 1.3) * (minDistance * 1.3) && 
                 particleData.numConnections < maxConnections && 
                 particleDataB.numConnections < maxConnections &&
                 connectionsProcessed < maxConnectionsToProcess) { // Smart connection limiting
          
          particleData.numConnections++;
          particleDataB.numConnections++;

          const dist = Math.sqrt(distSquared);
          const alpha = (1.0 - dist / (minDistance * 1.3)) * 0.6; // Dimmer secondary connections

          // Add line vertices for secondary connections
          positionsRef.current[vertexpos++] = particlePositionsRef.current[i * 3];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[i * 3 + 1];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[i * 3 + 2];

          positionsRef.current[vertexpos++] = particlePositionsRef.current[j * 3];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[j * 3 + 1];
          positionsRef.current[vertexpos++] = particlePositionsRef.current[j * 3 + 2];

          // Add line colors for secondary connections
          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;

          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;
          colorsRef.current[colorpos++] = alpha;

          numConnected++;
          connectionsProcessed++;
        }
      }
    }

    // Update geometries
    if (linesMeshRef.current) {
      linesMeshRef.current.geometry.setDrawRange(0, numConnected * 2);
      linesMeshRef.current.geometry.attributes.position.needsUpdate = true;
      linesMeshRef.current.geometry.attributes.color.needsUpdate = true;
    }

    if (pointCloudRef.current) {
      pointCloudRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Rotate the entire group
    if (groupRef.current) {
      const time = Date.now() * 0.001;
      groupRef.current.rotation.y = time * 0.1;
    }
    
    // Performance monitoring and adaptive quality
    const endTime = performance.now();
    const frameTime = endTime - startTime;
    
    // Log performance metrics for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 NeuralNetwork: Frame time: ${frameTime.toFixed(2)}ms, Connections: ${numConnected}, Particles: ${particleCount}`);
    }
    
    // Adaptive quality: reduce particle count if frame time is too high
    if (adaptiveQuality && frameTime > 16.67) { // More than 60 FPS target
      if (particleCount > 150) {
        // Reduce particle count for better performance
        console.log(`🔄 NeuralNetwork: High frame time (${frameTime.toFixed(2)}ms), reducing quality`);
      }
    }
  }, [isInitialized, particleCount, minDistance, animationSpeed, adaptiveQuality]);

  // Initialize scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Camera setup - positioned to capture full hero section animation
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    camera.position.z = 2500;
    cameraRef.current = camera;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    // Controls - adjusted for full hero section coverage
    const controls = new OrbitControls(camera, container);
    controls.minDistance = 1500;
    controls.maxDistance = 4000;
    controls.enabled = enableInteraction;
    controlsRef.current = controls;
    
    // Track controls for cleanup
    trackControls(controls);

    // Group for all objects
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    
    // Track group for cleanup
    trackObject(group);

    // Initialize neural network
    initNeuralNetwork();

    // Add to DOM
    container.appendChild(renderer.domElement);

    setIsInitialized(true);
  }, [enableInteraction, initNeuralNetwork]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
    
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Animation loop
  const renderLoop = useCallback(() => {
    if (!isInitialized) return;

    animate();
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    // Use safe animation frame
    animationIdRef.current = createSafeAnimationFrame(renderLoop);
  }, [isInitialized, animate, createSafeAnimationFrame]);

  // Initialize on mount
  useEffect(() => {
    initScene();
    
    // Add resize listener with safe tracking
    addSafeEventListener(window, 'resize', handleResize);
    
    return () => {
      console.log('🧹 Cleaning up NeuralNetworkAnimation...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (mountRef.current && rendererRef.current?.domElement && 
          rendererRef.current.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      

    };
  }, [initScene, handleResize, addSafeEventListener, cleanup]);

  // Start animation loop
  useEffect(() => {
    if (isInitialized) {
      renderLoop();
    }
    
    return () => {
      // Animation cleanup is handled by the cleanup system
      console.log('🔄 Stopping NeuralNetworkAnimation render loop...');
    };
  }, [isInitialized, renderLoop]);

  // Cleanup is now handled by the main useEffect with the cleanup system

  return (
    <div 
      ref={mountRef} 
      className={`neural-network-animation ${className}`}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0,
        pointerEvents: enableInteraction ? 'auto' : 'none'
      }}
    >

    </div>
  );
}
