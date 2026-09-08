import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type TickerProps = {
  progress: number;
  tickCount?: number;
  majorEvery?: number;
  height?: number;
  accentColor?: string;
  borderColor?: string;
};

const THUMB_WIDTH = 2;

export default function Ticker({
  progress,
  tickCount = 40,
  majorEvery = 5,
  height = 16,
  accentColor = 'var(--color-accent)',
  borderColor = 'var(--color-border)',
}: TickerProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const animatedProgress = useMotionValue(clamped);

  useEffect(() => {
    const controls = animate(animatedProgress, clamped, {
      duration: 0.28,
      ease: 'easeInOut',
    });

    return () => controls.stop();
  }, [clamped, animatedProgress]);

  useEffect(() => {
    const element = trackRef.current;
    if (!element) return;

    const updateWidth = () => {
      setTrackWidth(element.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const thumbX = useTransform(
    animatedProgress,
    [0, 100],
    [0, Math.max(trackWidth - THUMB_WIDTH, 0)],
  );

  const ticks = useMemo(
    () => Array.from({ length: tickCount }, (_, i) => i),
    [tickCount],
  );

  return (
    <div
      ref={trackRef}
      className='relative flex w-full flex-row items-end'
      style={{ height }}
    >
      {ticks.map((i) => (
        <Tick
          key={i}
          index={i}
          tickCount={tickCount}
          isMajor={i % majorEvery === 0}
          height={height}
          animatedProgress={animatedProgress}
          idleColor={i % majorEvery === 0 ? accentColor : borderColor}
          accentColor={accentColor}
        />
      ))}

      <motion.div
        className='pointer-events-none absolute bottom-0 left-0'
        style={{
          width: THUMB_WIDTH,
          height,
          backgroundColor: accentColor,
          x: thumbX,
        }}
      />
    </div>
  );
}

type TickProps = {
  index: number;
  tickCount: number;
  isMajor: boolean;
  height: number;
  animatedProgress: ReturnType<typeof useMotionValue<number>>;
  idleColor: string;
  accentColor: string;
};

function Tick({
  index,
  tickCount,
  isMajor,
  height,
  animatedProgress,
  idleColor,
  accentColor,
}: TickProps) {
  const thresholdPercent = (index / Math.max(tickCount - 1, 1)) * 100;

  const backgroundColor = useTransform(
    animatedProgress,
    [thresholdPercent, thresholdPercent + 1],
    [idleColor, accentColor],
  );

  return (
    <motion.div
      className='mx-px flex-1'
      style={{
        height: isMajor ? height : height * 0.4,
        backgroundColor,
      }}
    />
  );
}
