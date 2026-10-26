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
    <main className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col justify-between p-4 sm:p-6 font-sans transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>←</span>
          <span>Back to Food Hub Directory</span>
        </Link>
      </div>

      <div className="w-full max-w-sm mx-auto my-auto">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Mall of Sargodha Food Hub</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-300">
              <p className="font-semibold">Authentication failed</p>
              <p className="mt-0.5 text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            {/* Dummy hidden fields to intercept aggressive browser password autofill */}
            <input
              type="text"
              name="prevent_autofill_user"
              value=""
              style={{ display: 'none' }}
              tabIndex={-1}
              readOnly
              aria-hidden="true"
            />
            <input
              type="password"
              name="prevent_autofill_pass"
              value=""
              style={{ display: 'none' }}
              tabIndex={-1}
              readOnly
              aria-hidden="true"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Username</label>
              <input
                type="text"
                name="admin_user_input"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_pass_input"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 dark:bg-amber-500 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
              Authorized Outlet & Mall Operations Only
            </span>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-400 dark:text-zinc-500">
        © {new Date().getFullYear()} Mall of Sargodha Food Hub
      </div>
    </main>
  )
}
