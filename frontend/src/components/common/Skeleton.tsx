import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={style} />
);

export default Skeleton;
