import React from 'react'

const Loading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading">{message}</div>
)

export default Loading
