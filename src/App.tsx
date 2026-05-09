import { useState } from 'react'
import SetupPage from './pages/SetupPage';
import type { Build } from './types/build';
import './App.css'

function App() {
  
  const [build, setBuild] = useState<Build | null>(null);

  const handleSetupComplete = (newBuild: Build) => {
    setBuild(newBuild);
  };

  return (
    <>
      {!build ? (
        <SetupPage onComplete={handleSetupComplete} />
      ) : (
        <div>
          <h1>{build.name}</h1>
          <p>Position: {build.position}</p>
          <p>Archetype: {build.archetype}</p>
        </div>
      )}
    </>
  )
}

export default App
