import{useState} from 'react';
import type {Build, Attributes} from '../types/build';

interface SetupPageProps {
    onComplete: (build: Build) => void;
}

const defaultAttributes: Attributes = {
    dunking : 25,
    speed : 25,
    ballHandling : 25,
    shooting3PT : 25,
    midRange : 25,
    layup : 25,
    passAccuracy : 25,
    perimeterD : 25,
    interiorD : 25,
    rebounding : 25,
    strength : 25,
    stamina : 25
};

const SetupPage = ({ onComplete }: SetupPageProps) => {
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Build['position']>('PG')
  const [archetype, setArchetype] = useState<Build['archetype']>('Sharpshooter')