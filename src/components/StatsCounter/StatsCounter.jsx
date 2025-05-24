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

      let startTime;
      const totalFrames = 60 * duration; // 60fps * duration in seconds
      const increment = value / totalFrames;

      let currentCount = 0;
      let frame = 0;

      const counter = setInterval(() => {
        currentCount += increment;
        frame++;

        if (frame <= totalFrames) {
          // For integer values
          if (Number.isInteger(value)) {
            setCount(Math.floor(currentCount));
          } else {
            // For decimal values (round to 1 decimal place)
            setCount(parseFloat(currentCount.toFixed(1)));
          }
        } else {
          setCount(value);
          clearInterval(counter);
        }
      }, 1000 / 60); // 60fps

      return () => clearInterval(counter);
    }
  }, [triggerAnimation, value, duration, animationStarted]);

  return (
    <div className="stats-counter">
      {prefix && <span className="stats-prefix">{prefix}</span>}
      <span className="stats-value">{count}</span>
      {suffix && <span className="stats-suffix">{suffix}</span>}
    </div>
  );
};

export default StatsCounter;
