
export interface Build {
    id: string;
    createdAt: number;
    name: string;
    position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
    archetype: 'Sharpshooter' | 'Slasher' | 'Playmaker' | 'Defender' | 'Rebounder';
    attributes: Attributes;
    points: number;
    bankedPoints: number;
    monthlyPointsEarned: number;
    gamesPlayedThisMonth: number;
}

export type BuildDraft = Omit<Build, 'id' | 'createdAt'>;

export interface Attributes {
    dunking: number
  speed: number
  ballHandling: number
  shooting3PT: number
  midRange: number
  layup: number
  passAccuracy: number
  perimeterD: number
  interiorD: number
  rebounding: number
  strength: number
  stamina: number


}

export interface GameLog {
    id: string;
    date:string;
    pointsEarned: number;
    assists: number;
    rebounds: number;
    steals: number;
    blocks: number;
    turnovers: number;
    minutesPlayed: number;
    win: boolean;
    fgPercentage: number;
}