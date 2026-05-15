export function createAudioPlayer(url, options = {}) {
  const { loop = true, autoplay = false, volume = 0.7 } = options;

  const audio = new Audio(url);
  audio.loop = loop;
  audio.volume = volume;
  audio.preload = 'auto';

  let isPlaying = false;
  let userInteracted = false;

  const play = async () => {
    if (!userInteracted) {
      // Navegadores bloquean autoplay sin interacción
      userInteracted = true;
    }
    try {
      await audio.play();
      isPlaying = true;
    } catch (err) {
      console.warn('Error reproduciendo audio:', err);
    }
  };

  const pause = () => {
    audio.pause();
    isPlaying = false;
  };

  const toggle = () => {
    if (isPlaying) pause();
    else play();
  };

  const setVolume = (v) => {
    audio.volume = Math.max(0, Math.min(1, v));
  };

  // Fade in/out helpers
  const fadeIn = (duration = 2000) => {
    audio.volume = 0;
    play();
    const steps = 20;
    const increment = volume / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= volume) {
        audio.volume = volume;
        clearInterval(interval);
      } else {
        audio.volume = current;
      }
    }, duration / steps);
  };

  const fadeOut = (duration = 2000) => {
    const steps = 20;
    const decrement = audio.volume / steps;
    const interval = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - decrement);
      if (audio.volume <= 0.01) {
        pause();
        clearInterval(interval);
      }
    }, duration / steps);
  };

  if (autoplay) {
    // Intentar autoplay, pero navegadores lo bloquean sin interacción
    document.addEventListener('click', () => {
      if (!isPlaying && !userInteracted) {
        userInteracted = true;
        play();
      }
    }, { once: true });
  }

  return {
    audio,
    play,
    pause,
    toggle,
    setVolume,
    fadeIn,
    fadeOut,
    get isPlaying() { return isPlaying; },
  };
}
