'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // ✅ Environment variable se backend URL lo, hostname-detection ki zaroorat nahi
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // Render free tier cold start ke liye 15s

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
        setError(`Connection Timeout. Backend at ${backendUrl} is not responding.`)
      } else {
        setError(`${err.message} (Target: ${backendUrl})`)
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#08121e] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,186,75,0.15),rgba(255,255,255,0))] p-4 text-[#e6edf8] overflow-hidden">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f5ba4b]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-[420px] rounded-[36px] border border-[#1e2e40] bg-[#0f1d2c]/90 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-300">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5ba4b] text-3xl shadow-[0_0_30px_rgba(245,186,75,0.25)] border border-[#ffdb8b]/30">
            👑
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">MOS Admin</h1>
          <p className="mt-1.5 text-xs text-[#9fb0c0] font-medium">Mall Directory Workspace Portal</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#1e2e40] bg-[#08121e]/80 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-[#8a9db0] tracking-tight">API: {backendUrl}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 animate-in fade-in duration-200">
            <span className="text-base mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-red-200">Connection Error</p>
              <p className="mt-0.5 text-[#f87171]/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full rounded-2xl border bg-[#08121e] px-4 py-3.5 text-sm text-[#eaf3ff] outline-none transition-all duration-200 ${error
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-[#1e2e40] focus:border-[#f5ba4b] focus:ring-2 focus:ring-[#f5ba4b]/20'
                }`}
              placeholder="e.g. admin"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b]">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl border bg-[#08121e] pl-4 pr-12 py-3.5 text-sm text-[#eaf3ff] outline-none transition-all duration-200 ${error
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-[#1e2e40] focus:border-[#f5ba4b] focus:ring-2 focus:ring-[#f5ba4b]/20'
                  }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8a9db0] hover:text-[#f5ba4b] focus:outline-none transition-colors"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#f5ba4b] py-4 text-xs font-bold uppercase tracking-wider text-[#121110] transition-all duration-200 hover:bg-[#f6c360] hover:shadow-[0_0_25px_rgba(245,186,75,0.35)] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#f5ba4b]/15 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-[#121110] border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              'Sign In To Dashboard →'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] font-medium text-[#5b6e82]">
          MOS Food Hub • Secure Workspace
        </p>
      </div>
    </main>
  )
}
