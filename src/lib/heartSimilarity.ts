export type Point = { x: number; y: number };

export type AlignmentResult = {
  rotationAngle: number; // radians
  reflected: boolean;
};

export type SimilarityResult = {
  score: number; // 0..100
  distance: number; // normalized DTW distance (lower is better)
  alignment: AlignmentResult;
  preparedA: Point[]; // normalized + resampled
  preparedB: Point[]; // normalized + resampled (unreflected)
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function centroid(points: Point[]): Point {
  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  const n = Math.max(1, points.length);
  return { x: sx / n, y: sy / n };
}

function meanRmsScale(pointsCentered: Point[]): number {
  // RMS scale of coordinates around origin.
  let sumSq = 0;
  for (const p of pointsCentered) sumSq += p.x * p.x + p.y * p.y;
  const n = Math.max(1, pointsCentered.length);
  const rms = Math.sqrt(sumSq / n);
  return rms > 1e-8 ? rms : 1;
}

function normalizeToUnit(points: Point[]): Point[] {
  if (points.length === 0) return [];
  const c = centroid(points);
  const centered = points.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
  const s = meanRmsScale(centered);
  return centered.map((p) => ({ x: p.x / s, y: p.y / s }));
}

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

function bestProcrustesRotation2D(a: Point[], b: Point[]): number {
  // Find angle maximizing: trace(R^T * H), where H = a^T b.
  // For centered 2D points, this reduces to:
  // theta = atan2(sum(a.x*b.y - a.y*b.x), sum(a.x*b.x + a.y*b.y))
  let s1 = 0;
  let s2 = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const ax = a[i].x;
    const ay = a[i].y;
    const bx = b[i].x;
    const by = b[i].y;
    s1 += ax * bx + ay * by;
    s2 += ax * by - ay * bx;
  }
  return Math.atan2(s2, s1);
}

function resamplePolyline(points: Point[], targetN: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: targetN }, () => points[0]);

  // Cumulative arc-length along the polyline.
  const lengths: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
  }
  const total = lengths[lengths.length - 1];
  if (total < 1e-8) {
    // Degenerate: all points nearly identical.
    return Array.from({ length: targetN }, () => points[0]);
  }

  const out: Point[] = [];
  for (let i = 0; i < targetN; i++) {
    const t = (i / (targetN - 1)) * total;
    // Find segment containing distance t.
    let seg = 0;
    while (seg < lengths.length - 2 && lengths[seg + 1] < t) seg++;

    const t0 = lengths[seg];
    const t1 = lengths[seg + 1];
    const alpha = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
    const p0 = points[seg];
    const p1 = points[seg + 1];
    out.push({
      x: p0.x + (p1.x - p0.x) * alpha,
      y: p0.y + (p1.y - p0.y) * alpha,
    });
  }
  return out;
}

function dtwDistance(a: Point[], b: Point[]): number {
  // Standard DTW with 3-neighbor moves (diag/up/left).
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return Number.POSITIVE_INFINITY;

  // We expect n === m after resampling, but keep it generic.
  const prev = new Array<number>(m).fill(Number.POSITIVE_INFINITY);
  const cur = new Array<number>(m).fill(Number.POSITIVE_INFINITY);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  for (let j = 0; j < m; j++) {
    const d = dist(a[0], b[j]);
    prev[j] = d + (j > 0 ? prev[j - 1] : 0);
  }

  for (let i = 1; i < n; i++) {
    cur[0] = dist(a[i], b[0]) + prev[0];
    for (let j = 1; j < m; j++) {
      const d = dist(a[i], b[j]);
      const bestPrev = Math.min(prev[j], cur[j - 1], prev[j - 1]);
      cur[j] = d + bestPrev;
    }
    // swap
    for (let j = 0; j < m; j++) prev[j] = cur[j];
  }

  // Normalize by sequence length to keep scale stable.
  const dtw = prev[m - 1];
  return dtw / Math.max(1, n);
}

export function heartSimilarity(
  rawA: Point[],
  rawB: Point[],
  options?: { sampleN?: number }
): SimilarityResult {
  const sampleN = options?.sampleN ?? 160;
  const aNorm = normalizeToUnit(rawA);
  const bNorm = normalizeToUnit(rawB);

  const preparedA = resamplePolyline(aNorm, sampleN);
  const preparedB = resamplePolyline(bNorm, sampleN);

  // Choose the better between non-reflected vs reflected B, based on DTW.
  let best: {
    distance: number;
    alignment: AlignmentResult;
  } = {
    distance: Number.POSITIVE_INFINITY,
    alignment: { rotationAngle: 0, reflected: false },
  };

  const candidates: Array<{ reflected: boolean; points: Point[] }> = [
    { reflected: false, points: preparedB },
    { reflected: true, points: reflectX(preparedB) },
  ];

  for (const cand of candidates) {
    const angle = bestProcrustesRotation2D(preparedA, cand.points);
    const rotatedB = rotate(cand.points, angle);
    const distance = dtwDistance(preparedA, rotatedB);

    if (distance < best.distance) {
      best = {
        distance,
        alignment: { reflected: cand.reflected, rotationAngle: angle },
      };
    }
  }

  // Turn DTW distance into 0..100 score.
  // Use an exponential mapping so 100 is "hard" (only near-perfect gives ~100).
  // Also add a small nonlinear term to increase sensitivity at the top end.
  const error = best.distance;
  const alpha = 2.2; // tune difficulty: bigger => lower scores
  const gamma = 1.15;
  const rawScore = 100 * Math.exp(-alpha * Math.pow(Math.max(0, error), gamma));
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Safety clamp (avoid NaN)
  return {
    score: Number.isFinite(score) ? score : 0,
    distance: Number.isFinite(error) ? clamp01(error) : 1,
    alignment: best.alignment,
    preparedA,
    preparedB,
  };
}

