const API_BASE = import.meta.env.VITE_API_BASE || ''

let token: string | null = null

const setToken = (next: string | null) => {
  token = next
}

const request = async (path: string, opts: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'API error')
    ;(err as any).status = res.status
    ;(err as any).data = data
    throw err
  }

  return data
}

const get = (path: string) => request(path, { method: 'GET' })
const post = (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) })
const put = (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body) })
const del = (path: string) => request(path, { method: 'DELETE' })

export default { setToken, get, post, put, del }
