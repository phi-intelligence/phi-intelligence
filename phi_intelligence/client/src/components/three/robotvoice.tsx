import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';
import { GLTFLoader } from 'three-stdlib';

const robotModelUrl = '/assets/meshkh.glb';

const Robot3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotRef = useRef<THREE.Group | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  const {
    trackRenderer,
    trackScene,
    trackCamera,
    trackObject,
    createSafeAnimationFrame,
    addSafeEventListener,
    cleanup
  } = useThreeCleanup();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    let isDisposed = false;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    trackScene(scene);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 4); 
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;
    trackCamera(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    trackRenderer(renderer);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dl = new THREE.DirectionalLight(0xffffff, 1.5);
    dl.position.set(5, 5, 5);
    scene.add(dl);

    // Robot
    const robotGroup = new THREE.Group();
    robotGroup.position.y = -1.2; 
    scene.add(robotGroup);
    robotRef.current = robotGroup;
    trackObject(robotGroup);

    const loader = new GLTFLoader();
    loader.load(robotModelUrl, (gltf) => {
      if (isDisposed) return;
      const model = gltf.scene;
      model.scale.set(0.2, 0.2, 0.2);
      model.position.y = 0.2;
      
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          if (child.material) {
            child.material.color = new THREE.Color(0x333333);
            child.material.metalness = 0.8;
            child.material.roughness = 0.2;
          }
        }
      });
      
      robotGroup.add(model);
      setModelLoaded(true);
    });

    const animate = () => {
      if (isDisposed) return;
      createSafeAnimationFrame(animate);
      
      if (robotRef.current && modelLoaded) {
        robotRef.current.position.y = -1.2 + Math.sin(Date.now() * 0.001) * 0.05;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    const handleResize = () => {
      if (isDisposed || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(w, h);
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    
    addSafeEventListener(window, 'resize', handleResize);

    return () => {
      isDisposed = true;
      cleanup();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Nullify refs
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      robotRef.current = null;
    };
  }, [cleanup]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Robot3D;