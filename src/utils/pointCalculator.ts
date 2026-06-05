import type { GameLog } from "../types/build";

export const MONTHLY_XP_CAP = 1200;
export const MAX_BANKED_XP = 5000;
const DIMINISHING_RETURNS_THRESHOLD = 14;
const MAX_ATTRIBUTE = 99;

export const calculateGamePoints = (game: GameLog, gamesPlayedThisMonth: number): number => {
  let points = 0;

  // Base XP from box score output
  points += game.pointsEarned * 2;
  points += game.assists * 4;
  points += game.rebounds * 3;
  points += game.steals * 6;
  points += game.blocks * 5;

  // Turnover penalty
  points -= game.turnovers * 3;

  // Minutes played bonus
  if (game.minutesPlayed >= 24) points += 8;
  if (game.minutesPlayed >= 32) points += 10;
  if (game.minutesPlayed >= 38) points += 10;

  // FG percentage bonus/penalty
  if (game.fgPercentage >= 50) points += 8;
  if (game.fgPercentage >= 60) points += 10;
  if (game.fgPercentage < 35) points -= 12;

  // Win bonus
  if (game.win) points += 15;

  // Achievement bonuses
  if (game.pointsEarned >= 30) points += 12;
  if (game.pointsEarned >= 40) points += 18;
  if (game.pointsEarned >= 50) points += 25;
  if (game.steals + game.blocks >= 5) points += 12;

  // Triple-double bonus
  const tripleDouble = [game.pointsEarned, game.assists, game.rebounds]
    .filter(stat => stat >= 10).length >= 2;
  if (tripleDouble) points += 20;

  // All-around bonuses
  if (game.pointsEarned >= 20 && game.assists >= 7 && game.rebounds >= 7) points += 26;
  else if (game.pointsEarned >= 20 && game.assists >= 5 && game.rebounds >= 5) points += 18;
  else if (game.pointsEarned >= 15 && game.assists >= 5 && game.rebounds >= 5) points += 12;

  if (game.pointsEarned >= 10 && game.assists >= 3 && game.rebounds >= 3) points += 8;

  // Diminishing returns after repeated games in the same month
  if (gamesPlayedThisMonth >= DIMINISHING_RETURNS_THRESHOLD) {
    points = Math.round(points * 0.75);
  }

  // Ensure XP does not go negative
  points = Math.max(points, 0);

  return Math.round(points);
};

export const applyMonthlyCap = (currentMonthly: number, earned: number): number => {
  return Math.min(currentMonthly + earned, MONTHLY_XP_CAP);
};

export const applyBankedCap = (banked: number): number => {
  return Math.min(banked, MAX_BANKED_XP);
};

export const getUpgradeCost = (currentAttribute: number): number => {
  if (currentAttribute >= MAX_ATTRIBUTE) return Number.POSITIVE_INFINITY;
  if (currentAttribute >= 95) return 220;
  if (currentAttribute >= 90) return 170;
  if (currentAttribute >= 85) return 130;
  if (currentAttribute >= 75) return 90;
  if (currentAttribute >= 65) return 60;
  return 35;
};