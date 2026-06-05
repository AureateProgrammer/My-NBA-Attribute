import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

const Login: React.FC = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page container">
      <h1>Login</h1>
      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <ErrorMessage error={error} />
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      {loading && <Loading />}
    </main>
  )
}

export default Login
