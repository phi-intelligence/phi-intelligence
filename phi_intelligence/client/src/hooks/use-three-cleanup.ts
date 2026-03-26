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
  // Keep options in a ref to avoid recreating cleanup function on every render
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

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

  const trackGeometry = useCallback((geometry: THREE.BufferGeometry) => {
    if (geometry && !cleanupRefs.current.geometries.includes(geometry)) {
      cleanupRefs.current.geometries.push(geometry);
    }
  }, []);

  const trackMaterial = useCallback((material: THREE.Material) => {
    if (material && !cleanupRefs.current.materials.includes(material)) {
      cleanupRefs.current.materials.push(material);
    }
  }, []);

  const trackTexture = useCallback((texture: THREE.Texture) => {
    if (texture && !cleanupRefs.current.textures.includes(texture)) {
      cleanupRefs.current.textures.push(texture);
    }
  }, []);

  const trackRenderer = useCallback((renderer: THREE.WebGLRenderer) => {
    if (renderer && !cleanupRefs.current.renderers.includes(renderer)) {
      cleanupRefs.current.renderers.push(renderer);
    }
  }, []);

  const trackScene = useCallback((scene: THREE.Scene) => {
    if (scene && !cleanupRefs.current.scenes.includes(scene)) {
      cleanupRefs.current.scenes.push(scene);
    }
  }, []);

  const trackCamera = useCallback((camera: THREE.Camera) => {
    if (camera && !cleanupRefs.current.cameras.includes(camera)) {
      cleanupRefs.current.cameras.push(camera);
    }
  }, []);

  const trackControls = useCallback((controls: any) => {
    if (controls && !cleanupRefs.current.controls.includes(controls)) {
      cleanupRefs.current.controls.push(controls);
    }
  }, []);

  const trackAnimationFrame = useCallback((animationId: number) => {
    if (animationId) {
      cleanupRefs.current.animationFrames.push(animationId);
      // Keep only last 20 — old ones have already executed, shift is safe
      if (cleanupRefs.current.animationFrames.length > 20) {
        cleanupRefs.current.animationFrames.splice(0, cleanupRefs.current.animationFrames.length - 5);
      }
    }
  }, []);

  const trackEventListener = useCallback((target: EventTarget, type: string, listener: EventListener) => {
    const eventRef = { target, type, listener };
    if (!cleanupRefs.current.eventListeners.some(ref => ref.target === target && ref.type === type && ref.listener === listener)) {
      cleanupRefs.current.eventListeners.push(eventRef);
    }
  }, []);

  const trackInterval = useCallback((intervalId: NodeJS.Timeout) => {
    if (intervalId && !cleanupRefs.current.intervals.includes(intervalId)) {
      cleanupRefs.current.intervals.push(intervalId);
    }
  }, []);

  const trackTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    if (timeoutId && !cleanupRefs.current.timeouts.includes(timeoutId)) {
      cleanupRefs.current.timeouts.push(timeoutId);
    }
  }, []);

  const trackObject = useCallback((object: THREE.Object3D) => {
    if (object && !cleanupRefs.current.objects.includes(object)) {
      cleanupRefs.current.objects.push(object);
    }
  }, []);

  const disposeObject = useCallback((object: THREE.Object3D) => {
    if (!object) return;
    try {
      if (object instanceof THREE.Mesh && object.geometry) {
        object.geometry.dispose();
      }
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m?.dispose());
        } else {
          object.material.dispose();
        }
      }
      if (object.parent) object.parent.remove(object);
      if (object.children) {
        const children = [...object.children];
        children.forEach(child => disposeObject(child));
      }
    } catch (e) {}
  }, []);

  const cleanup = useCallback((customOptions?: CleanupOptions) => {
    const finalOptions = { ...optionsRef.current, ...customOptions };

    // Cancel all pending animation frames
    cleanupRefs.current.animationFrames.forEach(id => cancelAnimationFrame(id));
    cleanupRefs.current.animationFrames = [];

    // Clear intervals and timeouts
    cleanupRefs.current.intervals.forEach(id => { try { clearInterval(id); } catch (e) {} });
    cleanupRefs.current.intervals = [];
    cleanupRefs.current.timeouts.forEach(id => { try { clearTimeout(id); } catch (e) {} });
    cleanupRefs.current.timeouts = [];

    // Remove event listeners first (before disposing objects that may reference DOM)
    cleanupRefs.current.eventListeners.forEach(({ target, type, listener }) => {
      try { target.removeEventListener(type, listener); } catch (e) {}
    });
    cleanupRefs.current.eventListeners = [];

    // Dispose tracked objects (meshes, groups, sprites — also disposes their geometry/material)
    if (finalOptions.disposeObjects !== false) {
      cleanupRefs.current.objects.forEach(obj => disposeObject(obj));
      cleanupRefs.current.objects = [];
    }

    // Dispose standalone tracked textures (canvas textures, loaded textures)
    if (finalOptions.disposeTextures !== false) {
      cleanupRefs.current.textures.forEach(t => { try { t.dispose(); } catch (e) {} });
      cleanupRefs.current.textures = [];
    }

    // Dispose standalone tracked materials not already disposed via objects
    if (finalOptions.disposeMaterials !== false) {
      cleanupRefs.current.materials.forEach(m => { try { m.dispose(); } catch (e) {} });
      cleanupRefs.current.materials = [];
    }

    // Dispose standalone tracked geometries not already disposed via objects
    if (finalOptions.disposeGeometries !== false) {
      cleanupRefs.current.geometries.forEach(g => { try { g.dispose(); } catch (e) {} });
      cleanupRefs.current.geometries = [];
    }

    // Clear scenes (removes all children)
    cleanupRefs.current.scenes.forEach(s => { try { s.clear(); } catch (e) {} });
    cleanupRefs.current.scenes = [];

    // Nullify cameras
    cleanupRefs.current.cameras = [];

    // Dispose controls
    cleanupRefs.current.controls.forEach(c => { try { c.dispose?.(); } catch (e) {} });
    cleanupRefs.current.controls = [];

    // Dispose renderers last (releases WebGL context)
    if (finalOptions.disposeRenderers !== false) {
      cleanupRefs.current.renderers.forEach(r => {
        try { r.dispose(); r.forceContextLoss(); } catch (e) {}
      });
      cleanupRefs.current.renderers = [];
    }
  }, [disposeObject]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    trackGeometry, trackMaterial, trackTexture, trackRenderer,
    trackScene, trackCamera, trackControls, trackAnimationFrame,
    trackEventListener, trackInterval, trackTimeout, trackObject,
    cleanup, disposeObject,
    createSafeAnimationFrame: (callback: FrameRequestCallback) => {
      const id = requestAnimationFrame(callback);
      trackAnimationFrame(id);
      return id;
    },
    addSafeEventListener: (target: EventTarget, type: string, listener: EventListener) => {
      target.addEventListener(type, listener);
      trackEventListener(target, type, listener);
    }
  };
}
