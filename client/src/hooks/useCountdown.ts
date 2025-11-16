import { useState, useEffect } from 'react';

export function useCountdown(targetTime: number) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, targetTime - Date.now());
      setTimeRemaining(remaining);
      setIsExpired(remaining === 0);
    };

    // Update immediately
    updateTimer();

    // Update every 100ms for smooth countdown
    const interval = setInterval(updateTimer, 100);

    // Cleanup
    return () => clearInterval(interval);
  }, [targetTime]);

  return {
    timeRemaining,
    secondsRemaining: Math.ceil(timeRemaining / 1000),
    isExpired
  };
}
