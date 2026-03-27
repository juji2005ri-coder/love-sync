"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
import { Heart, Sparkles, RotateCcw, Users, Copy, Check } from "lucide-react";

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
    } else {
      setDisplayScore(0);
    }
  }, [result]);

  const handleCommit1 = async (pts: NormalizedPoint[]) => {
    if (supabaseConfigMissingReason) return;
    if (role !== "one") return;
    if (status !== "waiting_for_1") return;
    setIsWriting(true);
    addLog("Committing first heart...");
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          one_points: pts,
          status: "waiting_for_2",
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);
      if (error) {
        addLog(`Error committing 1: [${error.code}] ${error.message}. ${error.details || ""}`);
        console.error("Full commit error:", error);
      } else {
        addLog("First heart committed successfully.");
      }
    } finally {
      setIsWriting(false);
    }
  };

  const handleCommit2 = async (pts: NormalizedPoint[]) => {
    if (supabaseConfigMissingReason) return;
    if (role !== "two") return;
    if (status !== "waiting_for_2") return;
    setIsWriting(true);
    addLog("Committing second heart...");
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          two_points: pts,
          status: "done",
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);
      if (error) {
        addLog(`Error committing 2: [${error.code}] ${error.message}`);
      } else {
        addLog("Second heart committed. Fetching final results...");
        // Immediate refetch to ensure local state is updated instantly
        await fetchInitial();
      }
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
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
                        className="h-10 px-3 rounded-2xl bg-white/70 border border-rose-200 text-rose-800 font-semibold hover:bg-white flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Start over
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-5">
                  <div className="md:col-span-2">
                    <div className="rounded-3xl bg-gradient-to-b from-pink-50 to-white border border-rose-100 p-5">
                      <div className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Destined Sync Score
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <div className="text-5xl font-black tracking-tight text-rose-900">{displayScore}</div>
                        <div className="text-lg font-bold text-rose-800">%</div>
                      </div>
                      <div className="mt-3 text-rose-900 font-black text-lg leading-snug">
                        {/* reuse the same message logic in LoveSyncApp by recomputing with score thresholds */}
                        {(() => {
                          const s = result.score;
                          if (s >= 92) return "Destined couple! Almost perfect sync";
                          if (s >= 80) return "Destined couple! Let's deepen the connection";
                          if (s >= 65) return "Share more love";
                          if (s >= 45) return "One more step. You're getting closer";
                          if (s >= 25) return "Just started. Try a little more magic";
                          return "Sync experiment start! Draw with lots of love today";
                        })()}
                      </div>
                      <div className="mt-4 text-sm text-rose-700">Getting 100 points is intentionally a bit hard.</div>
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
      </div>
    </div>
  );
}

