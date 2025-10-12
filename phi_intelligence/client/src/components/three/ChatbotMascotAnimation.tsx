import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


interface ChatbotMascotAnimationProps {
  className?: string;
  enableInteraction?: boolean;
}

export default function ChatbotMascotAnimation({ 
  className = '',
  enableInteraction = false
}: ChatbotMascotAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  

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
    scene.background = new THREE.Color(0x000000); // Black background to match theme
    sceneRef.current = scene;
    
    // Track scene for cleanup
    trackScene(scene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.8, 5.2);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;
    
    // Track camera for cleanup
    trackCamera(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;
    
    // Track renderer for cleanup
    trackRenderer(renderer);

    mountRef.current.appendChild(renderer.domElement);

    // Colors - Black and white theme
    const colors = {
      bg: 0x000000,      // black background
      disc: 0x333333,    // dark grey circle behind bot
      navy: 0xffffff,    // white outline
      white: 0xffffff,
      bubble: 0xffffff,
      eye: 0xffffff
    };

    // Lights - White lighting for black/white theme
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2.2, 3.0, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-2.2, 2.5, -2.5);
    scene.add(rim);

    // Utility: add back-face scaled mesh for a bold cartoon OUTLINE
    function addOutline(obj: THREE.Mesh, color = colors.navy, scale = 1.04) {
      const outline = new THREE.Mesh(
        obj.geometry.clone(),
        new THREE.MeshBasicMaterial({ color, side: THREE.BackSide })
      );
      outline.position.copy(obj.position);
      outline.quaternion.copy(obj.quaternion);
      outline.scale.copy(obj.scale).multiplyScalar(scale);
      obj.add(outline);
      return outline;
    }

    // Backdrop: cyan disc
    const discGeom = new THREE.CircleGeometry(2.2, 96);
    const discMat = new THREE.MeshBasicMaterial({ color: colors.disc });
    
    // Track geometry and material for cleanup
    trackGeometry(discGeom);
    trackMaterial(discMat);
    
    const disc = new THREE.Mesh(discGeom, discMat);
    disc.position.set(0, 0.9, -1.0);
    
    // Track disc object for cleanup
    trackObject(disc);
    
    scene.add(disc);

    // Ground shadow (soft ellipse)
    function makeShadowTexture(w = 256, h = 256) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 2, w * 0.5, h * 0.5, w * 0.48);
      g.addColorStop(0, 'rgba(0,0,0,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.48, h * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(c);
    }

    const shadowTex = makeShadowTexture();
    const shadowGeom = new THREE.PlaneGeometry(3.5, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    
    // Track shadow resources for cleanup
    trackGeometry(shadowGeom);
    trackMaterial(shadowMat);
    trackTexture(shadowTex);
    
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.15, 0.2);
    
    // Track shadow object for cleanup
    trackObject(shadow);
    
    scene.add(shadow);

    // BOT GROUP
    const bot = new THREE.Group();
    
    // Track bot group for cleanup
    trackObject(bot);
    
    scene.add(bot);

    // Head (white sphere with outline)
    const headGeom = new THREE.SphereGeometry(1, 64, 64);
    const headMat = new THREE.MeshStandardMaterial({
      color: colors.white,
      roughness: 0.25,
      metalness: 0.05
    });
    
    // Track head resources for cleanup
    trackGeometry(headGeom);
    trackMaterial(headMat);
    
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(0, 0.9, 0);
    
    // Track head object for cleanup
    trackObject(head);
    
    bot.add(head);
    addOutline(head, colors.navy, 1.05);

    // Visor patch (navy circular plate intersecting head)
    const visor = new THREE.Mesh(
      new THREE.CircleGeometry(0.78, 64),
      new THREE.MeshStandardMaterial({ color: colors.navy, roughness: 0.6, metalness: 0.0 })
    );
    visor.position.set(0, 0.95, 0.95);
    visor.rotation.x = -0.12;
    bot.add(visor);
    addOutline(visor, colors.navy, 1.08);

    // Small glossy highlight wedge (white cap)
    const wedge = new THREE.Mesh(
      new THREE.SphereGeometry(1.01, 64, 64, Math.PI * 1.1, Math.PI * 0.6, 0.0, Math.PI * 0.45),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
    );
    wedge.position.copy(head.position);
    wedge.rotation.set(0.0, 0.2, 0.0);
    bot.add(wedge);

    // Antenna (stem + ball)
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.6, 24),
      new THREE.MeshStandardMaterial({ color: colors.navy, roughness: 0.6 })
    );
    stem.position.set(0, 1.65, 0);
    bot.add(stem);
    addOutline(stem, colors.navy, 1.2);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 32, 16),
      new THREE.MeshStandardMaterial({ 
        color: colors.white, 
        emissive: 0xffffff, 
        emissiveIntensity: 0.8, 
        roughness: 0.3 
      })
    );
    tip.position.set(0, 1.96, 0);
    bot.add(tip);
    addOutline(tip, colors.navy, 1.25);

    // Eyes (capsules)
    function makeEye(x: number) {
      const g = new THREE.CapsuleGeometry(0.13, 0.18, 8, 16);
      const m = new THREE.MeshStandardMaterial({
        color: colors.white,
        emissive: 0xffffff,
        emissiveIntensity: 1.0,
        roughness: 0.2,
        metalness: 0.0
      });
      const e = new THREE.Mesh(g, m);
      e.position.set(x, 0.95, 1.02);
      e.rotation.x = -0.14;
      addOutline(e, colors.navy, 1.25);
      return e;
    }

    const eyeL = makeEye(-0.27);
    const eyeR = makeEye(0.27);
    bot.add(eyeL, eyeR);

    // Speech bubbles (planes from canvas textures)
    function makeBubbleTexture({ w = 256, h = 160, showQ = true } = {}) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      const r = 24; // radius
      
      // Rounded rect
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#000000';
      const x = 10, y = 10, W = w - 20, H = h - 20;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + W, y, x + W, y + H, r);
      ctx.arcTo(x + W, y + H, x, y + H, r);
      ctx.arcTo(x, y + H, x, y, r);
      ctx.arcTo(x, y, x + W, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h - 10);
      ctx.lineTo(w * 0.22, h + 10);
      ctx.lineTo(w * 0.40, h - 10);
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Lines
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      const L = [[w * 0.18, h * 0.40, w * 0.60, h * 0.40], [w * 0.18, h * 0.56, w * 0.48, h * 0.56]];
      for (const [x1, y1, x2, y2] of L) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      if (showQ) {
        // Question mark + dot
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(w * 0.78, h * 0.42, 22, Math.PI * 0.1, Math.PI * 1.2, true);
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w * 0.78, h * 0.70, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    function makeBubble(radius = 1.7, phase = 0, withQ = true) {
      const tex = makeBubbleTexture({ showQ: withQ });
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
      const aspect = tex.image.width / tex.image.height;
      const geo = new THREE.PlaneGeometry(1.6 * aspect * 0.35, 1.6 * 0.35);
      const plane = new THREE.Mesh(geo, mat);
      plane.userData = { radius, phase, bobAmp: 0.07, bobHz: 0.5 + Math.random() * 0.3 };
      return plane;
    }

    const bubbles = [
      makeBubble(2.6, 0.1, true),
      makeBubble(2.2, 1.7, false),
      makeBubble(2.0, 3.2, true),
      makeBubble(2.4, 4.6, false),
    ];
    for (const b of bubbles) scene.add(b);

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

    // Animation
    let t0 = performance.now();
    function tick() {
      const t = (performance.now() - t0) * 0.001;

      // Gentle bot bob + look
      head.position.y = 0.9 + Math.sin(t * 1.2) * 0.02;
      visor.position.y = 0.95 + Math.sin(t * 1.2) * 0.02;
      eyeL.position.y = 0.95 + Math.sin(t * 1.2) * 0.02;
      eyeR.position.y = 0.95 + Math.sin(t * 1.2) * 0.02;
      tip.position.y = 1.96 + Math.sin(t * 2.0) * 0.03;
      wedge.rotation.y = 0.18 + Math.sin(t * 0.6) * 0.05;

      // Subtle eye blink (scale on Y)
      const blink = (Math.sin(t * 2.7) + 1) / 2; // 0..1
      const sY = 0.85 + 0.15 * blink;
      eyeL.scale.set(1, sY, 1);
      eyeR.scale.set(1, sY, 1);

      // Speech bubbles orbit + bob
      const orbitHz = 0.08;
      bubbles.forEach((b, i) => {
        const ang = t * orbitHz * 2 * Math.PI + b.userData.phase;
        b.position.set(
          Math.cos(ang) * b.userData.radius,
          1.1 + Math.sin(t * b.userData.bobHz) * b.userData.bobAmp,
          Math.sin(ang) * b.userData.radius * 0.25
        );
        b.lookAt(camera.position);
      });

      renderer.render(scene, camera);
      // Use safe animation frame
      animationIdRef.current = createSafeAnimationFrame(tick);
    }

    // Start animation
    tick();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up ChatbotMascotAnimation...');
      
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
      className={`chatbot-mascot-animation ${className}`}
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

