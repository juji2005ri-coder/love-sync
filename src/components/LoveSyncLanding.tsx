"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles, Users } from "lucide-react";

import LoveSyncApp from "@/components/LoveSyncApp";
import RoomLoveSync from "@/components/RoomLoveSync";
import { supabase, getSupabaseConfigMissingReason } from "@/lib/supabase";

type Mode = "local" | "online";

function generateRoomId() {
  const id = (crypto?.randomUUID?.() ?? `room_${Math.random().toString(16).slice(2)}`).replace(/-/g, "");
  return id.slice(0, 10);
}

export default function LoveSyncLanding() {
  const [mode, setMode] = useState<Mode>("local");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const router = useRouter();

  const supabaseConfigMissingReason = useMemo(() => getSupabaseConfigMissingReason(), []);

  const [creating, setCreating] = useState(false);
  const [roomToJoin, setRoomToJoin] = useState("");

  const handleCreateRoom = async () => {
    if (supabaseConfigMissingReason) return;
    setCreating(true);
    try {
      const roomId = generateRoomId();
      const { error } = await supabase
        .from("rooms")
        .insert({
          id: roomId,
          status: "waiting_for_1",
          one_client_id: null,
          two_client_id: null,
          one_points: null,
          two_points: null,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error creating room:", error);
        alert("Failed to create room. Please try again.");
        return;
      }

      setCurrentRoomId(roomId);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (!roomToJoin.trim()) return;
    let id = roomToJoin.trim();
    if (id.includes("/room/")) {
      id = id.split("/room/").pop()?.split("/")[0] || id;
    }
    setCurrentRoomId(id);
  };

  if (currentRoomId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50 relative">
        <button
          onClick={() => setCurrentRoomId(null)}
          className="absolute top-4 left-4 z-10 px-4 py-2 rounded-xl bg-white/70 border border-rose-200 text-rose-800 text-xs font-bold hover:bg-white transition shadow-sm"
        >
          ← Back to Menu
        </button>
        <RoomLoveSync roomId={currentRoomId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-11 h-11 rounded-2xl bg-white/70 border border-pink-200 shadow-sm flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-rose-900">Love Sync Score</div>
            <div className="text-sm text-rose-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Local + Online Rooms
            </div>
          </div>
        </header>

        <div className="mt-6 flex gap-2 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setMode("local")}
            className={`h-10 px-4 rounded-2xl border font-semibold transition ${
              mode === "local" ? "bg-white/80 border-rose-200 text-rose-900" : "bg-white/40 border-rose-100 text-rose-800 hover:bg-white/60"
            }`}
          >
            Local (Mock)
          </button>
          <button
            type="button"
            onClick={() => setMode("online")}
            className={`h-10 px-4 rounded-2xl border font-semibold transition ${
              mode === "online" ? "bg-white/80 border-sky-200 text-sky-900" : "bg-white/40 border-sky-100 text-sky-800 hover:bg-white/60"
            }`}
          >
            Online Room
          </button>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {mode === "local" ? (
              <motion.div
                key="local"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <LoveSyncApp />
              </motion.div>
            ) : null}

            {mode === "online" ? (
              <motion.div
                key="online"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-white/70 border border-rose-100 rounded-3xl p-5 sm:p-7 backdrop-blur shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Create a room
                      </div>
                      <div className="mt-2 text-sm text-rose-700">
                        Create once, then open the same URL on another device to sync and score.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleCreateRoom}
                        disabled={!!supabaseConfigMissingReason || creating}
                        className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-500 text-white font-semibold shadow-lg hover:brightness-105 disabled:opacity-50"
                      >
                        {creating ? "Creating..." : "Create New Room"}
                      </button>
                    </div>

                    <div className="pt-6 border-t border-rose-100">
                      <div className="text-sm font-semibold text-rose-800 flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4" />
                        Join existing room
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste Room ID"
                          value={roomToJoin}
                          onChange={(e) => setRoomToJoin(e.target.value)}
                          className="flex-1 h-11 px-4 rounded-xl bg-white/50 border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                        <button
                          type="button"
                          onClick={handleJoinRoom}
                          className="px-6 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold hover:bg-white transition"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>

                  {supabaseConfigMissingReason ? (
                    <div className="mt-4 text-sm text-rose-700 bg-rose-50/70 border border-rose-100 rounded-2xl p-4">
                      Supabase is not configured. {supabaseConfigMissingReason}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <footer className="mt-10 text-center text-xs text-rose-700/80">
          Next.js + Tailwind + Framer Motion (Local + Online) / Online uses Supabase
        </footer>
      </div>
    </div>
  );
}

