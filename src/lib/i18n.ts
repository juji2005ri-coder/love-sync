export type Locale = "en" | "ja";

export const defaultLocale: Locale = "en";

export const localeOptions: Locale[] = ["en", "ja"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
};

export const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return defaultLocale;

  const saved = window.localStorage.getItem("love-sync-locale");
  if (saved === "en" || saved === "ja") return saved;

  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
};

export const translations = {
  en: {
    language: "Language",
    backToMenu: "← Back to Menu",
    title: "Love Sync Score",
    subtitle: "Local + Online Rooms",
    localMode: "Local (Mock)",
    onlineMode: "Online Room",
    createRoomTitle: "Create a room",
    createRoomDescription:
      "Create once, then open the same URL on another device to sync and score.",
    createRoomButton: "Create New Room",
    creatingRoomButton: "Creating...",
    joinRoomTitle: "Join existing room",
    joinPlaceholder: "Paste Room ID",
    joinButton: "Join",
    supabaseMissing: "Supabase is not configured.",
    footer: "Next.js + Tailwind + Framer Motion (Local + Online) / Online uses Supabase",
    localTwoPlayer: "Local two-player (Mock)",
    firstHeartTitle: "1st: Your Heart",
    firstHeartDescription:
      "Take your time. The closer the shape, the higher the score.",
    letsGo: "Let's go",
    partnerTurn: "It's your partner's turn",
    partnerTurnDescription:
      "Use this moment as a signal and draw with the same feeling.",
    secondHeartTitle: "2nd: Partner's Heart",
    secondHeartDescription:
      "Sync gets higher as you match the shape (position offsets are fine).",
    confirmReady: "Confirm when ready",
    syncResultTitle: "Sync Result",
    syncResultDescription:
      "We ignore size and position differences and score how similar the shapes are.",
    startOver: "Start over",
    destinedScoreTitle: "Destined Sync Score",
    refresh: "Refresh",
    copyRoomNumber: "Copy Room Number",
    copied: "Copied!",
    waitingRoom: "Waiting room",
    drawYourHeart1: "Draw your heart (1st) on this device",
    drawYourHeart2: "Draw your heart (2nd) on this device",
    waitingSomeoneStarts: "Waiting: someone will start (1st).",
    waitingYourTurn1: "Waiting: draw your heart (1st)",
    waitingYourTurn2: "Waiting: draw your heart (2nd)",
    waitingPartner1: "Waiting: partner draws (2nd).",
    waitingPartner2: "Waiting for partner's turn",
    resultsReady: "Results are ready.",
    spectatorMessage:
      "You're here as a spectator. Open the same room URL, and wait until it's your turn.",
    connectionDebug: "Connection Debug",
    debugReclaim: "Debug: Re-claim role",
    saving: "Saving...",
    manualRefresh: "Manual Refresh",
    drawingCanvas: "Drawing Canvas",
    pressConfirmToContinue: "Press Confirm to continue",
    pressConfirmToScore: "Press Confirm to get the sync score",
    connecting: "Connecting to the room...",
    drawWithMouse: "Draw with your finger or mouse",
    readyState: "Ready!",
    drawingState: "Drawing...",
    redraw: "Redraw",
    confirm: "Confirm",
    tooShortHint: "Draw a bit more, then press Confirm.",
    roomLabel: "room:",
    roomTitle: "Love Sync Score (Room)",
    scoreDetail: "Size and position are ignored. We score shape similarity.",
    resultMessage: (score: number) => {
      if (score >= 92) return "Destined couple! Almost perfect sync";
      if (score >= 80) return "Destined couple! Let's deepen the connection";
      if (score >= 65) return "Share more love";
      if (score >= 45) return "One more step. You're getting closer";
      if (score >= 25) return "Just started. Try a little more magic";
      return "Sync experiment start! Draw with lots of love today";
    },
    scoreMessage: (score: number) => {
      if (score >= 95) return "True Soulmates! 💖 Your hearts are one.";
      if (score >= 85) return "Perfect Match! ✨ Almost identical sync.";
      if (score >= 70) return "Destined Couple! 💕 Deep connection found.";
      if (score >= 50) return "Great Harmony! 🌸 A beautiful match.";
      if (score >= 30) return "Warm Connection 💝 Good start together.";
      return "Sync Experiment Start! 🍬 Draw with more love.";
    },
    scoreNote: "You two are legendary!",
    scoreNoteLow: "Getting 100 points is intentionally a bit hard.",
    compareHint: "Use this moment as a signal and draw with the same feeling.",
  },
  ja: {
    language: "言語",
    backToMenu: "← メニューに戻る",
    title: "Love Sync Score",
    subtitle: "ローカル + オンラインルーム",
    localMode: "ローカル（モック）",
    onlineMode: "オンラインルーム",
    createRoomTitle: "ルームを作成",
    createRoomDescription:
      "一度作成したら、同じURLを別の端末で開いて同期してスコアを確認できます。",
    createRoomButton: "新しいルームを作成",
    creatingRoomButton: "作成中...",
    joinRoomTitle: "既存のルームに参加",
    joinPlaceholder: "ルームIDを貼り付け",
    joinButton: "参加",
    supabaseMissing: "Supabase が未設定です。",
    footer: "Next.js + Tailwind + Framer Motion（ローカル + オンライン）/ オンラインは Supabase を使用",
    localTwoPlayer: "ローカル 2人プレイ（モック）",
    firstHeartTitle: "1人目: あなたのハート",
    firstHeartDescription: "ゆっくり描いてください。形が近いほどスコアが上がります。",
    letsGo: "始めよう",
    partnerTurn: "パートナーの番です",
    partnerTurnDescription: "この時間を見て、同じ気持ちで描いてください。",
    secondHeartTitle: "2人目: パートナーのハート",
    secondHeartDescription:
      "形が似ているほどスコアが高くなります（位置のずれは問題ありません）。",
    confirmReady: "準備できたら確定",
    syncResultTitle: "スコア結果",
    syncResultDescription:
      "サイズと位置の違いは無視して、形の類似度でスコアを判定します。",
    startOver: "やり直す",
    destinedScoreTitle: "シンク結果",
    refresh: "更新",
    copyRoomNumber: "部屋番号をコピー",
    copied: "コピー済み",
    waitingRoom: "待機中",
    drawYourHeart1: "この端末で1人目のハートを描く",
    drawYourHeart2: "この端末で2人目のハートを描く",
    waitingSomeoneStarts: "待機中: 誰かが最初を描く（1人目）。",
    waitingYourTurn1: "待機中: ハートを描いてください（1人目）",
    waitingYourTurn2: "待機中: ハートを描いてください（2人目）",
    waitingPartner1: "待機中: パートナーが描いています（2人目）。",
    waitingPartner2: "相手の描画待ち",
    resultsReady: "結果が出ました。",
    spectatorMessage:
      "あなたは観戦者です。同じルームURLを開いて、あなたの順番を待ってください。",
    connectionDebug: "接続デバッグ",
    debugReclaim: "デバッグ: 役割を再取得",
    saving: "保存中...",
    manualRefresh: "手動更新",
    drawingCanvas: "描画キャンバス",
    pressConfirmToContinue: "確定する前に描いてください",
    pressConfirmToScore: "確定してスコアを確認",
    connecting: "ルームに接続中...",
    drawWithMouse: "指かマウスで描いてください",
    readyState: "準備完了",
    drawingState: "描画中...",
    redraw: "やり直し",
    confirm: "確定",
    tooShortHint: "少し描き足してから確定してください。",
    roomLabel: "ルーム:",
    roomTitle: "Love Sync Score（ルーム）",
    scoreDetail: "サイズと位置は無視し、形の類似度で採点します。",
    resultMessage: (score: number) => {
      if (score >= 92) return "運命のカップル！ほぼ完全に同期";
      if (score >= 80) return "運命のカップル！もっと深くつながろう";
      if (score >= 65) return "もっと愛を分かち合おう";
      if (score >= 45) return "もう一歩。近づいています";
      if (score >= 25) return "まだ始めたばかり。もう少し魔法を";
      return "同期の実験開始！今日も愛をたくさん描こう";
    },
    scoreMessage: (score: number) => {
      if (score >= 95) return "真の運命の二人！💖 ふたりのハートが一つです。";
      if (score >= 85) return "完璧なマッチ！✨ ほぼ同じように同期しています。";
      if (score >= 70) return "運命のカップル！💕 深いつながりを見つけました。";
      if (score >= 50) return "素晴らしいハーモニー！🌸 きれいに合っています。";
      if (score >= 30) return "温かいつながり💝 いいスタートです。";
      return "同期の実験開始！🍬 もっと愛を込めて描いてください。";
    },
    scoreNote: "あなたたちは伝説的です！",
    scoreNoteLow: "100点を取るのは意図的に少し難しくしています。",
    compareHint: "この時間を信号にして、同じ気持ちで描いてください。",
  },
} as const;
