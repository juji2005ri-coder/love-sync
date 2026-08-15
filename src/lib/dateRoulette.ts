export const scoreRangeChallenges = {
  "0-20": [
    "silent_date",
    "three_dislikes",
    "five_loves",
    "phone_swap",
    "talk_about_exes",
  ],
  "21-40": [
    "first_date_roleplay",
    "formal_language_only",
    "compliment_challenge",
    "recreate_ideal_date",
    "no_holding_hands",
  ],
  "41-60": [
    "dream_date_pitch",
    "budget_date",
    "surprise_challenge",
    "make_partner_happy",
    "make_them_laugh",
  ],
  "61-80": [
    "buy_matching_items",
    "staring_contest",
    "pick_for_partner",
    "love_you_game",
    "butler_princess_date",
  ],
  "81-100": [
    "honest_relationship_talk",
    "grant_partner_wishes",
    "fancy_date",
    "love_letter_exchange",
    "partner_first_day",
  ],
} as const;

export type ScoreRangeKey = keyof typeof scoreRangeChallenges;
export type DateChallengeId = (typeof scoreRangeChallenges)[ScoreRangeKey][number];

const scoreRanges: Array<{ key: ScoreRangeKey; min: number; max: number }> = [
  { key: "0-20", min: 0, max: 20 },
  { key: "21-40", min: 21, max: 40 },
  { key: "41-60", min: 41, max: 60 },
  { key: "61-80", min: 61, max: 80 },
  { key: "81-100", min: 81, max: 100 },
];

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export function getScoreRangeKey(score: number): ScoreRangeKey {
  const clamped = clampScore(score);
  const found = scoreRanges.find((range) => clamped >= range.min && clamped <= range.max);
  return found ? found.key : "81-100";
}

export function getChallengesForScore(score: number): readonly DateChallengeId[] {
  return scoreRangeChallenges[getScoreRangeKey(score)];
}

export function pickChallengeForScore(
  score: number,
  random = Math.random
): {
  rangeKey: ScoreRangeKey;
  challengeId: DateChallengeId;
  index: number;
} {
  const rangeKey = getScoreRangeKey(score);
  const challenges = scoreRangeChallenges[rangeKey];
  const index = Math.floor(Math.max(0, Math.min(0.999999, random())) * challenges.length);
  return {
    rangeKey,
    challengeId: challenges[index],
    index,
  };
}
