"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  getChallengesForScore,
  getScoreRangeKey,
  pickChallengeForScore,
} from "@/lib/dateRoulette";
import { translations, type Locale } from "@/lib/i18n";

type RoulettePhase = "match" | "suspense" | "fate" | "roulette" | "result";

type DateRouletteExperienceProps = {
  score: number;
  locale: Locale;
};

const SEGMENT_COUNT = 5;
const SEGMENT_DEG = 360 / SEGMENT_COUNT;

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function createSegmentPath(startDeg: number, endDeg: number, outerRadius: number, innerRadius: number) {
  const cx = 120;
  const cy = 120;
  const startOuter = polarToCartesian(cx, cy, outerRadius, startDeg);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endDeg);
  const endInner = polarToCartesian(cx, cy, innerRadius, endDeg);
  const startInner = polarToCartesian(cx, cy, innerRadius, startDeg);
  const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ");
}

function getMoodClasses(score: number) {
  if (score <= 40) {
    return {
      badge: "text-violet-900",
      glow: "from-violet-200/60 via-purple-100/50 to-rose-100/60",
      support: "text-violet-700",
    };
  }
  if (score <= 70) {
    return {
      badge: "text-sky-900",
      glow: "from-sky-200/60 via-cyan-100/50 to-rose-100/60",
      support: "text-sky-700",
    };
  }
  return {
    badge: "text-rose-900",
    glow: "from-pink-200/70 via-rose-100/60 to-amber-100/60",
    support: "text-rose-700",
  };
}

export default function DateRouletteExperience({ score, locale }: DateRouletteExperienceProps) {
  const t = translations[locale];

  const [phase, setPhase] = useState<RoulettePhase>("match");

  const { challengeId, selectedIndex } = useMemo(() => {
    const picked = pickChallengeForScore(score);
    return {
      challengeId: picked.challengeId,
      selectedIndex: picked.index,
    };
  }, [score]);

  const challenges = useMemo(() => getChallengesForScore(score), [score]);
  const idleRotation = 24;
  const rouletteRotation = useMemo(
    () => 360 * 6 + (324 - selectedIndex * SEGMENT_DEG),
    [selectedIndex]
  );

  const toneText =
    score <= 40
      ? t.dateRoulette.matchSupportLow
      : score <= 70
      ? t.dateRoulette.matchSupportMid
      : t.dateRoulette.matchSupportHigh;

  const moodClasses = getMoodClasses(score);

  useEffect(() => {
    const timers: number[] = [];

    if (phase === "match") {
      timers.push(window.setTimeout(() => setPhase("suspense"), 1200));
    } else if (phase === "suspense") {
      timers.push(window.setTimeout(() => setPhase("fate"), 1200));
    } else if (phase === "fate") {
      timers.push(window.setTimeout(() => setPhase("roulette"), 900));
    } else if (phase === "roulette") {
      timers.push(window.setTimeout(() => setPhase("result"), 2600));
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [phase]);

  return (
    <div className="mt-8 rounded-3xl border border-rose-100 bg-white/85 p-5 sm:p-6 shadow-sm">
      <AnimatePresence mode="wait">
        {phase === "match" ? (
          <motion.div
            key="match"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <div className="text-xs font-semibold tracking-[0.26em] text-rose-500/80 uppercase">
              {t.dateRoulette.matchLabel}
            </div>
            <div className={`mt-2 text-6xl sm:text-7xl font-black leading-none tracking-tight ${moodClasses.badge}`}>
              {score}%
            </div>
            <div className={`mt-3 text-base sm:text-lg font-semibold ${moodClasses.support}`}>{toneText}</div>
          </motion.div>
        ) : null}

        {phase === "suspense" ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="text-center py-4"
          >
            <div className="text-xs font-semibold tracking-[0.22em] text-rose-500/80 uppercase">
              {t.dateRoulette.suspenseLabel}
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-rose-900">{t.dateRoulette.decidesNextDate}</div>
          </motion.div>
        ) : null}

        {phase === "fate" ? (
          <motion.div
            key="fate"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
            className={`rounded-2xl border border-rose-100 bg-gradient-to-br ${moodClasses.glow} p-6 sm:p-8 text-center`}
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl sm:text-4xl font-black text-rose-900"
            >
              {t.dateRoulette.fateIs}
            </motion.div>
          </motion.div>
        ) : null}

        {phase === "roulette" || phase === "result" ? (
          <motion.div
            key="roulette"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="text-xs font-semibold tracking-[0.2em] text-rose-500/80 uppercase">
              {t.dateRoulette.rouletteLabel}
            </div>

            <div className="relative mt-4 w-full max-w-[320px] aspect-square">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-rose-600 drop-shadow" />
              <motion.svg
                viewBox="0 0 240 240"
                className="w-full h-full drop-shadow-md"
                animate={{
                  rotate: phase === "roulette" || phase === "result" ? rouletteRotation : idleRotation,
                }}
                transition={{
                  duration: phase === "roulette" ? 2.6 : 0.2,
                  ease: [0.12, 0.86, 0.22, 1],
                }}
              >
                <circle cx="120" cy="120" r="113" fill="#fff8fb" stroke="#fecdd3" strokeWidth="2" />
                {challenges.map((id, index) => {
                  const start = -90 + index * SEGMENT_DEG;
                  const end = start + SEGMENT_DEG;
                  const centerAngle = start + SEGMENT_DEG / 2;
                  const labelPos = polarToCartesian(120, 120, 75, centerAngle);
                  const title = t.dateRoulette.challenges[id].title;
                  return (
                    <g key={id}>
                      <path
                        d={createSegmentPath(start, end, 112, 32)}
                        fill={index % 2 === 0 ? "#ffe4ef" : "#ffeef5"}
                        stroke="#fda4af"
                        strokeWidth="1"
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        fontSize="9"
                        fontWeight="700"
                        fill="#9f1239"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {title}
                      </text>
                    </g>
                  );
                })}
                <circle cx="120" cy="120" r="30" fill="#fff" stroke="#fb7185" strokeWidth="2" />
              </motion.svg>
            </div>

            <div className="mt-4 text-sm font-semibold text-rose-700">
              {phase === "roulette" ? t.dateRoulette.spinning : t.dateRoulette.resultReady}
            </div>
            <div className="mt-1 text-xs text-rose-500">{t.dateRoulette.rangeLabel[getScoreRangeKey(score)]}</div>

            {phase === "result" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, type: "spring", bounce: 0.32 }}
                className="mt-5 w-full rounded-2xl border border-rose-200 bg-gradient-to-br from-white to-rose-50 p-4 sm:p-5 text-center shadow-inner"
              >
                <div className="text-xs font-semibold tracking-[0.22em] uppercase text-rose-500/80">
                  {t.dateRoulette.yourDateChallenge}
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-900">
                  {t.dateRoulette.challenges[challengeId].title}
                </div>
                <div className="mt-2 text-sm sm:text-base text-rose-700 font-medium">
                  {t.dateRoulette.challenges[challengeId].description}
                </div>
                <div className="mt-3 text-xs text-rose-500">{t.dateRoulette.reactionWindow}</div>
              </motion.div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
