export type Locale = "en" | "ja" | "ko";

export const defaultLocale: Locale = "en";

export const localeOptions: Locale[] = ["en", "ja", "ko"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

export const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return defaultLocale;

  const saved = window.localStorage.getItem("love-sync-locale");
  if (saved === "en" || saved === "ja" || saved === "ko") return saved;

  const language = navigator.language.toLowerCase();
  if (language.startsWith("ja")) return "ja";
  if (language.startsWith("ko")) return "ko";
  return "en";
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
    createRoomFailed: "Failed to create room. Please try again.",
    joinRoomTitle: "Join existing room",
    joinPlaceholder: "Paste Room ID",
    joinButton: "Join",
    supabaseMissing: "Supabase is not configured.",
    footer: "Next.js + Tailwind + Framer Motion (Local + Online) / Online uses Supabase",
    localFooter: "Next.js + Tailwind + Framer Motion (Local Mock) / Drawing runs entirely in your browser",
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
    envVarNote:
      "Set the required `NEXT_PUBLIC_SUPABASE_*` env vars and restart the dev server.",
    player1Only: "Cannot commit: You are not Player 1.",
    player2Only: "Cannot commit: You are not Player 2.",
    cannotCommitStatus: (status: string) => `Cannot commit: Current status is ${status}.`,
    resetRoomError: "Failed to reset room. Please try again.",
    dateRoulette: {
      matchLabel: "Match",
      matchSupportLow: "This is kind of wild...",
      matchSupportMid: "This could get interesting.",
      matchSupportHigh: "Whoa... your chemistry is glowing.",
      suspenseLabel: "Next up",
      decidesNextDate: "This decides your next date...",
      fateIs: "Your fate is...",
      rouletteLabel: "Date Roulette",
      spinning: "Spinning...",
      resultReady: "Locked in.",
      yourDateChallenge: "Your Date Challenge",
      reactionWindow: "Take it in for a second... and react 💞",
      rangeLabel: {
        "0-20": "Range: 0-20%",
        "21-40": "Range: 21-40%",
        "41-60": "Range: 41-60%",
        "61-80": "Range: 61-80%",
        "81-100": "Range: 81-100%",
      },
      challenges: {
        silent_date: {
          title: "Silent Date",
          description: "No talking during the date.",
        },
        three_dislikes: {
          title: "3 Things You Dislike",
          description: "Tell each other three things you dislike.",
        },
        five_loves: {
          title: "5 Things You Love",
          description: "Name five things you love about your partner.",
        },
        phone_swap: {
          title: "Phone Swap",
          description: "Swap phones during the date.",
        },
        talk_about_exes: {
          title: "Talk About Your Exes",
          description: "Have an honest conversation about your exes.",
        },
        first_date_roleplay: {
          title: "First Date Roleplay",
          description: "Pretend you just met for the first time.",
        },
        formal_language_only: {
          title: "Formal Language Only",
          description: "Speak formally to each other throughout the date.",
        },
        compliment_challenge: {
          title: "Compliment Challenge",
          description: "Keep complimenting each other all date.",
        },
        recreate_ideal_date: {
          title: "Recreate Your Ideal Date",
          description: "Recreate your partner's ideal date.",
        },
        no_holding_hands: {
          title: "No Holding Hands",
          description: "No holding hands during the date.",
        },
        dream_date_pitch: {
          title: "Dream Date Pitch",
          description: "Pitch dream dates. Winner picks where you go.",
        },
        budget_date: {
          title: "Budget Date",
          description: "Go on a date with a limited budget.",
        },
        surprise_challenge: {
          title: "Surprise Challenge",
          description: "Come up with on-the-spot surprises for each other.",
        },
        make_partner_happy: {
          title: "Make Your Partner Happy",
          description: "You have one hour to make your partner as happy as possible.",
        },
        make_them_laugh: {
          title: "Make Them Laugh",
          description: "Try to make your partner laugh as many times as possible.",
        },
        buy_matching_items: {
          title: "Buy Matching Items",
          description: "Buy matching items for each other.",
        },
        staring_contest: {
          title: "Staring Contest",
          description: "Keep eye contact. First to look away loses.",
        },
        pick_for_partner: {
          title: "Pick Something for Your Partner",
          description: "Choose something that suits your partner and exchange picks.",
        },
        love_you_game: {
          title: "\"I Love You\" Game",
          description: "Take turns saying \"I love you.\" Laughing or looking away loses.",
        },
        butler_princess_date: {
          title: "Butler & Princess Date",
          description: "One is the butler, one is the princess for the date.",
        },
        honest_relationship_talk: {
          title: "Honest Relationship Talk",
          description: "Talk honestly about something you usually avoid.",
        },
        grant_partner_wishes: {
          title: "Grant Your Partner's Wishes",
          description: "Try to grant your partner's wishes for one day.",
        },
        fancy_date: {
          title: "Fancy Date",
          description: "Go on a special, dressed-up date.",
        },
        love_letter_exchange: {
          title: "Love Letter Exchange",
          description: "Write and read love letters to each other.",
        },
        partner_first_day: {
          title: "Partner-First Day",
          description: "Put your partner first and minimize distractions for one day.",
        },
      },
    },
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
    createRoomFailed: "ルームの作成に失敗しました。もう一度お試しください。",
    joinRoomTitle: "既存のルームに参加",
    joinPlaceholder: "ルームIDを貼り付け",
    joinButton: "参加",
    supabaseMissing: "Supabase が未設定です。",
    footer: "Next.js + Tailwind + Framer Motion（ローカル + オンライン）/ オンラインは Supabase を使用",
    localFooter: "Next.js + Tailwind + Framer Motion（ローカル モック）/ 描画はブラウザ内で完結",
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
    envVarNote:
      "必要な `NEXT_PUBLIC_SUPABASE_*` 環境変数を設定して、開発サーバーを再起動してください。",
    player1Only: "確定できません: あなたは1人目ではありません。",
    player2Only: "確定できません: あなたは2人目ではありません。",
    cannotCommitStatus: (status: string) => `確定できません: 現在の状態は ${status} です。`,
    resetRoomError: "ルームのリセットに失敗しました。もう一度お試しください。",
    dateRoulette: {
      matchLabel: "MATCH",
      matchSupportLow: "ちょっと波乱の予感かも…",
      matchSupportMid: "これは盛り上がりそう。",
      matchSupportHigh: "すごい…相性がかなりいいかも。",
      suspenseLabel: "次は",
      decidesNextDate: "次のデートはこれで決まります…",
      fateIs: "あなたたちの運命は…",
      rouletteLabel: "デートルーレット",
      spinning: "ルーレット回転中…",
      resultReady: "結果が決まりました。",
      yourDateChallenge: "YOUR DATE CHALLENGE",
      reactionWindow: "2人でリアクションする時間です 💞",
      rangeLabel: {
        "0-20": "対象レンジ: 0-20%",
        "21-40": "対象レンジ: 21-40%",
        "41-60": "対象レンジ: 41-60%",
        "61-80": "対象レンジ: 61-80%",
        "81-100": "対象レンジ: 81-100%",
      },
      challenges: {
        silent_date: {
          title: "サイレントデート",
          description: "デート中は会話なしで過ごす。",
        },
        three_dislikes: {
          title: "苦手なところ3つ",
          description: "お互いに苦手なところを3つ伝える。",
        },
        five_loves: {
          title: "好きなところ5つ",
          description: "相手の好きなところを5つ伝える。",
        },
        phone_swap: {
          title: "スマホ交換デート",
          description: "デート中にスマホを交換して過ごす。",
        },
        talk_about_exes: {
          title: "元恋人トーク",
          description: "元恋人について正直に話し合う。",
        },
        first_date_roleplay: {
          title: "初対面ロールプレイ",
          description: "初めて会った設定でデートする。",
        },
        formal_language_only: {
          title: "敬語オンリーデート",
          description: "デート中はずっと敬語で話す。",
        },
        compliment_challenge: {
          title: "褒めチャレンジ",
          description: "お互いをたくさん褒め続ける。",
        },
        recreate_ideal_date: {
          title: "理想デート再現",
          description: "相手の理想デートを再現する。",
        },
        no_holding_hands: {
          title: "手つなぎ禁止",
          description: "デート中は手をつながない。",
        },
        dream_date_pitch: {
          title: "理想デートプレゼン",
          description: "理想のデートを発表し、勝った方が行き先を決める。",
        },
        budget_date: {
          title: "予算しばりデート",
          description: "限られた予算でデートを楽しむ。",
        },
        surprise_challenge: {
          title: "即興サプライズ",
          description: "その場で相手へのサプライズを考える。",
        },
        make_partner_happy: {
          title: "1時間で幸せにする",
          description: "1時間で相手をできるだけ幸せにする。",
        },
        make_them_laugh: {
          title: "笑わせチャレンジ",
          description: "デート中に何回笑わせられるか挑戦する。",
        },
        buy_matching_items: {
          title: "おそろいアイテム購入",
          description: "お互いにおそろいの物を買う。",
        },
        staring_contest: {
          title: "見つめ合い対決",
          description: "先に目をそらした方が負け。",
        },
        pick_for_partner: {
          title: "似合うもの選び",
          description: "相手に似合うと思うものを選んで交換する。",
        },
        love_you_game: {
          title: "「好き」ゲーム",
          description: "交互に「好き」と言う。照れたり笑ったら負け。",
        },
        butler_princess_date: {
          title: "執事＆お姫さまデート",
          description: "1人は執事、もう1人はお姫さまで過ごす。",
        },
        honest_relationship_talk: {
          title: "本音トーク",
          description: "普段話さないことを正直に話す。",
        },
        grant_partner_wishes: {
          title: "お願い叶えるデー",
          description: "1日だけ相手のお願いをできるだけ叶える。",
        },
        fancy_date: {
          title: "ごほうびデート",
          description: "少し特別な、おしゃれデートに行く。",
        },
        love_letter_exchange: {
          title: "ラブレター交換",
          description: "手紙を書いて読み合う。",
        },
        partner_first_day: {
          title: "相手優先デー",
          description: "1日、相手を最優先してスマホなどの邪魔を減らす。",
        },
      },
    },
  },
  ko: {
    language: "언어",
    backToMenu: "← 메뉴로 돌아가기",
    title: "Love Sync Score",
    subtitle: "로컬 + 온라인 방",
    localMode: "로컬(모의)",
    onlineMode: "온라인 방",
    createRoomTitle: "방 만들기",
    createRoomDescription:
      "한 번 만들면 같은 URL을 다른 기기에서 열어 동기화와 점수를 확인할 수 있습니다.",
    createRoomButton: "새 방 만들기",
    creatingRoomButton: "만드는 중...",
    createRoomFailed: "방 만들기에 실패했습니다. 다시 시도해 주세요.",
    joinRoomTitle: "기존 방 참가",
    joinPlaceholder: "방 ID 붙여넣기",
    joinButton: "참가",
    supabaseMissing: "Supabase가 설정되지 않았습니다.",
    footer: "Next.js + Tailwind + Framer Motion(로컬 + 온라인) / 온라인은 Supabase를 사용합니다",
    localFooter: "Next.js + Tailwind + Framer Motion(로컬 모의) / 그리기는 브라우저 안에서 완료됩니다",
    localTwoPlayer: "로컬 2인 플레이(모의)",
    firstHeartTitle: "1번째: 당신의 하트",
    firstHeartDescription: "천천히 그려 주세요. 모양이 비슷할수록 점수가 높아집니다.",
    letsGo: "시작",
    partnerTurn: "상대 차례입니다",
    partnerTurnDescription: "이 시간을 신호로 삼아 같은 느낌으로 그려 주세요.",
    secondHeartTitle: "2번째: 파트너의 하트",
    secondHeartDescription:
      "모양이 비슷할수록 점수가 높아집니다(위치 차이는 괜찮습니다).",
    confirmReady: "준비되면 확인",
    syncResultTitle: "동기화 결과",
    syncResultDescription:
      "크기와 위치 차이는 무시하고, 모양의 유사도로 점수를 매깁니다.",
    startOver: "다시 시작",
    destinedScoreTitle: "운명적인 동기화 점수",
    refresh: "새로고침",
    copyRoomNumber: "방 번호 복사",
    copied: "복사됨!",
    waitingRoom: "대기실",
    drawYourHeart1: "이 기기에서 1번째 하트를 그리세요",
    drawYourHeart2: "이 기기에서 2번째 하트를 그리세요",
    waitingSomeoneStarts: "대기 중: 누군가가 먼저 그릴 차례입니다(1번째).",
    waitingYourTurn1: "대기 중: 하트를 그려 주세요(1번째)",
    waitingYourTurn2: "대기 중: 하트를 그려 주세요(2번째)",
    waitingPartner1: "대기 중: 파트너가 그리고 있습니다(2번째).",
    waitingPartner2: "상대의 차례를 기다리는 중",
    resultsReady: "결과가 준비되었습니다.",
    spectatorMessage:
      "당신은 관전자입니다. 같은 방 URL을 열고 차례가 올 때까지 기다려 주세요.",
    connectionDebug: "연결 디버그",
    debugReclaim: "디버그: 역할 다시 얻기",
    saving: "저장 중...",
    manualRefresh: "수동 새로고침",
    drawingCanvas: "그리기 캔버스",
    pressConfirmToContinue: "계속하려면 확인을 누르세요",
    pressConfirmToScore: "확인해서 동기화 점수를 확인하세요",
    connecting: "방에 연결 중...",
    drawWithMouse: "손가락이나 마우스로 그려 주세요",
    readyState: "준비됨!",
    drawingState: "그리는 중...",
    redraw: "다시 그리기",
    confirm: "확인",
    tooShortHint: "조금 더 그린 뒤 확인해 주세요.",
    roomLabel: "방:",
    roomTitle: "Love Sync Score(방)",
    scoreDetail: "크기와 위치는 무시하고 모양의 유사도로 점수를 매깁니다.",
    resultMessage: (score: number) => {
      if (score >= 92) return "운명의 커플! 거의 완벽하게 동기화됐어요";
      if (score >= 80) return "운명의 커플! 관계가 더 깊어지고 있어요";
      if (score >= 65) return "더 많은 사랑을 나눠요";
      if (score >= 45) return "한 걸음 더. 점점 가까워지고 있어요";
      if (score >= 25) return "막 시작했어요. 조금 더 마법을 넣어 보세요";
      return "동기화 실험 시작! 오늘도 사랑을 듬뿍 그려요";
    },
    scoreMessage: (score: number) => {
      if (score >= 95) return "진짜 소울메이트! 💖 두 마음이 하나예요.";
      if (score >= 85) return "완벽한 매치! ✨ 거의 똑같이 동기화됐어요.";
      if (score >= 70) return "운명의 커플! 💕 깊은 연결이 느껴져요.";
      if (score >= 50) return "아주 좋은 조화! 🌸 아름답게 맞아요.";
      if (score >= 30) return "따뜻한 연결 💝 좋은 시작이에요.";
      return "동기화 실험 시작! 🍬 더 많은 사랑으로 그려 보세요.";
    },
    scoreNote: "두 분은 전설입니다!",
    scoreNoteLow: "100점을 받는 것은 의도적으로 조금 어렵게 되어 있습니다.",
    compareHint: "이 시간을 신호로 삼아 같은 느낌으로 그려 주세요.",
    envVarNote:
      "필요한 `NEXT_PUBLIC_SUPABASE_*` 환경 변수를 설정하고 개발 서버를 다시 시작해 주세요.",
    player1Only: "확인할 수 없습니다: 당신은 1번째 플레이어가 아닙니다.",
    player2Only: "확인할 수 없습니다: 당신은 2번째 플레이어가 아닙니다.",
    cannotCommitStatus: (status: string) => `확인할 수 없습니다: 현재 상태는 ${status} 입니다.`,
    resetRoomError: "방 초기화에 실패했습니다. 다시 시도해 주세요.",
    dateRoulette: {
      matchLabel: "MATCH",
      matchSupportLow: "오... 꽤 드라마틱한데요?",
      matchSupportMid: "재밌는 결과가 나올 것 같아요.",
      matchSupportHigh: "와... 두 사람 케미가 정말 좋네요.",
      suspenseLabel: "다음은",
      decidesNextDate: "다음 데이트는 이걸로 결정됩니다…",
      fateIs: "두 사람의 운명은…",
      rouletteLabel: "데이트 룰렛",
      spinning: "룰렛 회전 중…",
      resultReady: "결과가 정해졌어요.",
      yourDateChallenge: "YOUR DATE CHALLENGE",
      reactionWindow: "잠깐, 서로의 리액션을 즐겨보세요 💞",
      rangeLabel: {
        "0-20": "점수 구간: 0-20%",
        "21-40": "점수 구간: 21-40%",
        "41-60": "점수 구간: 41-60%",
        "61-80": "점수 구간: 61-80%",
        "81-100": "점수 구간: 81-100%",
      },
      challenges: {
        silent_date: {
          title: "사일런트 데이트",
          description: "데이트 중에는 말하지 않기.",
        },
        three_dislikes: {
          title: "서로 아쉬운 점 3가지",
          description: "서로에게 아쉬운 점 3가지를 솔직하게 말하기.",
        },
        five_loves: {
          title: "좋아하는 점 5가지",
          description: "상대의 좋은 점 5가지를 말해주기.",
        },
        phone_swap: {
          title: "폰 바꿔 쓰기",
          description: "데이트 중 서로의 폰을 바꿔서 사용하기.",
        },
        talk_about_exes: {
          title: "전 애인 이야기",
          description: "전 애인에 대해 솔직하게 대화하기.",
        },
        first_date_roleplay: {
          title: "첫 만남 롤플레이",
          description: "처음 만난 사이인 것처럼 데이트하기.",
        },
        formal_language_only: {
          title: "존댓말 데이트",
          description: "데이트 내내 서로 존댓말만 사용하기.",
        },
        compliment_challenge: {
          title: "칭찬 챌린지",
          description: "서로를 계속 칭찬하면서 데이트하기.",
        },
        recreate_ideal_date: {
          title: "이상형 데이트 재현",
          description: "상대가 꿈꾸는 데이트를 재현해보기.",
        },
        no_holding_hands: {
          title: "손잡기 금지",
          description: "데이트 중 손잡기 금지.",
        },
        dream_date_pitch: {
          title: "드림 데이트 발표",
          description: "각자 꿈의 데이트를 발표하고, 승자가 장소를 정하기.",
        },
        budget_date: {
          title: "예산 데이트",
          description: "정해진 예산 안에서 데이트하기.",
        },
        surprise_challenge: {
          title: "즉흥 서프라이즈",
          description: "그 자리에서 서로를 위한 서프라이즈를 준비하기.",
        },
        make_partner_happy: {
          title: "한 시간 행복 미션",
          description: "한 시간 안에 상대를 최대한 행복하게 만들기.",
        },
        make_them_laugh: {
          title: "웃음 유발 챌린지",
          description: "데이트 중 상대를 많이 웃게 만들기.",
        },
        buy_matching_items: {
          title: "커플 아이템 사기",
          description: "서로 맞춰 쓸 아이템을 사기.",
        },
        staring_contest: {
          title: "눈싸움",
          description: "먼저 시선을 피하는 사람이 지기.",
        },
        pick_for_partner: {
          title: "서로 어울리는 것 고르기",
          description: "상대에게 어울릴 것 같은 걸 골라 교환하기.",
        },
        love_you_game: {
          title: "\"사랑해\" 게임",
          description: "번갈아 \"사랑해\" 말하기. 웃거나 시선 피하면 패배.",
        },
        butler_princess_date: {
          title: "집사 & 공주 데이트",
          description: "한 명은 집사, 한 명은 공주 역할로 데이트하기.",
        },
        honest_relationship_talk: {
          title: "진심 대화",
          description: "평소 잘 말하지 않던 주제로 솔직하게 이야기하기.",
        },
        grant_partner_wishes: {
          title: "소원 들어주기 데이",
          description: "하루 동안 상대의 소원을 최대한 들어주기.",
        },
        fancy_date: {
          title: "스페셜 데이트",
          description: "조금 더 특별하고 분위기 있는 데이트 즐기기.",
        },
        love_letter_exchange: {
          title: "러브레터 교환",
          description: "서로에게 편지를 써서 읽어주기.",
        },
        partner_first_day: {
          title: "상대 우선 데이",
          description: "하루 동안 상대를 최우선으로 두고 방해 요소를 줄이기.",
        },
      },
    },
  },
} as const;
