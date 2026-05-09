import{useState} from 'react';
import type {Build, BuildDraft, Attributes} from '../types/build';

interface SetupPageProps {
  layoutMode: 'classic' | 'coach' | 'focus';
  onCreate: (build: BuildDraft) => void;
  onUpdateExisting: (buildId: string, build: BuildDraft) => void;
  existingBuilds: Build[];
  onLoadBuild: (buildId: string) => void;
  onDeleteBuild: (buildId: string) => void;
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

const attributeLabels: Record<keyof Attributes, string> = {
  dunking: 'Dunking',
  speed: 'Speed',
  ballHandling: 'Ball Handling',
  shooting3PT: '3PT Shooting',
  midRange: 'Mid Range',
  layup: 'Layup',
  passAccuracy: 'Pass Accuracy',
  perimeterD: 'Perimeter D',
  interiorD: 'Interior D',
  rebounding: 'Rebounding',
  strength: 'Strength',
  stamina: 'Stamina'
}

const SetupPage = ({ layoutMode, onCreate, onUpdateExisting, existingBuilds, onLoadBuild, onDeleteBuild }: SetupPageProps) => {
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Build['position']>('PG')
  const [archetype, setArchetype] = useState<Build['archetype']>('Sharpshooter')
  const [attributes, setAttributes] = useState<Attributes>(defaultAttributes)
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setPosition('PG')
    setArchetype('Sharpshooter')
    setAttributes(defaultAttributes)
    setEditingBuildId(null)
  }

  const startEditing = (build: Build) => {
    setEditingBuildId(build.id)
    setName(build.name)
    setPosition(build.position)
    setArchetype(build.archetype)
    setAttributes(build.attributes)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateAttribute = (key: keyof Attributes, value: number) => {
    const clamped = Number.isNaN(value) ? 0 : Math.max(25, Math.min(99, value))
    setAttributes((prev) => ({
      ...prev,
      [key]: clamped,
    }))
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a name for your player.');
      return;
    }

    const newBuild: BuildDraft = {
      name,
      position,
      archetype,
      attributes,
      points: 0,
      bankedPoints: 0,
      monthlyPointsEarned: 0,
      gamesPlayedThisMonth: 0
    };

    if (editingBuildId) {
      onUpdateExisting(editingBuildId, newBuild)
    } else {
      onCreate(newBuild)
    }

    resetForm()
  };

  return (
    <div className={`setup-page layout-${layoutMode}`}>
      <h1>{editingBuildId ? 'Edit Your Build' : 'Create Your Build'}</h1>
      <p>
        {editingBuildId
          ? 'Update this player before syncing with MyLEAGUE.'
          : 'Set up your player to get started'}
      </p>

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

        <div className="attributes-editor">
          <label>Starting Attributes (25-99)</label>
          <div className="attributes-grid">
            {(Object.keys(attributes) as Array<keyof Attributes>).map((attrKey) => (
              <div className="attribute-input" key={attrKey}>
                <span>{attributeLabels[attrKey]}</span>
                <input
                  type="number"
                  min={25}
                  max={99}
                  value={attributes[attrKey]}
                  onChange={(e) => updateAttribute(attrKey, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="setup-actions">
          {editingBuildId && (
            <button className="secondary-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
          <button className="submit-btn" onClick={handleSubmit}>
            {editingBuildId ? 'Save Changes →' : 'Create Build →'}
          </button>
        </div>
      </div>

      {existingBuilds.length > 0 && (
        <div className="save-slots">
          <h2>Saved Players</h2>
          <div className="save-list">
            {existingBuilds.map((build) => (
              <div className="save-item" key={build.id}>
                <div>
                  <h3>{build.name}</h3>
                  <p>
                    {build.position} • {build.archetype} • {build.bankedPoints} pts banked
                  </p>
                </div>
                <div className="save-actions">
                  <button onClick={() => onLoadBuild(build.id)}>Open</button>
                  <button className="edit-btn" onClick={() => startEditing(build)}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => {
                      if (confirm(`Delete ${build.name}? This cannot be undone.`)) {
                        onDeleteBuild(build.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupPage;