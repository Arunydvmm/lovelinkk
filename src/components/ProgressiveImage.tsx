import React from 'react';
import { SmartImage } from './SmartImage';

export { SmartImage };

export interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  aspectRatio?: string;
  placeholderColor?: string;
  placeholderSrc?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = (props) => {
  return <SmartImage {...props} />;
};

