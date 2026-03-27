"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type NormalizedPoint = { x: number; y: number };

type HeartCanvasProps = {
  title?: string;
  subtitle?: string;
  strokeColor?: string;
  strokeWidth?: number; // px (CSS px)
  onCommit: (points: NormalizedPoint[]) => void;
  onClear?: () => void;
  disabled?: boolean;
};

function toCanvasNormalizedPoint(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): NormalizedPoint {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) / Math.max(1e-6, rect.width);
  const y = (clientY - rect.top) / Math.max(1e-6, rect.height);
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

export default function HeartCanvas({
  title,
  subtitle,
  strokeColor = "#ff6fb1",
  strokeWidth = 10,
  onCommit,
  onClear,
  disabled,
}: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const pointsRef = useRef<NormalizedPoint[]>([]);
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);

  const minDistPx = useMemo(() => 2.5, []);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;
    ctx.clearRect(0, 0, cssW, cssH);

    if (pointsRef.current.length < 2) return;

    // Draw polyline.
    const w = cssW;
    const h = cssH;

    ctx.beginPath();
    const p0 = pointsRef.current[0];
    ctx.moveTo(p0.x * w, p0.y * h);

    for (let i = 1; i < pointsRef.current.length; i++) {
      const p = pointsRef.current[i];
      ctx.lineTo(p.x * w, p.y * h);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = strokeColor;
    ctx.stroke();
  };

  // Resize canvas to match its CSS size (with DPR).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const cssW = parent ? parent.clientWidth : canvas.clientWidth;
      const cssH = parent ? parent.clientHeight : canvas.clientHeight;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px
      redraw();
    };

    resize();

    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokeColor, strokeWidth]);

  const clear = () => {
    pointsRef.current = [];
    lastPixelRef.current = null;
    setHint(null);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
    onClear?.();
  };

  const commit = () => {
    const pts = pointsRef.current;
    if (pts.length < 18) {
      setHint("Draw a bit more, then press Confirm.");
      window.setTimeout(() => setHint(null), 1700);
      return;
    }
    setHint(null);
    onCommit(pts.slice());
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setHint(null);
    setIsDrawing(true);

    const np = toCanvasNormalizedPoint(e.clientX, e.clientY, canvas);
    pointsRef.current.push(np);

    const rect = canvas.getBoundingClientRect();
    lastPixelRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const pixel = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const prev = lastPixelRef.current;
    if (prev) {
      const dist = Math.hypot(pixel.x - prev.x, pixel.y - prev.y);
      if (dist < minDistPx) return;
    }

    lastPixelRef.current = pixel;

    const np = { x: pixel.x / rect.width, y: pixel.y / rect.height };
    const clamped = {
      x: Math.min(1, Math.max(0, np.x)),
      y: Math.min(1, Math.max(0, np.y)),
    };

    pointsRef.current.push(clamped);

    // Incremental draw for responsiveness.
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = rect.width;
    const h = rect.height;

    const last = pointsRef.current[pointsRef.current.length - 2];
    const curr = pointsRef.current[pointsRef.current.length - 1];

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = strokeColor;

    ctx.beginPath();
    ctx.moveTo(last.x * w, last.y * h);
    ctx.lineTo(curr.x * w, curr.y * h);
    ctx.stroke();
  };

  const endDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    setIsDrawing(false);
    lastPixelRef.current = null;
    try {
      const canvas = canvasRef.current;
      canvas?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {title ? (
        <div>
          <div className="text-sm font-semibold text-rose-800">{title}</div>
          {subtitle ? <div className="text-xs text-rose-600 mt-1">{subtitle}</div> : null}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-3xl bg-rose-100/30 backdrop-blur border border-rose-200">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/70 to-white/20 pointer-events-none" />
        <div className="h-[340px] sm:h-[420px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrawing}
            onPointerCancel={endDrawing}
          />
        </div>

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="text-xs font-medium text-rose-700 bg-white/70 px-3 py-1 rounded-full border border-rose-200">
            Draw with your finger or mouse
          </div>
          <div className="text-xs text-rose-600 bg-white/70 px-3 py-1 rounded-full border border-rose-200">
            {isDrawing ? "Drawing..." : "Ready!"}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          className="flex-1 h-11 rounded-2xl bg-white/80 border border-rose-200 text-rose-800 font-semibold hover:bg-white disabled:opacity-50"
        >
          Redraw
        </button>
        <button
          type="button"
          onClick={commit}
          disabled={disabled}
          className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-500 text-white font-semibold shadow-lg hover:brightness-105 disabled:opacity-50"
        >
          Confirm
        </button>
      </div>

      {hint ? (
        <div className="text-xs text-rose-700 font-semibold px-1 -mt-1">{hint}</div>
      ) : null}
    </div>
  );
}

