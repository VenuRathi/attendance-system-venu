import { useCallback, useEffect, useRef } from 'react';

export const useSound = () => {
  const faahAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/faah-sound.mp3');
    audio.preload = 'auto';
    faahAudioRef.current = audio;

    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      audio.muted = true;
      audio
        .play()
        .catch(() => {
          // Swallow autoplay rejection; unlock happens with user gesture.
        })
        .finally(() => {
          audio.pause();
          audio.muted = false;
          audio.currentTime = 0;
        });
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const playFaahSound = useCallback(() => {
    try {
      const audio = faahAudioRef.current;
      if (!audio) {
        throw new Error('Faah sound not loaded');
      }
      audio.currentTime = 0;
      audio.volume = 0.6;
      audio.play().catch(error => {
        console.warn('Could not play faah sound:', error);
      });
    } catch (error) {
      console.warn('Could not play faah sound:', error);
    }
  }, []);

  return { playFaahSound };
};