'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)

      const response = await fetch(`${backendUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Incorrect username or password')
      }

      const data = await response.json()
      const payload = JSON.parse(atob(data.access_token.split('.')[1]))

      localStorage.setItem('mos-token', data.access_token)
      localStorage.setItem('mos-role', payload.role)

      router.push('/admin')
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setError(`Connection timeout. Backend at ${backendUrl} is not responding.`)
      } else {
        setError(err.message || 'Authentication error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col justify-between p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
        <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
          <span>←</span>
          <span>Back to Food Hub Directory</span>
        </Link>
      </div>

      <div className="w-full max-w-sm mx-auto my-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
            <p className="mt-1 text-xs text-slate-500">Mall of Sargodha Food Hub</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <p className="font-semibold">Authentication failed</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Authorized Outlet & Mall Operations Only
            </span>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} Mall of Sargodha Food Hub
      </div>
    </main>
  )
}
