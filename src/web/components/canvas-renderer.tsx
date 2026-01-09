import { ArrowLeft, ArrowRight } from "@solar-icons/react";
import { useRef, useState, useEffect } from "react";

type Props = {
  images: string[];
  width?: number;
  height?: number;
  className?: string;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>
}

type Viewport = {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 1;

export default function CanvasRenderer({ images, className, index }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<Viewport>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });
  const isPanningRef = useRef(false);
  const lastPointRef = useRef<{
    x: number;
    y: number
  } | null>(null)

  const width = containerRef.current?.clientWidth || 500;
  const height = containerRef.current?.clientHeight || 700;


  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());

  useEffect(() => {
    images.forEach((b64, i) => {
      if (imageCacheRef.current.has(i)) return;

      const image = new Image();

      image.src = b64;

      image.onload = () => {
        imageCacheRef.current.set(i, image);
        if (i === index) resetViewAndDraw(image)
      };
    })
  }, [images])

  useEffect(() => {
    const image = imageCacheRef.current.get(index);
    if (image) resetViewAndDraw(image);
  }, [index])

  const drawImage = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = imageCacheRef.current.get(index);

    if (!img) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);


    const { scale, offsetX, offsetY } = viewportRef.current;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const resetViewAndDraw = (img: HTMLImageElement) => {
    const scale = Math.min(width / img.width, height / img.height);

    viewportRef.current = {
      scale,
      offsetX: (width - img.width * scale) / 2,
      offsetY: (height - img.height * scale) / 2,
    };

    drawImage();
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const { scale, offsetX, offsetY } = viewportRef.current;

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const nextScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, scale * zoom)
    );

    const wx = (mx - offsetX) / scale;
    const wy = (my - offsetY) / scale;

    viewportRef.current.scale = nextScale;
    viewportRef.current.offsetX = mx - wx * nextScale;
    viewportRef.current.offsetY = my - wy * nextScale;

    drawImage();
  }

  const onMouseDown = (e: React.MouseEvent) => {
    isPanningRef.current = true;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current || !lastPointRef.current) return;

    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;

    viewportRef.current.offsetX += dx;
    viewportRef.current.offsetY += dy;

    lastPointRef.current = { x: e.clientX, y: e.clientY };

    drawImage();
  };

  const onMouseUp = () => {
    isPanningRef.current = false;
    lastPointRef.current = null;
  };

  /* ---------------- reset ---------------- */

  const onDoubleClick = () => {
    const img = imageCacheRef.current.get(index);
    if (img) resetViewAndDraw(img);
  };

  return <div ref={containerRef} className={className}>
    <canvas onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDoubleClick={onDoubleClick}
      style={{ cursor: "grab", touchAction: "none" }} ref={canvasRef} />
  </div>
}