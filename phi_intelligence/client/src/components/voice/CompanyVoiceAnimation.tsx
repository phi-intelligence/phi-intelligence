import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Building2, Mic, Brain, AlertCircle, Loader2 } from 'lucide-react';

// Animation state types
type AnimationState = 
  | 'inactive'      // Before voicebot creation
  | 'idle'          // Created but not connected
  | 'connecting'    // Establishing connection
  | 'connected'     // Connected and ready
  | 'listening'     // AI is listening to user
  | 'processing'    // AI is processing/thinking
  | 'speaking'      // AI is responding
  | 'error';        // Connection or operation error

// Animation particle interface
interface AnimationParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
}

// Props interface
interface CompanyVoiceAnimationProps {
  companyName: string;
  filesCount: number;
  chunksCount: number;
  animationState: AnimationState;
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  isActive: boolean;
  error?: string;
  className?: string;
}

const CompanyVoiceAnimation: React.FC<CompanyVoiceAnimationProps> = ({
  companyName,
  filesCount,
  chunksCount,
  animationState,
  isConnected,
  isConnecting,
  isSpeaking,
  isActive,
  error,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<AnimationParticle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  // Animation configuration
  const animationConfig = {
    inactive: {
      particleCount: 0,
      particleSpeed: 0,
      particleSize: 0,
      color: '#ffffff',
      opacity: 0
    },
    idle: {
      particleCount: 3,
      particleSpeed: 0.5,
      particleSize: 2,
      color: '#ffffff',
      opacity: 0.3
    },
    connecting: {
      particleCount: 8,
      particleSpeed: 1.2,
      particleSize: 3,
      color: '#60a5fa',
      opacity: 0.6
    },
    connected: {
      particleCount: 5,
      particleSpeed: 0.8,
      particleSize: 2.5,
      color: '#34d399',
      opacity: 0.4
    },
    listening: {
      particleCount: 12,
      particleSpeed: 1.5,
      particleSize: 4,
      color: '#fbbf24',
      opacity: 0.7
    },
    processing: {
      particleCount: 15,
      particleSpeed: 2.0,
      particleSize: 3.5,
      color: '#a78bfa',
      opacity: 0.8
    },
    speaking: {
      particleCount: 20,
      particleSpeed: 2.5,
      particleSize: 5,
      color: '#f472b6',
      opacity: 0.9
    },
    error: {
      particleCount: 6,
      particleSpeed: 1.0,
      particleSize: 3,
      color: '#f87171',
      opacity: 0.6
    }
  };

  // Create particle
  const createParticle = useCallback((config: typeof animationConfig.idle): AnimationParticle => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 20;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: config.particleSize + Math.random() * 2,
      opacity: config.opacity,
      velocity: {
        x: (Math.random() - 0.5) * config.particleSpeed,
        y: (Math.random() - 0.5) * config.particleSpeed
      },
      life: 0,
      maxLife: 120 + Math.random() * 60
    };
  }, [dimensions]);

  // Update particles
  const updateParticles = useCallback(() => {
    const config = animationConfig[animationState] || animationConfig.idle;
    
    // Add new particles if needed
    while (particlesRef.current.length < config.particleCount) {
      particlesRef.current.push(createParticle(config));
    }
    
    // Remove excess particles
    if (particlesRef.current.length > config.particleCount) {
      particlesRef.current = particlesRef.current.slice(0, config.particleCount);
    }
    
    // Update existing particles
    particlesRef.current = particlesRef.current
      .map(particle => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.life++;
        
        // Keep particles within bounds
        if (particle.x < 0 || particle.x > dimensions.width) {
          particle.velocity.x *= -1;
        }
        if (particle.y < 0 || particle.y > dimensions.height) {
          particle.velocity.y *= -1;
        }
        
        // Fade out old particles
        if (particle.life > particle.maxLife * 0.8) {
          particle.opacity = config.opacity * (1 - (particle.life - particle.maxLife * 0.8) / (particle.maxLife * 0.2));
        }
        
        return particle;
      })
      .filter(particle => particle.life < particle.maxLife);
  }, [animationState, createParticle, dimensions]);

  // Render animation
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Update particles
    updateParticles();
    
    // Draw particles
    const config = animationConfig[animationState] || animationConfig.idle;
    particlesRef.current.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw center icon based on state
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    // Draw pulsing circle for active states
    if (['listening', 'processing', 'speaking'].includes(animationState)) {
      const pulseSize = 30 + Math.sin(Date.now() * 0.005) * 10;
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
    
    // Continue animation
    animationRef.current = requestAnimationFrame(render);
  }, [animationState, updateParticles, dimensions]);

  // Start/stop animation based on state
  useEffect(() => {
    if (animationState !== 'inactive') {
      render();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationState, render]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: 300, height: 300 });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get state-specific content
  const getStateContent = () => {
    switch (animationState) {
      case 'inactive':
        return (
          <div className="text-center">
            <Building2 className="w-16 h-16 text-phi-light opacity-30 mx-auto mb-3" />
            <div className="text-sm font-medium text-white opacity-50">
              Company Voice Assistant
            </div>
            <div className="text-xs opacity-40 mt-1">
              Waiting for creation...
            </div>
          </div>
        );
      
      case 'idle':
        return (
          <div className="text-center">
            <Building2 className="w-16 h-16 text-phi-light mx-auto mb-3" />
            <div className="text-sm font-medium text-white">
              {companyName}
            </div>
            <div className="text-xs opacity-70 mt-1">
              {filesCount} files • {chunksCount} chunks
            </div>
            <div className="text-xs opacity-50 mt-2">
              Ready to connect
            </div>
          </div>
        );
      
      case 'connecting':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-3" />
            <div className="text-sm font-medium text-white">
              Connecting...
            </div>
            <div className="text-xs opacity-70 mt-1">
              Establishing voice connection
            </div>
          </div>
        );
      
      case 'connected':
        return (
          <div className="text-center">
            <Mic className="w-16 h-16 text-green-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-white">
              {companyName}
            </div>
            <div className="text-xs opacity-70 mt-1">
              Connected and ready
            </div>
          </div>
        );
      
      case 'listening':
        return (
          <div className="text-center">
            <Mic className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-pulse" />
            <div className="text-sm font-medium text-white">
              Listening...
            </div>
            <div className="text-xs opacity-70 mt-1">
              Speak now
            </div>
          </div>
        );
      
      case 'processing':
        return (
          <div className="text-center">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-3 animate-pulse" />
            <div className="text-sm font-medium text-white">
              Processing...
            </div>
            <div className="text-xs opacity-70 mt-1">
              AI is thinking
            </div>
          </div>
        );
      
      case 'speaking':
        return (
          <div className="text-center">
            <Mic className="w-16 h-16 text-pink-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-white">
              {companyName} is speaking
            </div>
            <div className="text-xs opacity-70 mt-1">
              AI is responding
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-white">
              Connection Error
            </div>
            <div className="text-xs opacity-70 mt-1">
              {error || 'Something went wrong'}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`company-voice-animation-container relative ${className}`}>
      {/* Canvas for particle animation */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {getStateContent()}
      </div>
      
      {/* State indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-3 h-3 rounded-full ${
          animationState === 'connected' ? 'bg-green-400' :
          animationState === 'listening' ? 'bg-yellow-400' :
          animationState === 'speaking' ? 'bg-pink-400' :
          animationState === 'processing' ? 'bg-purple-400' :
          animationState === 'connecting' ? 'bg-blue-400' :
          animationState === 'error' ? 'bg-red-400' :
          'bg-gray-400'
        } ${['listening', 'speaking', 'processing'].includes(animationState) ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
};

export default CompanyVoiceAnimation;
