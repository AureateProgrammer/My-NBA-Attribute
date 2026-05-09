import type { GameLog } from "../types/build";

const MONTHLY_POINT_CAP = 50;
const MAX_BANKED = 100;
const DIMINISHING_RETURNS_THRESHOLD = 10;

export const calculateGamePoints = (game: GameLog, gamesPlayedThisMonth: number): number => {
  let points = 0;

  // Base points for stats
  points += game.pointsEarned * 0.1;
  points += game.assists * 0.4;
  points += game.rebounds * 0.2;
  points += game.steals * 0.6;
  points += game.blocks * 0.5;

  // Turnover penalty
  points -= game.turnovers * 0.5;

  // Minutes played bonus
  if (game.minutesPlayed >= 35) points += 0.5;
  if (game.minutesPlayed >= 40) points += 0.5;

  // FG percentage bonus/penalty
  if (game.fgPercentage >= 55) points += 1;
  if (game.fgPercentage >= 60) points += 0.5;
  if (game.fgPercentage < 35) points -= 1;

  // Win bonus
  if (game.win) points += 1;

  // Achievement bonuses
  if (game.pointsEarned >= 40) points += 2;
  if (game.pointsEarned >= 50) points += 3;
  if (game.steals + game.blocks >= 5) points += 2;

  // Triple double bonus
  const tripleDouble = [game.pointsEarned, game.assists, game.rebounds]
    .filter(stat => stat >= 10).length >= 2;
  if (tripleDouble) points += 2;

  // All around bonuses
  if (game.pointsEarned >= 20 && game.assists >= 7 && game.rebounds >= 7) points += 4;
  else if (game.pointsEarned >= 20 && game.assists >= 5 && game.rebounds >= 5) points += 3;
  else if (game.pointsEarned >= 15 && game.assists >= 5 && game.rebounds >= 5) points += 2;

  if (game.pointsEarned >= 10 && game.assists >= 3 && game.rebounds >= 3) points += 1;

  // Diminishing returns after 10 games
  if (gamesPlayedThisMonth >= DIMINISHING_RETURNS_THRESHOLD) {
    points = points / 2;
  }

  // Ensure points don't go negative
  points = Math.max(points, 0);

  return Math.round(points * 10) / 10;
};

export const applyMonthlyCap = (currentMonthly: number, earned: number): number => {
  return Math.min(currentMonthly + earned, MONTHLY_POINT_CAP);
};

export const applyBankedCap = (banked: number): number => {
  return Math.min(banked, MAX_BANKED);
};