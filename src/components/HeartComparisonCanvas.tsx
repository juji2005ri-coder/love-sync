"use client";

import React, { useEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";
import type { AlignmentResult, Point } from "@/lib/heartSimilarity";

type Props = {
  preparedA: Point[];
  preparedB: Point[];
  alignment: AlignmentResult;
  score: number;
};

function reflectX(points: Point[]): Point[] {
  return points.map((p) => ({ x: -p.x, y: p.y }));
}

function rotate(points: Point[], angle: number): Point[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map((p) => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  }));
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  opts: {
    strokeStyle: string;
    lineWidth: number;
    opacity: number;
    shadowColor: string;
    dashed?: boolean;
    dashOffset?: number;
  },
  radiusPx: number,
  canvasCssW: number,
  canvasCssH: number
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = opts.opacity;

  // Coordinates are centered around origin.
  const toX = (p: Point) => canvasCssW / 2 + p.x * radiusPx;
  const toY = (p: Point) => canvasCssH / 2 + p.y * radiusPx;

  ctx.beginPath();
  ctx.moveTo(toX(points[0]), toY(points[0]));
  for (let i = 1; i < points.length; i++) ctx.lineTo(toX(points[i]), toY(points[i]));

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = opts.lineWidth;
  ctx.strokeStyle = opts.strokeStyle;
  ctx.shadowBlur = 14;
  ctx.shadowColor = opts.shadowColor;

  if (opts.dashed) {
    ctx.setLineDash([9, 7]);
    ctx.lineDashOffset = opts.dashOffset ?? 0;
  } else {
    ctx.setLineDash([]);
  }

  ctx.stroke();
  ctx.restore();
}

export default function HeartComparisonCanvas({
  preparedA,
  preparedB,
  alignment,
  score,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = progress.on("change", () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      // Ensure transform is correct even after resize.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, cssW, cssH);

      // Slight "vibe" background grid.
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = "rgba(255, 105, 180, 0.2)";
      ctx.lineWidth = 1;
      const step = 26;
      for (let x = -cssW; x < cssW * 2; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + cssW, cssH);
        ctx.stroke();
      }
      ctx.restore();

      const p = progress.get();
      const radiusPx = Math.min(cssW, cssH) * 0.38;

      // Person 1: stable pink heart.
      drawPolyline(
        ctx,
        preparedA,
        {
          strokeStyle: "#ff5fa9",
          lineWidth: 10,
          opacity: 0.95,
          shadowColor: "#ff7fc1",
        },
        radiusPx,
        cssW,
        cssH
      );

      // Person 2: reflect + rotate gradually to show drift.
      const baseB = alignment.reflected ? reflectX(preparedB) : preparedB;
      const rotatedB = rotate(baseB, alignment.rotationAngle * p);

      const dashed = p < 0.99;
      const opacityB = 0.2 + 0.8 * p;

      drawPolyline(
        ctx,
        rotatedB,
        {
          strokeStyle: "#6fd3ff",
          lineWidth: 10,
          opacity: opacityB,
          shadowColor: "#86e0ff",
          dashed,
          dashOffset: -p * 55,
        },
        radiusPx,
        cssW,
        cssH
      );

      // Extra: subtle overlap highlight when near-perfect.
      if (score >= 85) {
        drawPolyline(
          ctx,
          rotatedB,
          {
            strokeStyle: "#ffd3ea",
            lineWidth: 6,
            opacity: 0.25 * p,
            shadowColor: "#ffd3ea",
          },
          radiusPx,
          cssW,
          cssH
        );
      }
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Animate from "misaligned" to "aligned".
    const controls = animate(progress, 1, {
      duration: 650,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [alignment.reflected, alignment.rotationAngle, preparedA, preparedB, progress, score]);

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Draw first frame.
      progress.set(0);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [progress]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur border border-sky-100">
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-sky-50/20 pointer-events-none" />
      <div className="h-[320px] sm:h-[380px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

