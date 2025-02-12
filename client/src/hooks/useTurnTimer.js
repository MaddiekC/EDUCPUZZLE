// client/src/hooks/useTurnTimer.js
import { useState, useEffect, useRef } from "react";

const useTurnTimer = (initialTime = 10, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const answeredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(initialTime);
    answeredRef.current = false;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (!answeredRef.current && onTimeout) {
            onTimeout();
          }
          return initialTime;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [initialTime, onTimeout]);

  return { timeLeft, setAnswered: (val) => (answeredRef.current = val) };
};

export default useTurnTimer;
