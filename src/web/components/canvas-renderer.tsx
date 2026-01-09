import { ArrowLeft, ArrowRight } from "@solar-icons/react";
import { useRef, useState, useEffect } from "react";

type Props = {
  images: string[];
  width?: number;
  height?: number;
  className?: string;
}

export default function CanvasRenderer({ images, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = containerRef.current?.clientWidth || 500;
  const height = containerRef.current?.clientHeight || 700;

  console.log({ width, height });

  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());

  const [index, setIndex] = useState(0);

  useEffect(() => {
    images.forEach((b64, i) => {
      if (imageCacheRef.current.has(i)) return;

      const image = new Image();

      image.src = b64;

      image.onload = () => {
        imageCacheRef.current.set(i, image);
      };

      if (i === index) {
        drawImage(image);
      }
    })
  }, [images])

  useEffect(() => {
    const image = imageCacheRef.current.get(index);
    if (image) drawImage(image);
  }, [index])

  const drawImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"

    const dpr = window.devicePixelRatio || 1;

    const targetWidth = width;
    const targetHeight = height;

    canvas.width = targetWidth * dpr;
    canvas.height = targetHeight * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    const scale = Math.min(targetWidth / img.width, targetHeight / img.height);

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight)
  };

  const next = () => setIndex((idx) => (idx + 1) % images.length);
  const prev = () => setIndex(idx => (idx - 1 + images.length) % images.length);

  return <div ref={containerRef} className={className}>
    <canvas ref={canvasRef} />
    <div className="absolute z-10 bottom-2 p-3 w-full left-0 flex items-center justify-start gap-8">
      <button onClick={prev}>
        <ArrowLeft />
      </button>
      <button onClick={next}>
        <ArrowRight />
      </button>
      <span>{index + 1}/{images.length}</span>
    </div>
  </div>
}