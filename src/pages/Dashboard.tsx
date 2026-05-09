import type { Build, GameLog } from '../types/build'
import { useState } from 'react'
import { calculateGamePoints, applyMonthlyCap, applyBankedCap } from '../utils/pointCalculator'

interface DashboardProps {
  build: Build
  onUpdate: (updatedBuild: Build) => void
}

const Dashboard = ({ build, onUpdate }: DashboardProps) => {
  const [gameLogs, setGameLogs] = useState<GameLog[]>(() => {
    const saved = localStorage.getItem('progression_gamelogs')
    return saved ? JSON.parse(saved) : []
  })

 const [showLogForm, setShowLogForm] = useState(false)

  // Game log form state
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

  const handleLogGame = () => {
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
    localStorage.setItem('progression_gamelogs', JSON.stringify(updatedLogs))
    setGameLogs(updatedLogs)
    onUpdate(updatedBuild)
    setShowLogForm(false)

    // reset form
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

  const handleSpendPoint = (attribute: keyof Build['attributes']) => {
    if (build.bankedPoints < 1) return alert('Not enough points!')

    const updatedBuild: Build = {
      ...build,
      bankedPoints: build.bankedPoints - 1,
      attributes: {
        ...build.attributes,
        [attribute]: build.attributes[attribute] + 1,
      },
    }
    onUpdate(updatedBuild)
  }

  return (
    <div className="dashboard">

      {/* Player Header */}
      <div className="player-header">
        <div className="player-info">
          <h1>{build.name}</h1>
          <div className="player-tags">
            <span className="tag">{build.position}</span>
            <span className="tag">{build.archetype}</span>
          </div>
        </div>
        <button className="log-btn" onClick={() => setShowLogForm(!showLogForm)}>
          {showLogForm ? 'Cancel' : '+ Log Game'}
        </button>
      </div>

      {/* Points Bar */}
      <div className="points-bar">
        <div className="points-card">
          <p className="points-label">Banked Points</p>
          <h2>{build.bankedPoints}</h2>
        </div>
        <div className="points-card">
          <p className="points-label">Monthly Points</p>
          <h2>{build.monthlyPointsEarned} <span>/50</span></h2>
        </div>
        <div className="points-card">
          <p className="points-label">Games This Month</p>
          <h2>{build.gamesPlayedThisMonth}</h2>
        </div>
      </div>

      {/* Log Game Form */}
      {showLogForm && (
        <div className="log-form">
          <h3>Log Game</h3>
          <div className="log-grid">
            {[
              { label: 'Points', key: 'pointsEarned' },
              { label: 'Assists', key: 'assists' },
              { label: 'Rebounds', key: 'rebounds' },
              { label: 'Steals', key: 'steals' },
              { label: 'Blocks', key: 'blocks' },
              { label: 'Turnovers', key: 'turnovers' },
              { label: 'Minutes', key: 'minutesPlayed' },
              { label: 'FG%', key: 'fgPercentage' },
            ].map(({ label, key }) => (
              <div className="log-input-group" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  value={form[key as keyof typeof form] as number}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <div className="win-toggle">
            <label>Win?</label>
            <button
              className={form.win ? 'active' : ''}
              onClick={() => setForm({ ...form, win: !form.win })}
            >
              {form.win ? '✅ Win' : '❌ Loss'}
            </button>
          </div>
          <button className="submit-btn" onClick={handleLogGame}>
            Submit Game
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">

        {/* Attributes */}
        <div className="attributes-card">
          <h3>Attributes</h3>
          <p className="points-available">
            {build.bankedPoints} points available to spend
          </p>
          {(Object.keys(build.attributes) as Array<keyof Build['attributes']>).map((attr) => (
            <div className="attribute-row" key={attr}>
              <span className="attr-name">{attr}</span>
              <div className="attr-bar-wrap">
                <div
                  className="attr-bar"
                  style={{ width: `${build.attributes[attr]}%` }}
                />
              </div>
              <span className="attr-value">{build.attributes[attr]}</span>
              <button
                className="upgrade-btn"
                onClick={() => handleSpendPoint(attr)}
                disabled={build.bankedPoints < 1}
              >
                +
              </button>
            </div>
          ))}
        </div>

        {/* Recent Games */}
        <div className="games-card">
          <h3>Recent Games</h3>
          {gameLogs.length === 0 && (
            <p className="no-games">No games logged yet. Log your first game!</p>
          )}
          {gameLogs.map((log) => {
            const pts = calculateGamePoints(log, build.gamesPlayedThisMonth)
            return (
              <div className="game-log-item" key={log.id}>
                <div className="game-log-stats">
                  <span>{log.date}</span>
                  <span>{log.pointsEarned}pts / {log.assists}ast / {log.rebounds}reb</span>
                  <span className={log.win ? 'win' : 'loss'}>{log.win ? 'W' : 'L'}</span>
                </div>
                <span className="game-log-points">+{pts} pts</span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Dashboard