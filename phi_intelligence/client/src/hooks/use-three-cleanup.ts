import { useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CleanupRefs {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
  renderers: THREE.WebGLRenderer[];
  scenes: THREE.Scene[];
  cameras: THREE.Camera[];
  controls: any[];
  animationFrames: number[];
  eventListeners: Array<{ target: EventTarget; type: string; listener: EventListener }>;
  intervals: NodeJS.Timeout[];
  timeouts: NodeJS.Timeout[];
  objects: THREE.Object3D[];
}

interface CleanupOptions {
  disposeGeometries?: boolean;
  disposeMaterials?: boolean;
  disposeTextures?: boolean;
  disposeRenderers?: boolean;
  clearScenes?: boolean;
  cancelAnimations?: boolean;
  removeEventListeners?: boolean;
  clearTimers?: boolean;
  disposeObjects?: boolean;
}

export function useThreeCleanup(options: CleanupOptions = {}) {
  const cleanupRefs = useRef<CleanupRefs>({
    geometries: [],
    materials: [],
    textures: [],
    renderers: [],
    scenes: [],
    cameras: [],
    controls: [],
    animationFrames: [],
    eventListeners: [],
    intervals: [],
    timeouts: [],
    objects: []
  });

  // Track geometry for cleanup
  const trackGeometry = useCallback((geometry: THREE.BufferGeometry) => {
    if (geometry && !cleanupRefs.current.geometries.includes(geometry)) {
      cleanupRefs.current.geometries.push(geometry);
    }
  }, []);

  // Track material for cleanup
  const trackMaterial = useCallback((material: THREE.Material) => {
    if (material && !cleanupRefs.current.materials.includes(material)) {
      cleanupRefs.current.materials.push(material);
    }
  }, []);

  // Track texture for cleanup
  const trackTexture = useCallback((texture: THREE.Texture) => {
    if (texture && !cleanupRefs.current.textures.includes(texture)) {
      cleanupRefs.current.textures.push(texture);
    }
  }, []);

  // Track renderer for cleanup
  const trackRenderer = useCallback((renderer: THREE.WebGLRenderer) => {
    if (renderer && !cleanupRefs.current.renderers.includes(renderer)) {
      cleanupRefs.current.renderers.push(renderer);
    }
  }, []);

  // Track scene for cleanup
  const trackScene = useCallback((scene: THREE.Scene) => {
    if (scene && !cleanupRefs.current.scenes.includes(scene)) {
      cleanupRefs.current.scenes.push(scene);
    }
  }, []);

  // Track camera for cleanup
  const trackCamera = useCallback((camera: THREE.Camera) => {
    if (camera && !cleanupRefs.current.cameras.includes(camera)) {
      cleanupRefs.current.cameras.push(camera);
    }
  }, []);

  // Track controls for cleanup
  const trackControls = useCallback((controls: any) => {
    if (controls && !cleanupRefs.current.controls.includes(controls)) {
      cleanupRefs.current.controls.push(controls);
    }
  }, []);

  // Track animation frame for cleanup
  const trackAnimationFrame = useCallback((animationId: number) => {
    if (animationId && !cleanupRefs.current.animationFrames.includes(animationId)) {
      cleanupRefs.current.animationFrames.push(animationId);
    }
  }, []);

  // Track event listener for cleanup
  const trackEventListener = useCallback((
    target: EventTarget, 
    type: string, 
    listener: EventListener
  ) => {
    const eventRef = { target, type, listener };
    if (!cleanupRefs.current.eventListeners.some(
      ref => ref.target === target && ref.type === type && ref.listener === listener
    )) {
      cleanupRefs.current.eventListeners.push(eventRef);
    }
  }, []);

  // Track interval for cleanup
  const trackInterval = useCallback((intervalId: NodeJS.Timeout) => {
    if (intervalId && !cleanupRefs.current.intervals.includes(intervalId)) {
      cleanupRefs.current.intervals.push(intervalId);
    }
  }, []);

  // Track timeout for cleanup
  const trackTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    if (timeoutId && !cleanupRefs.current.timeouts.includes(timeoutId)) {
      cleanupRefs.current.timeouts.push(timeoutId);
    }
  }, []);

  // Track object for cleanup
  const trackObject = useCallback((object: THREE.Object3D) => {
    if (object && !cleanupRefs.current.objects.includes(object)) {
      cleanupRefs.current.objects.push(object);
    }
  }, []);

  // Safe dispose of Three.js object
  const disposeObject = useCallback((object: THREE.Object3D) => {
    if (!object) return;

    try {
      // Dispose of geometries
      if (object instanceof THREE.Mesh && object.geometry) {
        object.geometry.dispose();
      }

      // Dispose of materials
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => {
            if (material) {
              material.dispose();
              // Dispose textures
              if (material.map) material.map.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.roughnessMap) material.roughnessMap.dispose();
              if (material.metalnessMap) material.metalnessMap.dispose();
              if (material.emissiveMap) material.emissiveMap.dispose();
              if (material.alphaMap) material.alphaMap.dispose();
            }
          });
        } else {
          object.material.dispose();
          // Dispose textures
          if (object.material.map) object.material.map.dispose();
          if (object.material.normalMap) object.material.normalMap.dispose();
          if (object.material.roughnessMap) object.material.roughnessMap.dispose();
          if (object.material.metalnessMap) object.material.metalnessMap.dispose();
          if (object.material.emissiveMap) object.material.emissiveMap.dispose();
          if (object.material.alphaMap) object.material.alphaMap.dispose();
        }
      }

      // Dispose of points
      if (object instanceof THREE.Points && object.geometry) {
        object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }

      // Dispose of lines
      if (object instanceof THREE.Line && object.geometry) {
        object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }

      // Dispose of line segments
      if (object instanceof THREE.LineSegments && object.geometry) {
        object.geometry.dispose();
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

      // Recursively dispose children
      if (object.children && object.children.length > 0) {
        const children = [...object.children];
        children.forEach(child => disposeObject(child));
      }
    } catch (error) {
      console.warn('Error disposing object:', error);
    }
  }, []);

  // Comprehensive cleanup function
  const cleanup = useCallback((customOptions?: CleanupOptions) => {
    const finalOptions = { ...options, ...customOptions };
    
    console.log('🧹 Starting Three.js cleanup...');

    try {
      // Cancel animation frames
      if (finalOptions.cancelAnimations !== false) {
        cleanupRefs.current.animationFrames.forEach(id => {
          try {
            cancelAnimationFrame(id);
          } catch (error) {
            console.warn('Error cancelling animation frame:', error);
          }
        });
        cleanupRefs.current.animationFrames = [];
      }

      // Clear intervals
      if (finalOptions.clearTimers !== false) {
        cleanupRefs.current.intervals.forEach(id => {
          try {
            clearInterval(id);
          } catch (error) {
            console.warn('Error clearing interval:', error);
          }
        });
        cleanupRefs.current.intervals = [];
      }

      // Clear timeouts
      if (finalOptions.clearTimers !== false) {
        cleanupRefs.current.timeouts.forEach(id => {
          try {
            clearTimeout(id);
          } catch (error) {
            console.warn('Error clearing timeout:', error);
          }
        });
        cleanupRefs.current.timeouts = [];
      }

      // Remove event listeners
      if (finalOptions.removeEventListeners !== false) {
        cleanupRefs.current.eventListeners.forEach(({ target, type, listener }) => {
          try {
            target.removeEventListener(type, listener);
          } catch (error) {
            console.warn('Error removing event listener:', error);
          }
        });
        cleanupRefs.current.eventListeners = [];
      }

      // Dispose objects
      if (finalOptions.disposeObjects !== false) {
        cleanupRefs.current.objects.forEach(obj => {
          disposeObject(obj);
        });
        cleanupRefs.current.objects = [];
      }

      // Clear scenes
      if (finalOptions.clearScenes !== false) {
        cleanupRefs.current.scenes.forEach(scene => {
          try {
            scene.clear();
          } catch (error) {
            console.warn('Error clearing scene:', error);
          }
        });
        cleanupRefs.current.scenes = [];
      }

      // Dispose geometries
      if (finalOptions.disposeGeometries !== false) {
        cleanupRefs.current.geometries.forEach(geometry => {
          try {
            geometry.dispose();
          } catch (error) {
            console.warn('Error disposing geometry:', error);
          }
        });
        cleanupRefs.current.geometries = [];
      }

      // Dispose materials
      if (finalOptions.disposeMaterials !== false) {
        cleanupRefs.current.materials.forEach(material => {
          try {
            material.dispose();
          } catch (error) {
            console.warn('Error disposing material:', error);
          }
        });
        cleanupRefs.current.materials = [];
      }

      // Dispose textures
      if (finalOptions.disposeTextures !== false) {
        cleanupRefs.current.textures.forEach(texture => {
          try {
            texture.dispose();
          } catch (error) {
            console.warn('Error disposing texture:', error);
          }
        });
        cleanupRefs.current.textures = [];
      }

      // Dispose renderers
      if (finalOptions.disposeRenderers !== false) {
        cleanupRefs.current.renderers.forEach(renderer => {
          try {
            renderer.dispose();
          } catch (error) {
            console.warn('Error disposing renderer:', error);
          }
        });
        cleanupRefs.current.renderers = [];
      }

      // Dispose controls
      cleanupRefs.current.controls.forEach(controls => {
        try {
          if (controls && typeof controls.dispose === 'function') {
            controls.dispose();
          }
        } catch (error) {
          console.warn('Error disposing controls:', error);
        }
      });
      cleanupRefs.current.controls = [];

      console.log('✅ Three.js cleanup completed successfully');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }, [options, disposeObject]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // Tracking functions
    trackGeometry,
    trackMaterial,
    trackTexture,
    trackRenderer,
    trackScene,
    trackCamera,
    trackControls,
    trackAnimationFrame,
    trackEventListener,
    trackInterval,
    trackTimeout,
    trackObject,
    
    // Cleanup functions
    cleanup,
    disposeObject,
    
    // Utility functions
    createSafeAnimationFrame: (callback: FrameRequestCallback) => {
      const id = requestAnimationFrame(callback);
      trackAnimationFrame(id);
      return id;
    },
    
    createSafeInterval: (callback: (...args: any[]) => void, delay: number) => {
      const id = setInterval(callback, delay);
      trackInterval(id);
      return id;
    },
    
    createSafeTimeout: (callback: (...args: any[]) => void, delay: number) => {
      const id = setTimeout(callback, delay);
      trackTimeout(id);
      return id;
    },
    
    addSafeEventListener: (target: EventTarget, type: string, listener: EventListener) => {
      target.addEventListener(type, listener);
      trackEventListener(target, type, listener);
    }
  };
}
