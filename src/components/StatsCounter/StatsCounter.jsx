// client/src/components/StatsCounter/StatsCounter.jsx
import React, { useState, useEffect } from "react";
import "./StatsCounter.css";

const StatsCounter = ({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  triggerAnimation = false,
}) => {
  const [count, setCount] = useState(0);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (triggerAnimation && !animationStarted) {
      setAnimationStarted(true);

      const startValue = 0;
      const endValue = value;
      const totalDuration = duration * 1000; // Convert to milliseconds
      const startTime = Date.now();

      const updateCount = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        // Use easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue =
          startValue + (endValue - startValue) * easeOutQuart;

        if (Number.isInteger(value)) {
          setCount(Math.floor(currentValue));
        } else {
          setCount(parseFloat(currentValue.toFixed(1)));
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          setCount(endValue);
        }
      };

      requestAnimationFrame(updateCount);
    }
  }, [triggerAnimation, value, duration, animationStarted]);

  // Reset animation when triggerAnimation becomes false
  useEffect(() => {
    if (!triggerAnimation) {
      setAnimationStarted(false);
      setCount(0);
    }
  }, [triggerAnimation]);

  return (
    <span className="stats-counter">
      {prefix && <span className="stats-prefix">{prefix}</span>}
      <span className="stats-value-plans">{count}</span>
      {suffix && <span className="stats-suffix">{suffix}</span>}
    </span>
  );
};

export default StatsCounter;
