import { type MotionStyle, motion } from 'motion/react';

type SkeletonProps = {
  style?: MotionStyle;
  className?: string;
};

export default function Skeleton({ style, className }: SkeletonProps) {
  return (
    <>
      <motion.div
        style={{ ...style }}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        className={className}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
      />
    </>
  );
}
