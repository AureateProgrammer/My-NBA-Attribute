import { useState } from 'react'
import SetupPage from './pages/SetupPage'
import type { Build } from './types/build'
import './App.css'

const STORAGE_KEY = 'progression_build'

function App() {
  const [build, setBuild] = useState<Build | null>(() => {
    // load from localStorage on first render
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })

  const handleSetupComplete = (newBuild: Build) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBuild))
    setBuild(newBuild)
  }

  const updateBuild = (updatedBuild: Build) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBuild))
    setBuild(updatedBuild)
  }

  return (
    <>
      {!build ? (
        <SetupPage onComplete={handleSetupComplete} />
      ) : (
        <div>
          <h1>{build.name}</h1>
          {/* Dashboard comes next */}
        </div>
      )}
    </>
  )
}

export default App