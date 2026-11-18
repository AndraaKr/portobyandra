let installed = false;

export function installSinglePlayback() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener(
    'play',
    (e) => {
      const t = e.target;
      if (!(t instanceof HTMLVideoElement)) return;
      document.querySelectorAll('video').forEach((v) => {
        if (v !== t && !v.paused) v.pause();
      });
    },
    true
  ); // capture: event 'play' tidak bubble
}

export const otherVideoPlaying = (self: HTMLVideoElement) =>
  [...document.querySelectorAll('video')].some((v) => v !== self && !v.paused);
