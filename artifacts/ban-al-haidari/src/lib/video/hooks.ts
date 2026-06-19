import { useState, useEffect, useRef } from "react";

type SceneDurations = Record<string, number>;

interface UseVideoPlayerOptions {
  durations: SceneDurations;
}

interface UseVideoPlayerReturn {
  currentScene: number;
}

export function useVideoPlayer({ durations }: UseVideoPlayerOptions): UseVideoPlayerReturn {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneKeys = Object.keys(durations);
  const totalScenes = sceneKeys.length;
  const hasStarted = useRef(false);
  const hasFinished = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      window.startRecording?.();
    }

    let sceneIndex = 0;
    let elapsed = 0;

    const totalDuration = sceneKeys.reduce((sum, key) => sum + durations[key], 0);

    const advanceScene = () => {
      sceneIndex = (sceneIndex + 1) % totalScenes;
      setCurrentScene(sceneIndex);

      if (sceneIndex === 0 && !hasFinished.current) {
        hasFinished.current = true;
        window.stopRecording?.();
      }

      const nextDuration = durations[sceneKeys[sceneIndex]];
      setTimeout(advanceScene, nextDuration);
    };

    const firstDuration = durations[sceneKeys[0]];
    const timer = setTimeout(advanceScene, firstDuration);

    return () => clearTimeout(timer);
  }, []);

  return { currentScene };
}

export default useVideoPlayer;
