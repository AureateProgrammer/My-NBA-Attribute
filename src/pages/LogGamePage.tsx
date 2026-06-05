import { useState } from 'react'
import type { Build, GameLog } from '../types/build'
import { calculateGamePoints, applyBankedCap, applyMonthlyCap, MONTHLY_XP_CAP } from '../utils/pointCalculator'

interface LogGamePageProps {
  build: Build
  layoutMode: 'classic' | 'coach' | 'focus'
  availableBuilds: Build[]
  onUpdate: (updatedBuild: Build) => void
  onBack: () => void
  onOpenSetup: () => void
  onSwitchBuild: (buildId: string) => void
}

const loadSavedLogs = (buildId: string) => {
  const saved = localStorage.getItem(`progression_gamelogs_${buildId}`)
  return saved ? (JSON.parse(saved) as GameLog[]) : []
}

const LogGamePage = ({ build, layoutMode, availableBuilds, onUpdate, onBack, onOpenSetup, onSwitchBuild }: LogGamePageProps) => {
  const [gameLogs, setGameLogs] = useState<GameLog[]>(() => loadSavedLogs(build.id))
  const [form, setForm] = useState({
    pointsEarned: 0,
    assists: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    minutesPlayed: 0,
    fgPercentage: 0,
    win: false,
  })

  const previewLog: GameLog = {
    id: 'preview',
    date: 'Preview',
    ...form,
  }

  const previewPoints = calculateGamePoints(previewLog, build.gamesPlayedThisMonth)

  const handleSubmit = () => {
    const newLog: GameLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      ...form,
    }

    const pointsEarned = calculateGamePoints(newLog, build.gamesPlayedThisMonth)
    const newMonthly = applyMonthlyCap(build.monthlyPointsEarned, pointsEarned)
    const newBanked = applyBankedCap(build.bankedPoints + pointsEarned)

    const updatedBuild: Build = {
      ...build,
      bankedPoints: newBanked,
      monthlyPointsEarned: newMonthly,
      gamesPlayedThisMonth: build.gamesPlayedThisMonth + 1,
    }

    const updatedLogs = [newLog, ...gameLogs]
    localStorage.setItem(`progression_gamelogs_${build.id}`, JSON.stringify(updatedLogs))
    setGameLogs(updatedLogs)
    onUpdate(updatedBuild)
    onBack()
    setForm({
      pointsEarned: 0,
      assists: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      minutesPlayed: 0,
      fgPercentage: 0,
      win: false,
    })
  }

  const updateField = (field: keyof typeof form, value: number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className={`log-game-page layout-${layoutMode}`}>
      <div className="log-game-topbar">
        <div>
          <span className="log-game-kicker">Log game</span>
          <h1>{build.name}</h1>
        </div>
        <div className="log-game-actions">
          <select className="player-select" value={build.id} onChange={(e) => onSwitchBuild(e.target.value)}>
            {availableBuilds.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.position})
              </option>
            ))}
          </select>
          <button className="secondary-btn" onClick={onOpenSetup} type="button">
            Setup
          </button>
          <button className="secondary-btn" onClick={onBack} type="button">
            Back
          </button>
        </div>
      </div>

      <section className="log-game-stats">
        <div className="points-card">
          <p className="points-label">Banked XP</p>
          <h2>{build.bankedPoints}</h2>
        </div>
        <div className="points-card">
          <p className="points-label">Monthly XP</p>
          <h2>
            {build.monthlyPointsEarned} <span>/{MONTHLY_XP_CAP}</span>
          </h2>
        </div>
        <div className="points-card">
          <p className="points-label">Games This Month</p>
          <h2>{build.gamesPlayedThisMonth}</h2>
        </div>
        <div className="points-card points-card-accent">
          <p className="points-label">Current XP Preview</p>
          <h2>{previewPoints}</h2>
        </div>
      </section>

      <section className="log-game-grid">
        <div className="log-game-card log-game-card-form">
          <div className="log-game-header">
            <h3>Game Input</h3>
          </div>

          <div className="log-game-section">
            <h4>Scoring Line</h4>
            <div className="log-game-input-grid">
              {[
                { label: 'Points', key: 'pointsEarned' },
                { label: 'Assists', key: 'assists' },
                { label: 'Rebounds', key: 'rebounds' },
                { label: 'Steals', key: 'steals' },
              ].map(({ label, key }) => (
                <label className="log-input-group" key={key}>
                  <span>{label}</span>
                  <input
                    type="number"
                    value={form[key as keyof typeof form] as number}
                    onChange={(e) => updateField(key as keyof typeof form, Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="log-game-section">
            <h4>Impact</h4>
            <div className="log-game-input-grid">
              {[
                { label: 'Blocks', key: 'blocks' },
                { label: 'Turnovers', key: 'turnovers' },
                { label: 'Minutes', key: 'minutesPlayed' },
                { label: 'FG%', key: 'fgPercentage' },
              ].map(({ label, key }) => (
                <label className="log-input-group" key={key}>
                  <span>{label}</span>
                  <input
                    type="number"
                    value={form[key as keyof typeof form] as number}
                    onChange={(e) => updateField(key as keyof typeof form, Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="win-toggle log-game-win">
            <label>Result</label>
            <button
              className={form.win ? 'active' : ''}
              onClick={() => updateField('win', !form.win)}
              type="button"
            >
              {form.win ? '✅ Win' : '❌ Loss'}
            </button>
          </div>

          <div className="log-game-footer">
            <button className="submit-btn" onClick={handleSubmit} type="button">
              Save Game
            </button>
          </div>
        </div>

        <aside className="log-game-card log-game-card-summary">
          <h3>What This Records</h3>

          <div className="log-summary-list">
            <div>
              <span>Player</span>
              <strong>{build.name}</strong>
            </div>
            <div>
              <span>Position</span>
              <strong>{build.position}</strong>
            </div>
            <div>
              <span>Archetype</span>
              <strong>{build.archetype}</strong>
            </div>
            <div>
              <span>Recent Logs</span>
              <strong>{gameLogs.length}</strong>
            </div>
          </div>

          <div className="log-recent-list">
            <h4>Recent Games</h4>
            {gameLogs.length === 0 && <p className="no-games">No games logged yet. Start with the first entry.</p>}
            {gameLogs.slice(0, 4).map((log) => {
              const points = calculateGamePoints(log, build.gamesPlayedThisMonth)
              return (
                <div className="game-log-item" key={log.id}>
                  <div className="game-log-stats">
                    <span>{log.date}</span>
                    <span>
                      {log.pointsEarned}pts / {log.assists}ast / {log.rebounds}reb
                    </span>
                    <span className={log.win ? 'win' : 'loss'}>{log.win ? 'W' : 'L'}</span>
                  </div>
                  <span className="game-log-points">+{points} XP</span>
                </div>
              )
            })}
          </div>
        </aside>
      </section>
    </div>
  )
}

export default LogGamePage
