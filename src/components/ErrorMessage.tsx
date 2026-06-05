import React from 'react'

const ErrorMessage: React.FC<{ error?: any }> = ({ error }) => {
  if (!error) return null
  const msg = typeof error === 'string' ? error : error?.message || 'An error occurred'
  return <div className="error">{msg}</div>
}

export default ErrorMessage
