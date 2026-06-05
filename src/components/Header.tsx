import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="brand">ProGression</Link>
        <nav>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
