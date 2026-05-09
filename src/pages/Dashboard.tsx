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


