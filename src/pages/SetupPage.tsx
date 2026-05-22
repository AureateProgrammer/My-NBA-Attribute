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

  const MIN_ATTRIBUTE = 25
  const MAX_ATTRIBUTE = 99

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
  const [attributeInputs, setAttributeInputs] = useState<Record<keyof Attributes, string>>(
    Object.fromEntries(
      (Object.keys(defaultAttributes) as Array<keyof Attributes>).map((key) => [key, String(defaultAttributes[key])])
    ) as Record<keyof Attributes, string>
  )
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null)
  const attributeEntries = Object.entries(attributes) as Array<[keyof Attributes, number]>
  const attributeTotal = attributeEntries.reduce((sum, [, value]) => sum + value, 0)
  const attributeAverage = attributeTotal / attributeEntries.length
  const highlightedAttributes = [...attributeEntries]
    .sort(([, left], [, right]) => right - left)
    .slice(0, 3)

  const resetForm = () => {
    setName('')
    setPosition('PG')
    setArchetype('Sharpshooter')
    setAttributes(defaultAttributes)
    setAttributeInputs(
      Object.fromEntries(
        (Object.keys(defaultAttributes) as Array<keyof Attributes>).map((key) => [key, String(defaultAttributes[key])])
      ) as Record<keyof Attributes, string>
    )
    setEditingBuildId(null)
  }

  const startEditing = (build: Build) => {
    setEditingBuildId(build.id)
    setName(build.name)
    setPosition(build.position)
    setArchetype(build.archetype)
    setAttributes(build.attributes)
    setAttributeInputs(
      Object.fromEntries(
        (Object.keys(build.attributes) as Array<keyof Attributes>).map((key) => [key, String(build.attributes[key])])
      ) as Record<keyof Attributes, string>
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clampAttribute = (value: number) => Math.max(MIN_ATTRIBUTE, Math.min(MAX_ATTRIBUTE, value))

  const updateAttribute = (key: keyof Attributes, value: number) => {
    const clamped = Number.isNaN(value) ? MIN_ATTRIBUTE : clampAttribute(value)
    setAttributes((prev) => ({
      ...prev,
      [key]: clamped,
    }))
    setAttributeInputs((prev) => ({
      ...prev,
      [key]: String(clamped),
    }))
  }

  const handleAttributeInput = (key: keyof Attributes, rawValue: string) => {
    setAttributeInputs((prev) => ({
      ...prev,
      [key]: rawValue,
    }))

    const parsed = Number(rawValue)
    if (!Number.isNaN(parsed)) {
      setAttributes((prev) => ({
        ...prev,
        [key]: parsed,
      }))
    }
  }

  const normalizeAttributes = (values: Attributes): Attributes => {
    const normalized = {} as Attributes
    ;(Object.keys(values) as Array<keyof Attributes>).forEach((key) => {
      normalized[key] = clampAttribute(values[key])
    })
    return normalized
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a name for your player.');
      return;
    }

    const normalizedAttributes = normalizeAttributes(attributes)
    setAttributes(normalizedAttributes)
    setAttributeInputs(
      Object.fromEntries(
        (Object.keys(normalizedAttributes) as Array<keyof Attributes>).map((key) => [key, String(normalizedAttributes[key])])
      ) as Record<keyof Attributes, string>
    )

    const newBuild: BuildDraft = {
      name,
      position,
      archetype,
      attributes: normalizedAttributes,
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
      <div className="setup-ambient" aria-hidden="true">
        <span className="ambient-orb orb-1" />
        <span className="ambient-orb orb-2" />
        <span className="ambient-grid" />
      </div>

      <section className="setup-hero">
        <div className="setup-copy">
          <span className="setup-kicker">Build lab</span>
          <h1>{editingBuildId ? 'Edit Your Build' : 'Create Your Build'}</h1>
          <p>
            {editingBuildId
              ? 'Update this player before syncing with MyLEAGUE.'
              : 'Create your player build to track your MyLEAGUE progress. You can edit or create multiple builds to simulate different player types and compare their growth over time.'}
          </p>

          <div className="setup-metrics" aria-label="Current build summary">
            <div className="setup-metric">
              <strong>{existingBuilds.length}</strong>
              <span>Saved builds</span>
            </div>
            <div className="setup-metric">
              <strong>{Math.round(attributeAverage)}</strong>
              <span>Attribute avg</span>
            </div>
            <div className="setup-metric">
              <strong>{attributeTotal}</strong>
              <span>Total rating</span>
            </div>
          </div>
        </div>

        <div className="setup-preview" aria-label="Live build preview">
          <div className="setup-preview-top">
            <span>Live build pulse</span>
            <span>{layoutMode}</span>
          </div>
          <strong>{name.trim() || 'Untitled prospect'}</strong>
          <p>
            {position} • {archetype}
          </p>
          <div className="setup-preview-rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="setup-preview-list">
            {highlightedAttributes.map(([attrKey, value]) => (
              <div className="setup-preview-row" key={attrKey}>
                <span>{attributeLabels[attrKey]}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  min={MIN_ATTRIBUTE}
                  max={MAX_ATTRIBUTE}
                  value={attributeInputs[attrKey]}
                  onChange={(e) => handleAttributeInput(attrKey, e.target.value)}
                  onBlur={() => updateAttribute(attrKey, Number(attributeInputs[attrKey]))}
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