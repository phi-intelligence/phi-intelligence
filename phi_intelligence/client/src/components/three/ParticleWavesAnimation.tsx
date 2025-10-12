import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


// Vertex shader for particle positioning and sizing
const vertexShader = `
  attribute float scale;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = scale * ( 300.0 / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for circular particle rendering
const fragmentShader = `
  uniform vec3 color;
  
  void main() {
    if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
    gl_FragColor = vec4( color, 1.0 );
  }
`;

export default function ParticleWavesAnimation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  

  const {
    trackGeometry,
    trackMaterial,
    trackRenderer,
    trackScene,
    trackCamera,
    trackAnimationFrame,
    trackEventListener,
    createSafeAnimationFrame,
    addSafeEventListener,
    cleanup
  } = useThreeCleanup();

  useEffect(() => {
    if (!mountRef.current) return;

    // Animation constants
    const SEPARATION = 100;
    const AMOUNTX = 50;
    const AMOUNTY = 50;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Enable transparency
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    // Particle generation
    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
        positions[i + 1] = 0; // y
        positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
        scales[j] = 1;
        i += 3;
        j++;
      }
    }

    // Geometry and material
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    
    // Track geometry for cleanup
    trackGeometry(geometry);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) }, // White particles
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    // Track material for cleanup
    trackMaterial(material);

    // Create particles
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Add to DOM
    mountRef.current.appendChild(renderer.domElement);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onPointerMove = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    // Animation variables
    let count = 0;

    // Animation loop
    const animate = () => {
      // Camera movement based on mouse
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Update particle positions and scales
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const scales = particles.geometry.attributes.scale.array as Float32Array;

      let i = 0, j = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                             (Math.sin((iy + count) * 0.5) * 50);

          scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 20 +
                      (Math.sin((iy + count) * 0.5) + 1) * 20;

          i += 3;
          j++;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.1;

      // Use safe animation frame
      animationIdRef.current = createSafeAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Event listeners with safe tracking
    addSafeEventListener(document, 'pointermove', onPointerMove as EventListener);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    addSafeEventListener(window, 'resize', handleResize);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up ParticleWavesAnimation...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (mountRef.current && renderer.domElement && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      

    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="particle-waves-animation absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
