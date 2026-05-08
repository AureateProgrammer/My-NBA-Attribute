import type { Attributes } from "react";

export interface Build {
    name: string;
    position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
    archtype: 'Sharpshooter' | 'Slasher' | 'Playmaker' | 'Defender' | 'Rebounder';
    attributes: Attributes;
    points: number;
    bankedPoints: number;
    monthlyPointsEarned: number;
    gamesPlayedThisMonth: number;
}

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