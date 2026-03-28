"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles, RotateCcw, Users, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";

import HeartCanvas, { type NormalizedPoint } from "@/components/HeartCanvas";
import HeartComparisonCanvas from "@/components/HeartComparisonCanvas";
import { heartSimilarity, type SimilarityResult } from "@/lib/heartSimilarity";
import { supabase, getSupabaseConfigMissingReason } from "@/lib/supabase";

type RoomStatus = "waiting_for_1" | "waiting_for_2" | "done";
type Role = "one" | "two" | "spectator";
type RoomDoc = {
  status?: RoomStatus;
  one_client_id?: string | null;
  two_client_id?: string | null;
  one_points?: NormalizedPoint[] | null;
  two_points?: NormalizedPoint[] | null;
};

const CLIENT_ID_KEY = "love_sync_client_id";

function getOrCreateClientId() {
  if (typeof window === "undefined") return "server";
  // sessionStorage ensures different tabs in the same browser get different roles.
  const existing = window.sessionStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = (crypto?.randomUUID?.() ?? `client_${Math.random().toString(16).slice(2)}`).replace(/-/g, "");
  window.sessionStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

function statusText(status: RoomStatus, role: Role) {
  if (status === "waiting_for_1") return role === "one" ? "Waiting: draw your heart (1st)" : "Waiting: someone will start (1st).";
  if (status === "waiting_for_2") return role === "two" ? "Waiting: draw your heart (2nd)" : "Waiting: partner draws (2nd).";
  return "Results are ready.";
}

export default function RoomLoveSync({ roomId }: { roomId: string }) {
  const supabaseConfigMissingReason = useMemo(() => getSupabaseConfigMissingReason(), []);

  const clientId = useMemo(() => getOrCreateClientId(), []);

  const [status, setStatus] = useState<RoomStatus>("waiting_for_1");
  const [role, setRole] = useState<Role>("spectator");
  const [onePoints, setOnePoints] = useState<NormalizedPoint[] | null>(null);
  const [twoPoints, setTwoPoints] = useState<NormalizedPoint[] | null>(null);
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const didClaimRef = useRef(false);

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const resetLocalResult = () => {
    setResult(null);
    setDisplayScore(0);
  };

  useEffect(() => {
    setReady(true);
  }, []);

  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog((prev) => [msg, ...prev].slice(0, 5));
  };

  const claimRole = useCallback(
    async (data: RoomDoc) => {
      if (didClaimRef.current) return;
      if (supabaseConfigMissingReason) return;

      addLog(`Claiming role... current status: ${data.status}`);

      // If the role is already assigned to this client, just set it.
      if (data?.one_client_id === clientId) {
        addLog("Already assigned as 'one'");
        setRole("one");
        didClaimRef.current = true;
        return;
      }
      if (data?.two_client_id === clientId) {
        addLog("Already assigned as 'two'");
        setRole("two");
        didClaimRef.current = true;
        return;
      }

      // First try to claim 'one'
      if (!data.one_client_id) {
        addLog("Trying to claim 'one'...");
        const { error } = await supabase
          .from("rooms")
          .update({ one_client_id: clientId })
          .eq("id", roomId)
          .is("one_client_id", null);

        if (!error) {
          addLog("Claimed 'one' successfully!");
          setRole("one");
          didClaimRef.current = true;
          return;
        } else {
          addLog(`Failed to claim 'one': ${error.message}`);
        }
      }

      // Then try to claim 'two'
      if (!data.two_client_id) {
        addLog("Trying to claim 'two'...");
        const { error } = await supabase
          .from("rooms")
          .update({ two_client_id: clientId })
          .eq("id", roomId)
          .is("two_client_id", null);

        if (!error) {
          addLog("Claimed 'two' successfully!");
          setRole("two");
          didClaimRef.current = true;
          return;
        } else {
          addLog(`Failed to claim 'two': ${error.message}`);
        }
      }

      addLog("No slots available, spectator mode.");
      setRole("spectator");
      didClaimRef.current = true;
    },
    [clientId, supabaseConfigMissingReason, roomId]
  );

  const fetchInitial = useCallback(async () => {
    if (!roomId) return;
    addLog(`Fetching room data...`);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) {
      addLog(`Fetch error: ${error.message}`);
    }

    if (data && !error) {
      const d = data as RoomDoc;
      addLog(`Data fetched. Status: ${d.status}`);
      setStatus(d.status ?? "waiting_for_1");
      setOnePoints(d.one_points ?? null);
      setTwoPoints(d.two_points ?? null);
      claimRole(d);
    }
  }, [roomId, claimRole]);

  useEffect(() => {
    if (supabaseConfigMissingReason) return;
    fetchInitial();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          addLog(`Realtime event: ${payload.eventType}`);
          const d = payload.new as RoomDoc;
          
          // If update payload is empty or partial, refetch to be sure
          if (!d || !d.status || (d.status === "done" && (!d.one_points || !d.two_points))) {
            addLog("Partial update received, refetching...");
            fetchInitial();
            return;
          }
          
          setStatus(d.status);
          resetLocalResult();
          setOnePoints(d.one_points ?? null);
          setTwoPoints(d.two_points ?? null);
          claimRole(d);
        }
      )
      .subscribe((status) => {
        addLog(`Realtime status: ${status}`);
        if (status === "SUBSCRIBED") {
          fetchInitial();
        }
      });

    // Polling fallback: Every 2 seconds, check if data is consistent
    const intervalId = setInterval(() => {
      if (status === "done" && (!onePoints || !twoPoints)) {
        addLog("Polling for missing results...");
        fetchInitial();
      }
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [fetchInitial, supabaseConfigMissingReason, roomId, claimRole, status, onePoints, twoPoints]);

  useEffect(() => {
    if (status !== "done") {
      setResult(null);
      return;
    }
    if (!onePoints || !twoPoints) {
      addLog("Points missing, refetching for calculation...");
      fetchInitial(); // Force refetch if points are null
      return;
    }
    addLog("Calculating similarity...");
    const sim = heartSimilarity(onePoints, twoPoints, { sampleN: 100 }); // Slightly reduce sample size for faster calculation
    setResult(sim);
    addLog(`Similarity: ${sim.score}%`);
  }, [onePoints, twoPoints, status, fetchInitial]);

  useEffect(() => {
    if (result) {
      setDisplayScore(result.score);
      
      // Trigger animations based on score
      if (result.score >= 90) {
        // Perfect/Great: Massive celebration
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 30 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 300);
      } else if (result.score >= 70) {
        // Good: Heart-colored simple burst
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ff5fa9', '#ff9fcf', '#ffffff']
        });
      } else if (result.score >= 50) {
        // Fair: Small subtle burst
        confetti({
          particleCount: 15,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#ff5fa9', '#6fd3ff']
        });
      }
    } else {
      setDisplayScore(0);
    }
  }, [result]);

  const handleCommit1 = async (pts: NormalizedPoint[]) => {
    if (supabaseConfigMissingReason) return;
    if (role !== "one") {
      addLog("Cannot commit: You are not Player 1.");
      return;
    }
    if (status !== "waiting_for_1") {
      addLog(`Cannot commit: Current status is ${status}.`);
      return;
    }
    setIsWriting(true);
    addLog("Committing first heart...");
    try {
      // Use conditional update for safety (status must be waiting_for_1)
      const { error } = await supabase
        .from("rooms")
        .update({
          one_points: pts,
          status: "waiting_for_2",
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)
        .eq("status", "waiting_for_1");

      if (error) {
        addLog(`Error committing 1: [${error.code}] ${error.message}`);
        console.error("Full commit error:", error);
        // On error, let the user try again
      } else {
        addLog("First heart committed successfully. Syncing...");
        // Important: Immediately refetch to update local state and 'status'
        await fetchInitial();
      }
    } catch (err: any) {
      addLog(`Unexpected error: ${err?.message || "unknown"}`);
    } finally {
      setIsWriting(false);
    }
  };

  const handleCommit2 = async (pts: NormalizedPoint[]) => {
    if (supabaseConfigMissingReason) return;
    if (role !== "two") {
      addLog("Cannot commit: You are not Player 2.");
      return;
    }
    if (status !== "waiting_for_2") {
      addLog(`Cannot commit: Current status is ${status}.`);
      return;
    }
    setIsWriting(true);
    addLog("Committing second heart...");
    try {
      // Use conditional update for safety (status must be waiting_for_2)
      const { error } = await supabase
        .from("rooms")
        .update({
          two_points: pts,
          status: "done",
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)
        .eq("status", "waiting_for_2");

      if (error) {
        addLog(`Error committing 2: [${error.code}] ${error.message}`);
      } else {
        addLog("Second heart committed. Fetching final results...");
        // Immediate refetch to ensure local state is updated instantly
        await fetchInitial();
      }
    } catch (err: any) {
      addLog(`Unexpected error: ${err?.message || "unknown"}`);
    } finally {
      setIsWriting(false);
    }
  };

  const handleResetRoom = async () => {
    if (supabaseConfigMissingReason) return;
    // Let only role "one" reset to reduce conflicts.
    if (role !== "one") return;
    setIsWriting(true);
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          status: "waiting_for_1",
          one_points: null,
          two_points: null,
          one_client_id: null,
          two_client_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);
      
      if (error) {
        console.error("Error resetting room:", error);
        return;
      }

      didClaimRef.current = false;
      setRole("spectator");
      setOnePoints(null);
      setTwoPoints(null);
      setResult(null);
    } finally {
      setIsWriting(false);
    }
  };

  if (supabaseConfigMissingReason) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white/80 border border-rose-200 rounded-3xl p-6">
            <div className="text-lg font-black text-rose-900">Supabase is not configured.</div>
            <div className="mt-2 text-sm text-rose-700">{supabaseConfigMissingReason}</div>
            <div className="mt-6 text-xs text-rose-600">
              Set the required `NEXT_PUBLIC_SUPABASE_*` env vars and restart the dev server.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white/80 border border-rose-200 rounded-3xl p-6 text-sm text-rose-800">
            Connecting to the room...
          </div>
        </div>
      </div>
    );
  }

  const title =
    role === "one" ? "Draw your heart (1st) on this device" : role === "two" ? "Draw your heart (2nd) on this device" : "Waiting room";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-11 h-11 rounded-2xl bg-white/70 border border-pink-200 shadow-sm flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-rose-900">Love Sync Score (Room)</div>
            <div className="text-sm text-rose-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              room: {roomId}
            </div>
          </div>
        </header>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {status !== "done" ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-lg font-black text-rose-900">{title}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={fetchInitial}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors"
                        title="Manual Refresh"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Refresh
                      </button>
                      <button
                        onClick={handleCopyRoomId}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Room Number
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-rose-700">{statusText(status, role)}</div>
                </div>

                <div className="mt-6">
                  {role === "one" ? (
                    <HeartCanvas
                      strokeColor="#ff5fa9"
                      strokeWidth={11}
                      onCommit={handleCommit1}
                      title="Drawing Canvas"
                      subtitle={isWriting ? "Saving..." : status === "waiting_for_1" ? "Press Confirm when you are ready" : "Waiting for partner's turn"}
                      disabled={isWriting || status !== "waiting_for_1"}
                    />
                  ) : null}

                  {role === "two" ? (
                    <HeartCanvas
                      strokeColor="#6fd3ff"
                      strokeWidth={11}
                      onCommit={handleCommit2}
                      title="Drawing Canvas"
                      subtitle={isWriting ? "Saving..." : status === "waiting_for_2" ? "Press Confirm when you are ready" : "Waiting for previous heart"}
                      disabled={isWriting || status !== "waiting_for_2"}
                    />
                  ) : null}

                  {role === "spectator" ? (
                    <div className="rounded-3xl bg-rose-50/60 border border-rose-100 p-6 text-rose-700 text-sm">
                      You&apos;re here as a spectator. Open the same room URL, and wait until it&apos;s your turn.
                    </div>
                  ) : null}
                </div>

                {role === "one" ? (
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        didClaimRef.current = false;
                        addLog("Manual re-claim triggered");
                        supabase.from("rooms").select("*").eq("id", roomId).single().then(({ data }) => data && claimRole(data));
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-600 underline"
                    >
                      Debug: Re-claim role
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRoom}
                      disabled={isWriting}
                      className="h-10 px-3 rounded-2xl bg-white/70 border border-rose-200 text-rose-800 font-semibold hover:bg-white flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Start over
                    </button>
                  </div>
                ) : null}

                {/* Debug Log Panel */}
                <div className="mt-8 pt-6 border-t border-rose-100">
                  <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-2">Connection Debug</div>
                  <div className="bg-rose-50/50 rounded-xl p-3 font-mono text-[10px] text-rose-600 flex flex-col gap-1">
                    <div>Role: {role}</div>
                    <div>Status: {status}</div>
                    <div>Client ID: {clientId.slice(0, 8)}...</div>
                    <div className="mt-2 pt-2 border-t border-rose-100">
                      {debugLog.map((log, i) => (
                        <div key={i} className={i === 0 ? "font-bold text-rose-800" : "opacity-70"}>
                          {">"} {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {status === "done" && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm relative overflow-hidden"
              >
                {/* Dynamic background glow for high scores */}
                {displayScore >= 70 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="absolute -top-24 -right-24 w-64 h-64 bg-pink-300 blur-[80px] rounded-full pointer-events-none"
                  />
                )}
                {displayScore >= 90 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-300 blur-[80px] rounded-full pointer-events-none"
                  />
                )}

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div>
                    <div className="text-sm font-semibold text-rose-800">Sync Result</div>
                    <div className="text-xs text-rose-600 mt-1">Size and position are ignored. We score shape similarity.</div>
                  </div>
                  <div className="flex gap-2">
                    {role === "one" ? (
                      <button
                        type="button"
                        onClick={handleResetRoom}
                        disabled={isWriting}
                        className="h-10 px-3 rounded-2xl bg-white/70 border border-rose-200 text-rose-800 font-semibold hover:bg-white flex items-center gap-2 transition-all active:scale-95"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Start over
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-5 relative z-10">
                  <div className="md:col-span-2">
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-3xl bg-gradient-to-b from-pink-50 to-white border border-rose-100 p-5 shadow-inner"
                    >
                      <div className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${displayScore >= 70 ? "text-amber-400 animate-pulse" : "text-rose-400"}`} />
                        Destined Sync Score
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20,
                            delay: 0.3 
                          }}
                          className="text-6xl font-black tracking-tight text-rose-900 drop-shadow-sm"
                        >
                          {displayScore}
                        </motion.div>
                        <div className="text-xl font-bold text-rose-800">%</div>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 text-rose-900 font-black text-xl leading-snug"
                      >
                        {(() => {
                          const s = result.score;
                          if (s >= 95) return "True Soulmates! 💖 Your hearts are one.";
                          if (s >= 85) return "Perfect Match! ✨ Almost identical sync.";
                          if (s >= 70) return "Destined Couple! 💕 Deep connection found.";
                          if (s >= 50) return "Great Harmony! 🌸 A beautiful match.";
                          if (s >= 30) return "Warm Connection 💝 Good start together.";
                          return "Sync Experiment Start! 🍬 Draw with more love.";
                        })()}
                      </motion.div>
                      <div className="mt-5 text-xs text-rose-500 font-medium italic">
                        {displayScore >= 90 ? "You two are legendary!" : "Getting 100 points is intentionally a bit hard."}
                      </div>
                    </motion.div>
                  </div>

                  <div className="md:col-span-3">
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <HeartComparisonCanvas
                        preparedA={result.preparedA}
                        preparedB={result.preparedB}
                        alignment={result.alignment}
                        score={result.score}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

