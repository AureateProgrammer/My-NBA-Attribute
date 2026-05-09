import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import SetupPage from './pages/SetupPage'
import type { Build, BuildDraft, GameLog } from './types/build'
import './App.css'

import Dashboard from './pages/Dashboard'

const BUILDS_STORAGE_KEY = 'progression_builds_v2'
const ACTIVE_BUILD_STORAGE_KEY = 'progression_active_build_id'
const LEGACY_BUILD_STORAGE_KEY = 'progression_build'
const LEGACY_GAMELOG_STORAGE_KEY = 'progression_gamelogs'
const LAYOUT_STORAGE_KEY = 'progression_layout_mode'

type LayoutMode = 'classic' | 'coach' | 'focus'
const LAYOUT_MODES: LayoutMode[] = ['classic', 'coach', 'focus']

const isLayoutMode = (value: string | null): value is LayoutMode => {
  return value !== null && LAYOUT_MODES.includes(value as LayoutMode)
}

const parseJSON = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const createBuildId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `build_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const loadInitialState = (): { builds: Build[]; activeBuildId: string | null } => {
  let builds = parseJSON<Build[]>(localStorage.getItem(BUILDS_STORAGE_KEY), [])

  if (!Array.isArray(builds)) {
    builds = []
  }

  const legacyBuild = parseJSON<BuildDraft | null>(localStorage.getItem(LEGACY_BUILD_STORAGE_KEY), null)

  if (builds.length === 0 && legacyBuild) {
    const migratedBuild: Build = {
      ...legacyBuild,
      id: createBuildId(),
      createdAt: Date.now(),
    }
    builds = [migratedBuild]
    localStorage.setItem(BUILDS_STORAGE_KEY, JSON.stringify(builds))

    const legacyLogs = parseJSON<GameLog[]>(localStorage.getItem(LEGACY_GAMELOG_STORAGE_KEY), [])
    if (legacyLogs.length > 0) {
      localStorage.setItem(`progression_gamelogs_${migratedBuild.id}`, JSON.stringify(legacyLogs))
    }
  }

  const storedActiveBuildId = localStorage.getItem(ACTIVE_BUILD_STORAGE_KEY)
  const activeBuildId =
    storedActiveBuildId && builds.some((build) => build.id === storedActiveBuildId)
      ? storedActiveBuildId
      : builds[0]?.id ?? null

  if (activeBuildId) {
    localStorage.setItem(ACTIVE_BUILD_STORAGE_KEY, activeBuildId)
  }

  return { builds, activeBuildId }
}

interface DashboardRouteProps {
  builds: Build[]
  layoutMode: LayoutMode
  onUpdate: (updatedBuild: Build) => void
  onSetActive: (buildId: string) => void
}

const DashboardRoute = ({ builds, layoutMode, onUpdate, onSetActive }: DashboardRouteProps) => {
  const navigate = useNavigate()
  const { buildId } = useParams<{ buildId: string }>()

  const activeBuild = buildId ? builds.find((build) => build.id === buildId) : null

  useEffect(() => {
    if (activeBuild) {
      onSetActive(activeBuild.id)
    }
  }, [activeBuild, onSetActive])

  if (!activeBuild) {
    return <Navigate to="/setup" replace />
  }

  return (
    <Dashboard
      build={activeBuild}
      layoutMode={layoutMode}
      availableBuilds={builds}
      onUpdate={onUpdate}
      onOpenSetup={() => navigate('/setup')}
      onSwitchBuild={(nextBuildId) => {
        onSetActive(nextBuildId)
        navigate(`/dashboard/${nextBuildId}`)
      }}
    />
  )
}

function App() {
  const navigate = useNavigate()
  const [{ builds: initialBuilds, activeBuildId: initialActiveBuildId }] = useState(loadInitialState)

  const [builds, setBuilds] = useState<Build[]>(initialBuilds)
  const [activeBuildId, setActiveBuildId] = useState<string | null>(initialActiveBuildId)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY)
    return isLayoutMode(stored) ? stored : 'classic'
  })

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode)
  }, [layoutMode])

  const setActive = (buildId: string | null) => {
    setActiveBuildId(buildId)
    if (buildId) {
      localStorage.setItem(ACTIVE_BUILD_STORAGE_KEY, buildId)
    } else {
      localStorage.removeItem(ACTIVE_BUILD_STORAGE_KEY)
    }
  }

  const persistBuilds = (nextBuilds: Build[]) => {
    setBuilds(nextBuilds)
    localStorage.setItem(BUILDS_STORAGE_KEY, JSON.stringify(nextBuilds))
  }

  const handleSetupComplete = (draft: BuildDraft) => {
    const newBuild: Build = {
      ...draft,
      id: createBuildId(),
      createdAt: Date.now(),
    }

    const nextBuilds = [newBuild, ...builds]
    persistBuilds(nextBuilds)
    setActive(newBuild.id)
    navigate(`/dashboard/${newBuild.id}`)
  }

  const updateBuild = (updatedBuild: Build) => {
    const nextBuilds = builds.map((build) => (build.id === updatedBuild.id ? updatedBuild : build))
    persistBuilds(nextBuilds)
  }

  const handleLoadBuild = (buildId: string) => {
    setActive(buildId)
    navigate(`/dashboard/${buildId}`)
  }

  const handleDeleteBuild = (buildId: string) => {
    const nextBuilds = builds.filter((build) => build.id !== buildId)
    persistBuilds(nextBuilds)
    localStorage.removeItem(`progression_gamelogs_${buildId}`)

    if (activeBuildId === buildId) {
      const nextActiveId = nextBuilds[0]?.id ?? null
      setActive(nextActiveId)
      if (nextActiveId) {
        navigate(`/dashboard/${nextActiveId}`)
      } else {
        navigate('/setup')
      }
    }
  }

  return (
    <div className={`app-shell layout-${layoutMode}`}>
      <div className="layout-lab" role="group" aria-label="Layout presets">
        <span>Layout</span>
        {LAYOUT_MODES.map((mode) => (
          <button
            key={mode}
            className={layoutMode === mode ? 'active' : ''}
            onClick={() => setLayoutMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <Routes>
        <Route
          path="/"
          element={
            builds.length > 0
              ? <Navigate to={`/dashboard/${activeBuildId ?? builds[0].id}`} replace />
              : <Navigate to="/setup" replace />
          }
        />
        <Route
          path="/setup"
          element={
            <SetupPage
              layoutMode={layoutMode}
              onComplete={handleSetupComplete}
              existingBuilds={builds}
              onLoadBuild={handleLoadBuild}
              onDeleteBuild={handleDeleteBuild}
            />
          }
        />
        <Route
          path="/dashboard/:buildId"
          element={
            <DashboardRoute
              builds={builds}
              layoutMode={layoutMode}
              onUpdate={updateBuild}
              onSetActive={(buildId) => setActive(buildId)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App