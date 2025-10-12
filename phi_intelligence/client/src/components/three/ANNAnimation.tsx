import React, { useEffect, useRef, useState } from 'react';
import { useThreeCleanup } from '@/hooks/use-three-cleanup';


interface ANNAnimationProps {
  className?: string;
  enableInteraction?: boolean;
}

interface Neuron {
  id: number;
  x: number;
  y: number;
  layer: number;
  activation: number;
  targetActivation: number;
  radius: number;
  lastActivation: number;
  connections: Connection[];
}

interface Connection {
  from: Neuron;
  to: Neuron;
  weight: number;
  activation: number;
  delay: number;
}

export default function ANNAnimation({ 
  className = '',
  enableInteraction = true
}: ANNAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<NeuralNetwork | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  

  const {
    trackEventListener,
    addSafeEventListener,
    cleanup
  } = useThreeCleanup();

  class NeuralNetwork {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    neurons: Neuron[];
    connections: Connection[];
    activationQueue: any[];
    animationSpeed: number;
    connectionDensity: number;
    isAnimating: boolean;
    isVisible: boolean;
    
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d')!;
      this.neurons = [];
      this.connections = [];
      this.activationQueue = [];
      this.animationSpeed = 4; // Increased speed for more responsive animation
      this.connectionDensity = 0.4; // Slightly higher density for better visual connections
      this.isAnimating = true;
      this.isVisible = false;
      
      this.resize();
      this.initializeNetwork();
      this.animate();
      
      // Event listeners
      window.addEventListener('resize', () => this.resize());
      if (enableInteraction) {
        canvas.addEventListener('click', (e) => this.handleClick(e));
      }
    }
    
    resize() {
      // Get the actual container dimensions for responsive design
      const container = this.canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
      } else {
        // Fallback to canvas element dimensions
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
      }
      
      // Reinitialize network after resize to reposition neurons
      this.initializeNetwork();
    }
    
    initializeNetwork() {
      this.neurons = [];
      this.connections = [];
      
      // Create layered network structure - optimized neuron count
      const layers = [3, 4, 5, 4, 3]; // Input -> Hidden -> Output (3-4-5-4-3 configuration)
      const layerSpacing = this.canvas.width / (layers.length + 1);
      const margin = Math.min(60, this.canvas.height * 0.08); // Responsive margin
      
      let neuronId = 0;
      
      // Create neurons in layers
      for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        const neuronsInLayer = layers[layerIndex];
        const availableHeight = this.canvas.height - (2 * margin);
        const neuronSpacing = availableHeight / Math.max(neuronsInLayer - 1, 1);
        const x = layerSpacing * (layerIndex + 1);
        
        for (let neuronIndex = 0; neuronIndex < neuronsInLayer; neuronIndex++) {
          let y;
          
          if (layerIndex === 0 || layerIndex === layers.length - 1) {
            // Center the input and output layers vertically
            const totalSpacing = (neuronsInLayer - 1) * (availableHeight / Math.max(neuronsInLayer - 1, 1) * 0.4);
            const startY = margin + (availableHeight - totalSpacing) / 2;
            y = startY + (neuronIndex * (availableHeight / Math.max(neuronsInLayer - 1, 1) * 0.4));
          } else {
            // Normal positioning for hidden layers
            y = margin + (neuronIndex * neuronSpacing);
          }
          
          this.neurons.push({
            id: neuronId++,
            x: x, // Perfect alignment, no randomness
            y: y,
            layer: layerIndex,
            activation: 0,
            targetActivation: 0,
            radius: Math.min(18, Math.min(this.canvas.width, this.canvas.height) * 0.025), // Increased from 12 to 18 and from 0.015 to 0.025 for larger neurons
            lastActivation: 0,
            connections: []
          });
        }
      }
      
      // Create connections between adjacent layers
      this.createConnections();
      
      // Start initial activation
      this.startRandomActivation();
    }
    
    createConnections() {
      // First, ensure at least one connection between each layer
      const layers = [3, 4, 5, 4, 3];
      let neuronIndex = 0;
      
      for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
        const currentLayerSize = layers[layerIndex];
        const nextLayerSize = layers[layerIndex + 1];
        
        // Get neurons for current and next layer
        const currentLayerNeurons = this.neurons.slice(neuronIndex, neuronIndex + currentLayerSize);
        const nextLayerNeurons = this.neurons.slice(neuronIndex + currentLayerSize, neuronIndex + currentLayerSize + nextLayerSize);
        
        // Ensure at least one connection from each layer to the next
        currentLayerNeurons.forEach((neuron, i) => {
          const targetNeuron = nextLayerNeurons[i % nextLayerSize]; // Round-robin assignment
          const connection: Connection = {
            from: neuron,
            to: targetNeuron,
            weight: Math.random() * 0.8 + 0.2,
            activation: 0,
            delay: Math.random() * 10 + 5
          };
          
          this.connections.push(connection);
          neuron.connections.push(connection);
        });
        
        // Add additional random connections for visual richness
        currentLayerNeurons.forEach(neuron => {
          nextLayerNeurons.forEach(targetNeuron => {
            if (Math.random() < this.connectionDensity) {
              const connection: Connection = {
                from: neuron,
                to: targetNeuron,
                weight: Math.random() * 0.8 + 0.2,
                activation: 0,
                delay: Math.random() * 10 + 5
              };
              
              this.connections.push(connection);
              neuron.connections.push(connection);
            }
          });
        });
        
        neuronIndex += currentLayerSize;
      }
    }
    
    startRandomActivation() {
      // Activate random input neurons
      const inputNeurons = this.neurons.filter(n => n.layer === 0);
      const activateCount = Math.floor(Math.random() * 3) + 1; // 1-3 neurons at a time for more activity
      
      for (let i = 0; i < activateCount; i++) {
        const randomNeuron = inputNeurons[Math.floor(Math.random() * inputNeurons.length)];
        this.activateNeuron(randomNeuron);
      }
      
      // Schedule next random activation - much faster frequency
      setTimeout(() => {
        if (this.isAnimating) {
          this.startRandomActivation();
        }
      }, 300 + Math.random() * 500); // Very fast activation - reduced from 800-2000ms to 300-800ms
    }
    
    activateNeuron(neuron: Neuron) {
      neuron.targetActivation = 1;
      neuron.lastActivation = Date.now();
      
      // Queue connections to activate - faster propagation
      neuron.connections.forEach(connection => {
        setTimeout(() => {
          if (this.isAnimating) {
            connection.activation = 1;
            this.propagateActivation(connection);
          }
        }, connection.delay / this.animationSpeed);
      });
    }
    
    propagateActivation(connection: Connection) {
      const targetNeuron = connection.to;
      const activationStrength = connection.weight * connection.from.activation;
      
      if (activationStrength > 0.2) { // Lower threshold for more responsive propagation
        setTimeout(() => {
          if (this.isAnimating) {
            this.activateNeuron(targetNeuron);
          }
        }, 15 / this.animationSpeed); // Faster propagation for more responsive animation
      }
    }
    
    handleClick(event: MouseEvent) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Find closest neuron
      let closestNeuron: Neuron | null = null;
      let closestDistance = Infinity;
      
      this.neurons.forEach(neuron => {
        const distance = Math.sqrt((x - neuron.x) ** 2 + (y - neuron.y) ** 2);
        if (distance < neuron.radius * 2 && distance < closestDistance) {
          closestDistance = distance;
          closestNeuron = neuron;
        }
      });
      
      if (closestNeuron) {
        this.activateNeuron(closestNeuron);
      }
    }
    
    update() {
      if (!this.isAnimating || !this.isVisible) return;
      
      const currentTime = Date.now();
      
      // Update neurons
      this.neurons.forEach(neuron => {
        // Smooth activation transition
        const activationDiff = neuron.targetActivation - neuron.activation;
        neuron.activation += activationDiff * 0.2; // Faster transition speed for more responsive animation
        
        // Decay activation over time
        if (currentTime - neuron.lastActivation > 300) { // Faster decay for more dynamic animation
          neuron.targetActivation *= 0.9; // Faster decay rate for more responsive animation
        }
        
        // Clamp activation
        neuron.activation = Math.max(0, Math.min(1, neuron.activation));
      });
      
      // Update connections
      this.connections.forEach(connection => {
        connection.activation *= 0.85; // Faster decay rate for more dynamic animation
        if (connection.activation < 0.01) {
          connection.activation = 0;
        }
      });
    }
    
    render() {
      if (!this.isVisible) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Render connections
      this.connections.forEach(connection => {
        const opacity = Math.max(0.1, connection.activation * 0.8);
        const width = 1 + connection.activation * 2;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.lineWidth = width;
        this.ctx.moveTo(connection.from.x, connection.from.y);
        this.ctx.lineTo(connection.to.x, connection.to.y);
        this.ctx.stroke();
        
        // Animated pulse along connection
        if (connection.activation > 0.5) {
          const progress = (Date.now() % 200) / 200; // Very fast pulse for more dynamic animation
          const pulseX = connection.from.x + (connection.to.x - connection.from.x) * progress;
          const pulseY = connection.from.y + (connection.to.y - connection.from.y) * progress;
          
          this.ctx.beginPath();
          this.ctx.fillStyle = `rgba(255, 255, 255, ${connection.activation})`;
          this.ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
      
      // Render neurons
      this.neurons.forEach(neuron => {
        const glowIntensity = neuron.activation;
        
        // Outer glow effect
        if (glowIntensity > 0.1) {
          const gradient = this.ctx.createRadialGradient(
            neuron.x, neuron.y, 0,
            neuron.x, neuron.y, neuron.radius * 3
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity * 0.3})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          this.ctx.beginPath();
          this.ctx.fillStyle = gradient;
          this.ctx.arc(neuron.x, neuron.y, neuron.radius * 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        // Main neuron circle (hollow)
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + glowIntensity * 0.2})`;
        this.ctx.lineWidth = 2 + glowIntensity * 2;
        this.ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Fill when activated
        if (glowIntensity > 0.1) {
          this.ctx.beginPath();
          this.ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity * 0.8})`;
          this.ctx.arc(neuron.x, neuron.y, neuron.radius * glowIntensity, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        // Core highlight
        if (glowIntensity > 0.5) {
          this.ctx.beginPath();
          this.ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity})`;
          this.ctx.arc(neuron.x + neuron.radius * 0.3, neuron.y - neuron.radius * 0.3, 
                     neuron.radius * 0.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
    }
    
    animate() {
      if (!this.isAnimating) return;
      
      this.update();
      this.render();
      requestAnimationFrame(() => this.animate());
    }
    
    // Update visibility
    setVisible(visible: boolean) {
      this.isVisible = visible;
    }

    // Cleanup method
    cleanup() {
      this.isAnimating = false;
      
      // Remove event listeners
      window.removeEventListener('resize', () => this.resize());
      if (enableInteraction) {
        this.canvas.removeEventListener('click', (e) => this.handleClick(e));
      }
    }
  }

  // Initialize network when component mounts
  useEffect(() => {
    if (canvasRef.current && !networkRef.current) {
      networkRef.current = new NeuralNetwork(canvasRef.current);
    }

    return () => {
      console.log('🧹 Cleaning up ANNAnimation...');
      
      if (networkRef.current) {
        networkRef.current.cleanup();
        networkRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Update network visibility when isVisible changes
  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.setVisible(isVisible);
    }
  }, [isVisible]);

  // Intersection Observer to pause animation when not visible
  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { 
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: '50px' // Start animation slightly before fully visible
      }
    );

    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`ann-animation relative ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: enableInteraction ? 'pointer' : 'default' }}
      />
    </div>
  );
}
