import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, decimals = 0, className, style }) => {
  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  );
};

export default AnimatedNumber;
