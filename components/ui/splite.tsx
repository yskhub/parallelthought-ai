import React, { useEffect, useRef, useState } from 'react';
import { Application } from '@splinetool/runtime';

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const appRef = useRef<Application | null>(null);
  const activeSceneRef = useRef<string>(scene);

  useEffect(() => {
    // Update the reference to the most recent requested scene
    activeSceneRef.current = scene;
    
    if (!canvasRef.current) return;

    let isEffectValid = true;
    let localApp: Application | null = null;
    
    // Trigger loading state for the new scene
    setIsLoading(true);
    setHasError(false);

    const initializeSpline = async () => {
      try {
        // Create a new Application instance on the existing canvas.
        localApp = new Application(canvasRef.current!);
        
        // Load the scene from the Spline CDN
        await localApp.load(scene);

        // Only commit updates to the UI if:
        // 1. This specific effect cleanup hasn't run yet.
        // 2. The scene we just finished loading is still the one requested.
        if (isEffectValid && activeSceneRef.current === scene) {
          appRef.current = localApp;
          setIsLoading(false);
          setHasError(false);
        } else if (localApp) {
          // If the effect became invalid while loading, dispose immediately
          try {
            localApp.dispose();
          } catch (e) {
            // Silently fail if dispose is not supported or already cleaned up
          }
        }
      } catch (err) {
        if (isEffectValid && activeSceneRef.current === scene) {
          console.error("Spline runtime failed to load scene:", err);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initializeSpline();

    return () => {
      isEffectValid = false;
      // Explicitly dispose of the spline application to stop the render loop and free WebGL resources
      if (appRef.current) {
        try {
          appRef.current.dispose();
        } catch (e) {
          // Fallback if dispose fails
        }
        appRef.current = null;
      }
      if (localApp) {
        try {
          localApp.dispose();
        } catch (e) {}
      }
    };
  }, [scene]);

  return (
    <div className={`${className} relative overflow-hidden bg-transparent`}>
      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
          <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500/40 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error State Feedback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 pointer-events-none">
          <div className="text-[10px] mono text-indigo-400/50 uppercase tracking-[0.3em] text-center px-8 py-5 border border-white/5 rounded-3xl bg-black/40">
            Render_Sync_Offline
            <span className="text-[8px] opacity-40 mt-1 block tracking-normal italic uppercase font-medium">Data link interrupted</span>
          </div>
        </div>
      )}

      {/* The 3D Canvas */}
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}