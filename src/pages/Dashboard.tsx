import type { Build, GameLog } from '../types/build'
import { useState } from 'react'
import { calculateGamePoints, getUpgradeCost, MONTHLY_XP_CAP } from '../utils/pointCalculator'

interface DashboardProps {
  build: Build
  layoutMode: 'classic' | 'coach' | 'focus'
  availableBuilds: Build[]
  onUpdate: (updatedBuild: Build) => void
  onOpenSetup: () => void
  onOpenLogGame: () => void
  onSwitchBuild: (buildId: string) => void
}

const loadGameLogs = (buildId: string) => {
  const saved = localStorage.getItem(`progression_gamelogs_${buildId}`)
  return saved ? (JSON.parse(saved) as GameLog[]) : []
}

const Dashboard = ({ layoutMode, build, availableBuilds, onUpdate, onOpenSetup, onOpenLogGame, onSwitchBuild }: DashboardProps) => {
  const gameLogs = useState<GameLog[]>(() => loadGameLogs(build.id))[0]

  const handleSpendPoint = (attribute: keyof Build['attributes']) => {
    const currentValue = build.attributes[attribute]
    if (currentValue >= 99) return

    const upgradeCost = getUpgradeCost(currentValue)
    if (build.bankedPoints < upgradeCost) return alert(`Not enough XP. Need ${upgradeCost} XP.`)

    const updatedBuild: Build = {
      ...build,
      bankedPoints: build.bankedPoints - upgradeCost,
      attributes: {
        ...build.attributes,
        [attribute]: currentValue + 1,
      },
    }
    onUpdate(updatedBuild)
  }

  return (
    <div className={`dashboard layout-${layoutMode}`}>

      {/* Player Header */}
      <div className="player-header">
        <div className="player-info">
          <h1>{build.name}</h1>
          <div className="player-tags">
            <span className="tag">{build.position}</span>
            <span className="tag">{build.archetype}</span>
          </div>
        </div>
        <div className="header-actions">
          <select
            className="player-select"
            value={build.id}
            onChange={(e) => onSwitchBuild(e.target.value)}
          >
            {availableBuilds.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.position})
              </option>
            ))}
          </select>
          <button className="secondary-btn" onClick={onOpenSetup}>
            Setup
          </button>
          <button className="log-btn" onClick={onOpenLogGame}>
            + Log Game
          </button>
        </div>
      </div>

      {/* Points Bar */}
      <div className="points-bar">
        <div className="points-card">
          <p className="points-label">Banked XP</p>
          <h2>{build.bankedPoints}</h2>
        </div>
        <div className="points-card">
          <p className="points-label">Monthly XP</p>
          <h2>{build.monthlyPointsEarned} <span>/{MONTHLY_XP_CAP}</span></h2>
        </div>
        <div className="points-card">
          <p className="points-label">Games This Month</p>
          <h2>{build.gamesPlayedThisMonth}</h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">

        {/* Attributes */}
        <div className="attributes-card">
          <h3>Attributes</h3>
          <p className="points-available">
            {build.bankedPoints} XP available to spend
          </p>
          {(Object.keys(build.attributes) as Array<keyof Build['attributes']>).map((attr) => {
            const currentValue = build.attributes[attr]
            const upgradeCost = getUpgradeCost(currentValue)
            const canUpgrade = currentValue < 99 && build.bankedPoints >= upgradeCost

            return (
              <div className="attribute-row" key={attr}>
                <span className="attr-name">{attr}</span>
                <div className="attr-bar-wrap">
                  <div
                    className="attr-bar"
                    style={{ width: `${currentValue}%` }}
                  />
                </div>
                <span className="attr-value">{currentValue}</span>
                <span className="attr-cost">{currentValue >= 99 ? 'MAX' : `${upgradeCost} XP`}</span>
                <button
                  className="upgrade-btn"
                  onClick={() => handleSpendPoint(attr)}
                  disabled={!canUpgrade}
                  title={currentValue >= 99 ? 'Attribute is maxed out' : `Upgrade cost: ${upgradeCost} XP`}
                >
                  +
                </button>
              </div>
            )
          })}
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
                <span className="game-log-points">+{pts} XP</span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Dashboard