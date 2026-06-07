import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import SetupPage from './pages/SetupPage'
import type { Build, BuildDraft, GameLog } from './types/build'
import './App.css'

import Dashboard from './pages/Dashboard'
import LogGamePage from './pages/LogGamePage.tsx'
import { AuthProvider } from './context/AuthContext'

const BUILDS_STORAGE_KEY = 'progression_builds_v2'
const ACTIVE_BUILD_STORAGE_KEY = 'progression_active_build_id'
const LEGACY_BUILD_STORAGE_KEY = 'progression_build'
const LEGACY_GAMELOG_STORAGE_KEY = 'progression_gamelogs'
const LAYOUT_STORAGE_KEY = 'progression_layout_mode'
const THEME_STORAGE_KEY = 'progression_theme_mode'

type LayoutMode = 'classic' | 'coach' | 'focus'
const LAYOUT_MODES: LayoutMode[] = ['classic', 'coach', 'focus']
type ThemeMode = 'mono' | 'forest' | 'sunset' | 'dark'
const THEME_MODES: ThemeMode[] = ['mono', 'forest', 'sunset', 'dark']

const isLayoutMode = (value: string | null): value is LayoutMode => {
  return value !== null && LAYOUT_MODES.includes(value as LayoutMode)
}

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value !== null && THEME_MODES.includes(value as ThemeMode)
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
      key={activeBuild.id}
      build={activeBuild}
      layoutMode={layoutMode}
      availableBuilds={builds}
      onUpdate={onUpdate}
      onOpenSetup={() => navigate('/setup')}
      onOpenLogGame={() => navigate(`/dashboard/${activeBuild.id}/log-game`)}
      onSwitchBuild={(nextBuildId) => {
        onSetActive(nextBuildId)
        navigate(`/dashboard/${nextBuildId}`)
      }}
    />
  )
}

interface LogGameRouteProps {
  builds: Build[]
  layoutMode: LayoutMode
  onUpdate: (updatedBuild: Build) => void
  onSetActive: (buildId: string) => void
}

const LogGameRoute = ({ builds, layoutMode, onUpdate, onSetActive }: LogGameRouteProps) => {
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
    <LogGamePage
      key={activeBuild.id}
      build={activeBuild}
      layoutMode={layoutMode}
      availableBuilds={builds}
      onUpdate={onUpdate}
      onBack={() => navigate(`/dashboard/${activeBuild.id}`)}
      onOpenSetup={() => navigate('/setup')}
      onSwitchBuild={(nextBuildId: string) => {
        onSetActive(nextBuildId)
        navigate(`/dashboard/${nextBuildId}/log-game`)
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'mono'
  })

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode)
  }, [layoutMode])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

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

  const handleUpdateExistingBuild = (buildId: string, draft: BuildDraft) => {
    const existingBuild = builds.find((build) => build.id === buildId)
    if (!existingBuild) return

    const updatedBuild: Build = {
      ...existingBuild,
      ...draft,
      attributes: draft.attributes,
    }

    const nextBuilds = builds.map((build) => (build.id === buildId ? updatedBuild : build))
    persistBuilds(nextBuilds)
    setActive(buildId)
    navigate(`/dashboard/${buildId}`)
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
    <AuthProvider>
      <div className={`app-shell layout-${layoutMode} theme-${themeMode}`}>
      <div className="style-lab-wrap">
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

        <div className="theme-lab" role="group" aria-label="Theme presets">
          <span>Theme</span>
          {THEME_MODES.map((mode) => (
            <button
              key={mode}
              className={themeMode === mode ? 'active' : ''}
              onClick={() => setThemeMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
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
              onCreate={handleSetupComplete}
              onUpdateExisting={handleUpdateExistingBuild}
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
        <Route
          path="/dashboard/:buildId/log-game"
          element={
            <LogGameRoute
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
    </AuthProvider>
  )
}

export default App