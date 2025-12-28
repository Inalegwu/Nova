import { motion } from "motion/react";

type Props = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function Spinner({ size, className, style }: Props) {
  return (
    <motion.div
      animate={{ rotateZ: "180deg" }}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration: 0.8,
        damping: 20,
        ease: "linear",
      }}
    >
      <div
        className={`border rounded-full border-dashed ${className}`}
        style={{ width: size || 10, height: size || 10, ...style }}
      />
    </motion.div>
  );
}
