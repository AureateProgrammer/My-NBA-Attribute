import type { GameLog } from "../types/build";

const MONTHLY_POINT_CAP = 50;
const MAX_BANKED = 100;
const DIMINISHING_RETURNS_THRESHOLD = 10;


export const calculateGamePoints = (game: GameLog, gamesPlayedThisMonth: number): number => {
  let points = 0;

  // Base points for stats
    points += game.pointsEarned * 0.1; // 1 point per point scored
    points += game.assists * 0.4; // 1.5 points per assist
    points += game.rebounds * 0.2; // 1.2 points per rebound
    points += game.steals * 0.6; // 3 points per steal
    points += game.blocks * 0.5; // 3 points per block


    // diminishing returns for points earned in a month
    points -= game.turnovers * -0.5; // -0.5 points per turnover