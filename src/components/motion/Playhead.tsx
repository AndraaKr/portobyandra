import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface PlayheadProps {
  triggerKey: string;
}

export const Playhead: React.FC<PlayheadProps> = ({ triggerKey }) => {
  const [active, setActive] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    setActive(true);
    const timer = setTimeout(() => {
      setActive(false);
    }, 220); // --dur-cut
    return () => clearTimeout(timer);
  }, [triggerKey, reducedMotion]);

  if (reducedMotion || !active) return null;

  return <div className="playhead active" aria-hidden="true" />;
};
