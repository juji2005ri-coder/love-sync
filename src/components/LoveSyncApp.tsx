"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
import { Heart, Sparkles, Users, RotateCcw } from "lucide-react";
import HeartCanvas, { type NormalizedPoint } from "@/components/HeartCanvas";
import HeartComparisonCanvas from "@/components/HeartComparisonCanvas";
import { heartSimilarity, type SimilarityResult } from "@/lib/heartSimilarity";

type View = "draw1" | "between12" | "draw2" | "result";

function scoreMessage(score: number) {
  if (score >= 92) return "Destined couple! Almost perfect sync";
  if (score >= 80) return "Destined couple! Let's deepen the connection";
  if (score >= 65) return "Share more love";
  if (score >= 45) return "One more step. You're getting closer";
  if (score >= 25) return "Just started. Try a little more magic";
  return "Sync experiment start! Draw with lots of love today";
}

export default function LoveSyncApp() {
  const [view, setView] = useState<View>("draw1");
  const [points1, setPoints1] = useState<NormalizedPoint[] | null>(null);
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const restart = () => {
    setView("draw1");
    setPoints1(null);
    setResult(null);
    setIsComputing(false);
    setDisplayScore(0);
  };

  useEffect(() => {
    if (!result) return;
    let finished = false;
    const controls = animate(displayScore, result.score, {
      duration: 140,
      ease: "linear",
      onUpdate: (v) => {
        const next = Math.round(v);
        setDisplayScore(next);
        if (next >= result.score) {
          finished = true;
        }
      },
    });

    // Even if the environment is slow and the animation is delayed,
    // make sure we still reach the final value.
    const timeoutId = window.setTimeout(() => {
      if (finished) return;
      controls.stop();
      setDisplayScore(result.score);
      finished = true;
    }, 5000);

    return () => {
      controls.stop();
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleCommit1 = (pts: NormalizedPoint[]) => {
    setPoints1(pts);
    setResult(null);
    setView("between12");
  };

  useEffect(() => {
    if (view !== "between12") return;
    const t = window.setTimeout(() => setView("draw2"), 900);
    return () => window.clearTimeout(t);
  }, [view]);

  const handleCommit2 = async (pts: NormalizedPoint[]) => {
    if (!points1) return;
    setIsComputing(true);

    const sim = heartSimilarity(points1, pts, { sampleN: 160 });
    setResult(sim);
    setIsComputing(false);
    setView("result");
  };

  const message = useMemo(() => (result ? scoreMessage(result.score) : ""), [result]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-11 h-11 rounded-2xl bg-white/70 border border-pink-200 shadow-sm flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-rose-900">
              Love Sync Score
            </div>
            <div className="text-sm text-rose-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Local two-player (Mock)
            </div>
          </div>
        </header>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {view === "draw1" ? (
              <motion.div
                key="draw1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-rose-800">1st: Your Heart</div>
                    <div className="text-xs text-rose-600 mt-1">
                      Take your time. The closer the shape, the higher the score.
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-rose-700 bg-white/70 border border-rose-200 rounded-2xl px-3 py-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold">Let&apos;s go</span>
                  </div>
                </div>

                <div className="mt-5">
                  <HeartCanvas
                    key="canvas1"
                    strokeColor="#ff5fa9"
                    strokeWidth={11}
                    onCommit={handleCommit1}
                    title="Drawing Canvas"
                    subtitle="Press Confirm to continue"
                  />
                </div>
              </motion.div>
            ) : null}

            {view === "between12" ? (
              <motion.div
                key="between12"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm"
              >
                <div className="flex flex-col items-center justify-center text-center gap-3 py-10">
                  <motion.div
                    className="w-16 h-16 rounded-3xl bg-gradient-to-r from-pink-300 to-rose-400 flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 6, -3, 0] }}
                    transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="text-lg font-black text-rose-900">
                    It&apos;s your partner&apos;s turn
                  </div>
                  <div className="text-sm text-rose-700">
                    Use this moment as a signal and draw with the same feeling.
                  </div>
                  <div className="w-full max-w-sm h-2 bg-rose-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.25, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}

            {view === "draw2" ? (
              <motion.div
                key="draw2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-sky-800">
                      2nd: Partner&apos;s Heart
                    </div>
                    <div className="text-xs text-sky-600 mt-1">
                      Sync gets higher as you match the shape (position offsets are fine).
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-sky-700 bg-white/70 border border-sky-200 rounded-2xl px-3 py-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold">Confirm when ready</span>
                  </div>
                </div>

                <div className="mt-5">
                  <HeartCanvas
                    key="canvas2"
                    strokeColor="#6fd3ff"
                    strokeWidth={11}
                    onCommit={handleCommit2}
                    title="Drawing Canvas"
                    subtitle={isComputing ? "Calculating..." : "Press Confirm to get the sync score"}
                    disabled={isComputing}
                  />
                </div>
              </motion.div>
            ) : null}

            {view === "result" && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-rose-800">Sync Result</div>
                    <div className="text-xs text-rose-600 mt-1">
                      We ignore size and position differences and score how similar the shapes are.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={restart}
                    className="h-10 px-3 rounded-2xl bg-white/70 border border-rose-200 text-rose-800 font-semibold hover:bg-white flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start over
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-5">
                  <div className="md:col-span-2">
                    <div className="rounded-3xl bg-gradient-to-b from-pink-50 to-white border border-rose-100 p-5">
                      <div className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Destined Sync Score
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <div className="text-5xl font-black tracking-tight text-rose-900">
                          {displayScore}
                        </div>
                        <div className="text-lg font-bold text-rose-800">%</div>
                      </div>
                      <div className="mt-3 text-rose-900 font-black text-lg leading-snug">
                        {message}
                      </div>
                      <div className="mt-4 text-sm text-rose-700">
                        Getting 100 points is intentionally a bit hard. The distance shrinks as you draw.
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <HeartComparisonCanvas
                      preparedA={result.preparedA}
                      preparedB={result.preparedB}
                      alignment={result.alignment}
                      score={result.score}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <footer className="mt-10 text-center text-xs text-rose-700/80">
          Next.js + Tailwind + Framer Motion (Local Mock) / Drawing runs entirely in your browser
        </footer>
      </div>
    </div>
  );
}

