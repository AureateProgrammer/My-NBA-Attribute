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

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a name for your player.');
      return;
    }

    const newBuild: Build = {
      name,
      position,
      archetype,
      attributes: defaultAttributes,
      points: 0,
      bankedPoints: 0,
      monthlyPointsEarned: 0,
      gamesPlayedThisMonth: 0
    };
    onComplete(newBuild);
  };

  return (
    <div className="setup-page">
      <h1>Create Your Build</h1>
      <p>Set up your player to get started</p>

      <div className="setup-form">
        {/* Player Name */}
        <div className="form-group">
          <label>Player Name</label>
          <input
            type="text"
            placeholder="Enter your player name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Position */}
        <div className="form-group">
          <label>Position</label>
          <div className="button-group">
            {(['PG', 'SG', 'SF', 'PF', 'C'] as Build['position'][]).map((pos) => (
              <button
                key={pos}
                className={position === pos ? 'active' : ''}
                onClick={() => setPosition(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Archetype */}
        <div className="form-group">
          <label>Archetype</label>
          <div className="button-group">
            {(['Sharpshooter', 'Slasher', 'Playmaker', 'Defender', 'Rebounder'] as Build['archetype'][]).map((arch) => (
              <button
                key={arch}
                className={archetype === arch ? 'active' : ''}
                onClick={() => setArchetype(arch)}
              >
                {arch}
              </button>
            ))}
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Create Build →
        </button>
      </div>
    </div>
  );
};

export default SetupPage;