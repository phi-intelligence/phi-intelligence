// Three.js Utilities for phi_intelligence
// Adapted from phi-intelligence project

import * as THREE from 'three';
import { gsap } from 'gsap';

// Performance optimization utilities
export const createOptimizedGeometry = (type: 'box' | 'sphere' | 'plane', params: any) => {
  let geometry: THREE.BufferGeometry;
  
  switch (type) {
    case 'box':
      geometry = new THREE.BoxGeometry(params.width || 1, params.height || 1, params.depth || 1);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(params.radius || 1, params.segments || 32, params.segments || 16);
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(params.width || 1, params.height || 1);
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }
  
  // Optimize geometry
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  
  return geometry;
};

// Material utilities
export const createOptimizedMaterial = (type: 'basic' | 'phong' | 'shader', params: any) => {
  let material: THREE.Material;
  
  switch (type) {
    case 'basic':
      material = new THREE.MeshBasicMaterial({
        color: params.color || 0xffffff,
        transparent: params.transparent || false,
        opacity: params.opacity || 1.0,
        wireframe: params.wireframe || false,
      });
      break;
    case 'phong':
      material = new THREE.MeshPhongMaterial({
        color: params.color || 0xffffff,
        transparent: params.transparent || false,
        opacity: params.opacity || 1.0,
        shininess: params.shininess || 30,
        specular: params.specular || 0x444444,
      });
      break;
    case 'shader':
      material = new THREE.ShaderMaterial({
        vertexShader: params.vertexShader || '',
        fragmentShader: params.fragmentShader || '',
        uniforms: params.uniforms || {},
        transparent: params.transparent || false,
      });
      break;
    default:
      material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }
  
  return material;
};

// Animation utilities with GSAP
export const animateMesh = (
  mesh: THREE.Mesh,
  animation: 'float' | 'rotate' | 'scale' | 'color',
  duration: number = 2,
  ease: string = 'power2.inOut'
) => {
  switch (animation) {
    case 'float':
      gsap.to(mesh.position, {
        y: mesh.position.y + 2,
        duration,
        ease,
        yoyo: true,
        repeat: -1,
      });
      break;
    case 'rotate':
      gsap.to(mesh.rotation, {
        y: mesh.rotation.y + Math.PI * 2,
        duration,
        ease,
        repeat: -1,
      });
      break;
    case 'scale':
      gsap.to(mesh.scale, {
        x: mesh.scale.x * 1.2,
        y: mesh.scale.y * 1.2,
        z: mesh.scale.z * 1.2,
        duration,
        ease,
        yoyo: true,
        repeat: -1,
      });
      break;
    case 'color':
      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        gsap.to(mesh.material.color, {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
          duration,
          ease,
          yoyo: true,
          repeat: -1,
        });
      }
      break;
  }
};

// Particle system utilities
export const createParticleSystem = (count: number, params: any) => {
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    // Positions
    positions[i * 3] = (Math.random() - 0.5) * (params.spread || 10);
    positions[i * 3 + 1] = (Math.random() - 0.5) * (params.spread || 10);
    positions[i * 3 + 2] = (Math.random() - 0.5) * (params.spread || 10);
    
    // Colors
    colors[i * 3] = params.color?.r || Math.random();
    colors[i * 3 + 1] = params.color?.g || Math.random();
    colors[i * 3 + 2] = params.color?.b || Math.random();
    
    // Sizes
    sizes[i] = params.size || Math.random() * 2;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  return particles;
};

// Camera utilities
export const createOptimizedCamera = (type: 'perspective' | 'orthographic', params: any) => {
  let camera: THREE.Camera;
  
  if (type === 'perspective') {
    camera = new THREE.PerspectiveCamera(
      params.fov || 75,
      params.aspect || window.innerWidth / window.innerHeight,
      params.near || 0.1,
      params.far || 1000
    );
  } else {
    camera = new THREE.OrthographicCamera(
      params.left || -1,
      params.right || 1,
      params.top || 1,
      params.bottom || -1,
      params.near || 0.1,
      params.far || 1000
    );
  }
  
  // Set initial position
  camera.position.set(
    params.position?.x || 0,
    params.position?.y || 0,
    params.position?.z || 5
  );
  
  return camera;
};

// Renderer utilities
export const createOptimizedRenderer = (canvas: HTMLCanvasElement, params: any) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: params.alpha || false,
    antialias: params.antialias || true,
    powerPreference: 'high-performance',
  });
  
  renderer.setSize(
    params.width || window.innerWidth,
    params.height || window.innerHeight
  );
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = params.shadows || false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  return renderer;
};

// Scene utilities
export const createOptimizedScene = () => {
  const scene = new THREE.Scene();
  
  // Add fog for depth
  scene.fog = new THREE.Fog(0x000000, 1, 100);
  
  return scene;
};

// Lighting utilities
export const createOptimizedLighting = (scene: THREE.Scene) => {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
  // Directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Point light
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(-10, -10, -5);
  scene.add(pointLight);
  
  return { ambientLight, directionalLight, pointLight };
};

// Performance monitoring
export const createPerformanceMonitor = (renderer: THREE.WebGLRenderer) => {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;
  
  const updateFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      
      // Log FPS in development
      if (import.meta.env.DEV) {
        console.log(`FPS: ${fps}`);
      }
    }
    
    requestAnimationFrame(updateFPS);
  };
  
  updateFPS();
  
  return {
    getFPS: () => fps,
    getFrameCount: () => frameCount,
  };
};

// Cleanup utilities
export const disposeObject = (object: THREE.Object3D) => {
  if (object instanceof THREE.Mesh) {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  }
  
  // Remove from parent
  if (object.parent) {
    object.parent.remove(object);
  }
};

export default {
  createOptimizedGeometry,
  createOptimizedMaterial,
  animateMesh,
  createParticleSystem,
  createOptimizedCamera,
  createOptimizedRenderer,
  createOptimizedScene,
  createOptimizedLighting,
  createPerformanceMonitor,
  disposeObject,
};
