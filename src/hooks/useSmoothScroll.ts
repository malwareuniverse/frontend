import { useCallback } from 'react';


const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

interface ScrollOptions {
  targetElement: HTMLElement | null;
  duration?: number;
  offset?: number;
}


export const useSmoothScroll = () => {
  const startScroll = useCallback(({
    targetElement,
    duration = 1500,
    offset = 0,
  }: ScrollOptions) => {
    if (!targetElement) {
      console.warn("Smooth scroll target element not found.");
      return;
    }

    const startPosition = window.scrollY;
    const targetPosition = targetElement.getBoundingClientRect().top + startPosition + offset;
    const distance = targetPosition - startPosition;

    let startTime: number | null = null;

    const animationStep = (currentTime: number) => {
      startTime ??= currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeInOutQuad(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (elapsedTime < duration) {
        requestAnimationFrame(animationStep);
      }
    };

    requestAnimationFrame(animationStep);
  }, []);

  return { startScroll };
};