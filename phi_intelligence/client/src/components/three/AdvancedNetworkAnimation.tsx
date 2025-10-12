import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


interface AdvancedNetworkAnimationProps {
  className?: string;
  enableInteraction?: boolean;
}

export default function AdvancedNetworkAnimation({ 
  className = "", 
  enableInteraction = true 
}: AdvancedNetworkAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  

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
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disable antialiasing for faster rendering
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });

    // Track resources for cleanup
    trackScene(scene);
    trackCamera(camera);
    trackRenderer(renderer);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Initialize arrays
    const coreNodes: any[] = [];
    const middleNodes: any[] = [];
    const outerNodes: any[] = [];
    const connections: any[] = [];
    const dataLabels: any[] = [];
    const wireframeSpheres: any[] = [];

    let time = 0;

    // Initialize
    const init = () => {
      // Renderer setup
      renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current!.appendChild(renderer.domElement);

      // Camera position
      camera.position.set(0, 0, 25);

      // Start visualization immediately without delay
      createVisualization();
    };

    const createVisualization = () => {
      // Create background starfield
      createEnhancedStarfield();
      
      // Create wireframe spheres at different layers
      createWireframeSpheres();
      
      // Create multi-layered node structure
      createMultiLayerNodes();
      
      // Create sophisticated connections
      createAdvancedConnections();
      
      // Create floating data labels
      createDataLabels();
      
      // Setup advanced lighting
      setupAdvancedLighting();
      
      // Event listeners
      if (enableInteraction) {
        setupEventListeners();
      }
      
      // Start animation
      animate();
    };

    const createEnhancedStarfield = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.4
      });
      
      const starsVertices = [];
      
      // Reduced star count for better performance
      for (let i = 0; i < 8000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      
      const starField = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(starField);
    };

    const createWireframeSpheres = () => {
      const radii = [3, 6, 9, 12];
      
      radii.forEach((radius, index) => {
        const geometry = new THREE.IcosahedronGeometry(radius, 2);
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.08 + (index * 0.03),
          side: THREE.DoubleSide
        });
        
        const wireframe = new THREE.Mesh(geometry, material);
        wireframe.userData = { 
          originalOpacity: material.opacity,
          rotationSpeed: 0.001 + (index * 0.0005)
        };
        
        wireframeSpheres.push(wireframe);
        scene.add(wireframe);
      });
    };

    const createMultiLayerNodes = () => {
      // Core sphere - dense inner network
      createNodeLayer(2.5, 40, coreNodes, {
        color: 0xffffff,
        size: 0.08,
        glowSize: 0.25,
        glowIntensity: 0.3
      });
      
      // Middle layer
      createNodeLayer(5.5, 60, middleNodes, {
        color: 0xffffff,
        size: 0.06,
        glowSize: 0.2,
        glowIntensity: 0.25
      });
      
      // Outer layer
      createNodeLayer(8.5, 80, outerNodes, {
        color: 0xffffff,
        size: 0.04,
        glowSize: 0.15,
        glowIntensity: 0.2
      });
    };

    const createNodeLayer = (radius: number, nodeCount: number, nodeArray: any[], config: any) => {
      const nodeGeometry = new THREE.SphereGeometry(config.size, 8, 8);
      
      for (let i = 0; i < nodeCount; i++) {
        // Fibonacci sphere distribution
        const theta = Math.acos(-1 + (2 * i) / nodeCount);
        const phi = Math.sqrt(nodeCount * Math.PI) * theta;
        
        const x = radius * Math.cos(phi) * Math.sin(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(theta);
        
        // Main node
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: 0.9
        });
        
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(x, y, z);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(config.glowSize, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: config.glowIntensity,
          side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(node.position);
        
        // Store node data
        const nodeData = {
          mesh: node,
          glow: glow,
          originalPosition: node.position.clone(),
          pulseOffset: Math.random() * Math.PI * 2,
          layer: radius
        };
        
        nodeArray.push(nodeData);
        scene.add(node);
        scene.add(glow);
      }
    };

    const createAdvancedConnections = () => {
      // Clear existing connections first
      connections.forEach(connection => {
        if (connection.parent) {
          connection.parent.remove(connection);
        }
      });
      connections.length = 0;
      
      // Inter-layer connections
      createLayerConnections(coreNodes, middleNodes, 0.4, 0xffffff);
      createLayerConnections(middleNodes, outerNodes, 0.3, 0xffffff);
      
      // Intra-layer connections
      createIntraLayerConnections(coreNodes, 2.5, 0.5, 0xffffff);
      createIntraLayerConnections(middleNodes, 3.0, 0.4, 0xffffff);
      createIntraLayerConnections(outerNodes, 4.0, 0.3, 0xffffff);
    };

    const createLayerConnections = (layer1: any[], layer2: any[], opacity: number, color: number) => {
      for (let i = 0; i < Math.min(layer1.length, 30); i++) {
        const node1 = layer1[i];
        const closestNodes = findClosestNodes(node1, layer2, 3);
        
        closestNodes.forEach((node2: any) => {
          createConnection(node1.mesh.position, node2.mesh.position, opacity, color);
        });
      }
    };

    const createIntraLayerConnections = (layer: any[], maxDistance: number, opacity: number, color: number) => {
      for (let i = 0; i < layer.length; i++) {
        for (let j = i + 1; j < layer.length; j++) {
          const distance = layer[i].mesh.position.distanceTo(layer[j].mesh.position);
          
          if (distance < maxDistance && Math.random() < 0.15) {
            createConnection(layer[i].mesh.position, layer[j].mesh.position, opacity, color);
          }
        }
      }
    };

    const findClosestNodes = (targetNode: any, nodeArray: any[], count: number) => {
      const distances = nodeArray.map((node: any) => ({
        node: node,
        distance: targetNode.mesh.position.distanceTo(node.mesh.position)
      }));
      
      distances.sort((a: any, b: any) => a.distance - b.distance);
      return distances.slice(0, count).map((d: any) => d.node);
    };

    const createConnection = (pos1: THREE.Vector3, pos2: THREE.Vector3, opacity: number, color: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = [pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z];
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        linewidth: 1
      });
      
      const line = new THREE.Line(geometry, material);
      line.userData = { 
        originalOpacity: opacity,
        pulseOffset: Math.random() * Math.PI * 2
      };
      
      connections.push(line);
      scene.add(line);
    };

    const createDataLabels = () => {
      const companyServices = [
        'VOICE_AI', 'WORKFORCE_ANALYTICS', 'BUSINESS_INTELLIGENCE', 'AI_INTEGRATION',
        'SOFTWARE_DEVELOPMENT', 'WEB_DEVELOPMENT', 'MOBILE_APPS', 'CUSTOM_AI',
        'DATA_ANALYTICS', 'PREDICTIVE_MODELS', 'MACHINE_LEARNING', 'DEEP_LEARNING',
        'NATURAL_LANGUAGE', 'COMPUTER_VISION', 'ROBOTICS', 'EXPERT_SYSTEMS'
      ];
      
      const companyProducts = [
        'VOICEBOT_PLATFORM', 'WORKFORCE_SUITE', 'BI_PLATFORM', 'AI_VOICE_ASSISTANT',
        'SCHEDULING_ALGORITHM', 'PERFORMANCE_TRACKING', 'PREDICTIVE_ANALYTICS', 'REAL_TIME_DASHBOARDS',
        'CRM_INTEGRATION', 'API_SERVICES', 'CLOUD_INFRASTRUCTURE', 'MOBILE_APPS',
        'VOICE_SYNTHESIS', 'SPEECH_RECOGNITION', 'SENTIMENT_ANALYSIS', 'AUTOMATION_TOOLS'
      ];
      
      const companySolutions = [
        'CUSTOMER_SUPPORT', 'APPOINTMENT_SCHEDULING', 'LEAD_QUALIFICATION', 'ORDER_PROCESSING',
        'FAQ_HANDLING', 'STAFF_MANAGEMENT', 'HEALTHCARE_SCHEDULING', 'MANUFACTURING_SHIFTS',
        'FIELD_SERVICE', 'RESTAURANT_OPS', 'SALES_ANALYSIS', 'CUSTOMER_BEHAVIOR',
        'OPERATIONAL_EFFICIENCY', 'FINANCIAL_FORECASTING', 'MARKET_TRENDS', 'RESOURCE_OPTIMIZATION'
      ];
      
      // Create 40 data labels distributed around the visualization (reduced for better performance)
      for (let i = 0; i < 40; i++) {
        let text: string, color: string;
        const rand = Math.random();
        
        if (rand < 0.4) {
          text = companyServices[Math.floor(Math.random() * companyServices.length)];
          color = '#ffffff';
        } else if (rand < 0.7) {
          text = companyProducts[Math.floor(Math.random() * companyProducts.length)];
          color = '#ffffff';
        } else {
          text = companySolutions[Math.floor(Math.random() * companySolutions.length)];
          color = '#ffffff';
        }
        
        const sprite = createAdvancedTextSprite(text, color);
        
        // Position in 3D space around the network
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 10;
        
        sprite.position.x = Math.cos(angle1) * Math.cos(angle2) * distance;
        sprite.position.y = Math.sin(angle1) * Math.cos(angle2) * distance;
        sprite.position.z = Math.sin(angle2) * distance;
        
        sprite.userData = {
          originalPosition: sprite.position.clone(),
          orbitSpeed: (Math.random() - 0.5) * 0.01,
          floatSpeed: (Math.random() - 0.5) * 0.005,
          scale: sprite.scale.clone(),
          pulseOffset: Math.random() * Math.PI * 2
        };
        
        dataLabels.push(sprite);
        scene.add(sprite);
      }
      
      // Create connections between text labels and outer mesh
      // Only create connections if we have nodes to connect to
      if (outerNodes.length > 0 || middleNodes.length > 0) {
        createTextToMeshConnections();
      }
    };

    const createAdvancedTextSprite = (text: string, color: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const fontSize = 10;
      
      canvas.width = 150;
      canvas.height = 30;
      
      if (!context) return new THREE.Sprite();
      
      // Clear canvas with transparent background
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a subtle background for better readability
      context.fillStyle = 'rgba(0, 0, 0, 0.3)';
      context.fillRect(5, 5, canvas.width - 10, canvas.height - 10);
      
      // Draw thicker border for better visibility
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      
      // Draw text with better styling
      context.fillStyle = color;
      context.font = `bold ${fontSize}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.shadowColor = 'rgba(0, 0, 0, 0.8)';
      context.shadowBlur = 2;
      context.shadowOffsetX = 1;
      context.shadowOffsetY = 1;
      
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95
      });
      
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(3, 0.8, 1);
      
      return sprite;
    };

    const createTextToMeshConnections = () => {
      // Clear any existing text-mesh connections from scene and connections array
      scene.children = scene.children.filter(child => 
        !child.userData || child.userData.type !== 'text-mesh-connection'
      );
      
      // Remove text-mesh connections from connections array
      connections.splice(0, connections.length, ...connections.filter(conn => 
        !conn.userData || conn.userData.type !== 'text-mesh-connection'
      ));
      
      // Create light connecting lines between ALL text labels and mesh nodes
      dataLabels.forEach((sprite, index) => {
        // Find the closest mesh node (outer or middle)
        const closestNode = findClosestMeshNode(sprite.position);
        
        if (closestNode && closestNode.mesh && closestNode.mesh.position) {
          // Create a subtle connecting line
          const connection = createTextMeshConnection(sprite.position, closestNode.mesh.position);
          connections.push(connection);
          scene.add(connection);
        }
      });
    };

    const findClosestMeshNode = (textPosition: THREE.Vector3) => {
      let closestNode: any = null;
      let closestDistance = Infinity;
      
      // Check outer nodes (last layer) first
      if (outerNodes.length > 0) {
        outerNodes.forEach((nodeData: any) => {
          if (nodeData && nodeData.mesh && nodeData.mesh.position) {
            const distance = textPosition.distanceTo(nodeData.mesh.position);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestNode = nodeData;
            }
          }
        });
      }
      
      // Check middle nodes if no outer node found or if outer node is too far
      if (middleNodes.length > 0 && (closestDistance > 25 || !closestNode)) {
        middleNodes.forEach((nodeData: any) => {
          if (nodeData && nodeData.mesh && nodeData.mesh.position) {
            const distance = textPosition.distanceTo(nodeData.mesh.position);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestNode = nodeData;
            }
          }
        });
      }
      
      // Check core nodes if no other node found
      if (coreNodes.length > 0 && !closestNode) {
        coreNodes.forEach((nodeData: any) => {
          if (nodeData && nodeData.mesh && nodeData.mesh.position) {
            const distance = textPosition.distanceTo(nodeData.mesh.position);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestNode = nodeData;
            }
          }
        });
      }
      
      return closestNode;
    };

    const createTextMeshConnection = (textPos: THREE.Vector3, meshPos: THREE.Vector3) => {
      // Create sharp angular bends (like circuit board connections)
      const bendPoint1 = new THREE.Vector3(
        textPos.x + (meshPos.x - textPos.x) * 0.4,
        textPos.y,
        textPos.z
      );
      
      const bendPoint2 = new THREE.Vector3(
        textPos.x + (meshPos.x - textPos.x) * 0.6,
        meshPos.y,
        textPos.z
      );
      
      // Create three separate line segments for sharp bends
      const segment1 = createLineSegment(textPos, bendPoint1);
      const segment2 = createLineSegment(bendPoint1, bendPoint2);
      const segment3 = createLineSegment(bendPoint2, meshPos);
      
      // Group all segments together
      const group = new THREE.Group();
      group.add(segment1);
      group.add(segment2);
      group.add(segment3);
      
      group.userData = { 
        originalOpacity: 0.15,
        pulseOffset: Math.random() * Math.PI * 2,
        type: 'text-mesh-connection',
        segments: [segment1, segment2, segment3]
      };
      
      return group;
    };

    const createLineSegment = (start: THREE.Vector3, end: THREE.Vector3) => {
      const geometry = new THREE.BufferGeometry();
      const positions = [start.x, start.y, start.z, end.x, end.y, end.z];
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        linewidth: 1
      });
      
      return new THREE.Line(geometry, material);
    };

    const setupAdvancedLighting = () => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);
      
      // Primary lights with white colors
      const coreLight = new THREE.PointLight(0xffffff, 1.5, 50);
      coreLight.position.set(0, 0, 0);
      scene.add(coreLight);
      
      const midLight = new THREE.PointLight(0xffffff, 1.2, 100);
      midLight.position.set(15, 15, 15);
      scene.add(midLight);
      
      const outerLight = new THREE.PointLight(0xffffff, 0.8, 150);
      outerLight.position.set(-15, -15, 15);
      scene.add(outerLight);
      
      // Directional light for overall illumination
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
      dirLight.position.set(10, 10, 5);
      scene.add(dirLight);
    };

    const setupEventListeners = () => {
      if (!renderer.domElement) return;
      
      renderer.domElement.addEventListener('click', (event) => {
        onMouseClick(event);
      });
    };

    const onMouseClick = (event: MouseEvent) => {
      if (!containerRef.current || !camera) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      const allNodes = [...coreNodes, ...middleNodes, ...outerNodes];
      const intersects = raycaster.intersectObjects(allNodes.map((n: any) => n.mesh));
      
      if (intersects.length > 0) {
        const node = intersects[0].object;
        // Ripple effect on click
        createRippleEffect(node.position);
      }
    };

    const createRippleEffect = (position: THREE.Vector3) => {
      const rippleGeometry = new THREE.RingGeometry(0, 5, 32);
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      
      const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
      ripple.position.copy(position);
      scene.add(ripple);
      
      // Track ripple for cleanup
      trackObject(ripple);
      trackGeometry(ripple.geometry);
      trackMaterial(ripple.material);
      
      // Animate ripple
      const startTime = Date.now();
      const animateRipple = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 1000;
        
        if (progress < 1) {
          ripple.scale.setScalar(1 + progress * 2);
          ripple.material.opacity = 0.4 * (1 - progress);
          createSafeAnimationFrame(animateRipple);
        } else {
          scene.remove(ripple);
          // Dispose ripple resources
          ripple.geometry.dispose();
          ripple.material.dispose();
        }
      };
      animateRipple();
    };

    const animate = () => {
      time = Date.now() * 0.001;
      
      // Rotate wireframe spheres
      wireframeSpheres.forEach((sphere: any, index: number) => {
        sphere.rotation.y += sphere.userData.rotationSpeed;
        sphere.rotation.x += sphere.userData.rotationSpeed * 0.5;
        
        // Pulse opacity
        const pulse = 1 + Math.sin(time * 2 + index) * 0.3;
        sphere.material.opacity = sphere.userData.originalOpacity * pulse;
      });
      
      // Animate all node layers
      [coreNodes, middleNodes, outerNodes].forEach(layer => {
        layer.forEach((nodeData: any, index: number) => {
          // Gentle orbital rotation
          const rotationMatrix = new THREE.Matrix4();
          rotationMatrix.makeRotationY(time * 0.02 * (1 + nodeData.layer * 0.1));
          
          const newPosition = nodeData.originalPosition.clone();
          newPosition.applyMatrix4(rotationMatrix);
          
          nodeData.mesh.position.copy(newPosition);
          nodeData.glow.position.copy(newPosition);
          
          // Node pulsing
          const pulse = 1 + Math.sin(time * 3 + nodeData.pulseOffset) * 0.15;
          nodeData.mesh.scale.setScalar(pulse);
          nodeData.glow.scale.setScalar(pulse);
        });
      });
      
      // Animate connections with data flow effect
      connections.forEach((connection: any, index: number) => {
        if (connection.userData.type === 'text-mesh-connection') {
          // Subtle pulsing for text-mesh connections (grouped segments)
          const pulse = 0.8 + Math.sin(time * 2 + connection.userData.pulseOffset) * 0.2;
          if (connection.userData.segments) {
            connection.userData.segments.forEach((segment: any) => {
              segment.material.opacity = connection.userData.originalOpacity * pulse;
            });
          }
        } else {
          // Regular pulsing for neural network connections
          const pulse = 0.3 + Math.sin(time * 4 + connection.userData.pulseOffset) * 0.3;
          connection.material.opacity = connection.userData.originalOpacity * pulse;
        }
      });
      
      // Animate floating data labels
      dataLabels.forEach((sprite: any, index: number) => {
        const userData = sprite.userData;
        
        // Orbital motion
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(time * userData.orbitSpeed);
        rotationMatrix.multiply(new THREE.Matrix4().makeRotationZ(time * userData.floatSpeed));
        
        sprite.position.copy(userData.originalPosition);
        sprite.position.applyMatrix4(rotationMatrix);
        
        // Scale pulsing
        const pulse = 1 + Math.sin(time * 1.5 + userData.pulseOffset) * 0.1;
        sprite.scale.copy(userData.scale).multiplyScalar(pulse);
        
        // Always face camera
        sprite.lookAt(camera.position);
      });
      
      // Smooth camera movement
      const radius = 25;
      camera.position.x = Math.cos(time * 0.05) * radius;
      camera.position.z = Math.sin(time * 0.05) * radius;
      camera.position.y = Math.sin(time * 0.03) * 8;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
      
      // Use safe animation frame
      animationRef.current = createSafeAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Initialize
    init();

    // Add resize listener with safe tracking
    addSafeEventListener(window, 'resize', handleResize);

    // Initialize
    init();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up AdvancedNetworkAnimation...');
      
      // Use comprehensive cleanup system
      cleanup();
      
      // Remove DOM element
      if (renderer && containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      

    };
  }, [enableInteraction]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
      style={{ background: '#000000' }}
    />
  );
}
