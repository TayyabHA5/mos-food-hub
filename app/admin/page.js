'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [restaurantList, setRestaurantList] = useState([])
  const [loading, setLoading] = useState(true)
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'
  const router = useRouter()

  useEffect(() => {
    // 1. Security Check: Only allow logged in admins
    const role = localStorage.getItem('mos-role')
    const token = localStorage.getItem('mos-token')

    if (!token || (role !== 'super_admin' && role !== 'admin')) {
      router.push('/admin/login')
      return
    }



    fetchRestaurants()
  }, [router])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${backendUrl}/restaurants/`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setRestaurantList(data)
    } catch (err) {
      console.error('Real-time sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/admin/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#08121e] flex flex-col items-center justify-center gap-3">
       <div className="h-10 w-10 border-4 border-[#f5ba4b] border-t-transparent rounded-full animate-spin" />
       <p className="font-bold text-xs uppercase tracking-widest text-[#f5ba4b] animate-pulse">CONNECTING TO DATABASE...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#08121e] text-[#e6edf8]">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[#1e2e40] bg-[#0b1722] p-6 text-[#e6edf8] md:flex md:flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f5ba4b]">MOS Food Hub</p>
              <h1 className="text-lg font-black tracking-tight text-white">Menu Manager</h1>
            </div>
          </div>

          <nav className="mt-10 space-y-2 text-xs font-bold uppercase tracking-wider">
            <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-[#f5ba4b] px-4 py-3 text-[#121110] shadow-lg shadow-[#f5ba4b]/10 transition-all">
              <span>📊</span>
              <span>Overview</span>
            </Link>
            <Link href="/admin/super" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[#9fb0c0] hover:bg-[#122334] hover:text-white transition-all">
              <span>🏪</span>
              <span>Directory Editor</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 text-left rounded-2xl px-4 py-3 text-[#9fb0c0] hover:bg-red-500/10 hover:text-red-400 transition-all">
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-[#1e2e40] text-[10px] leading-relaxed text-[#8a9db0]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider">Database Active</span>
            </div>
            Single Admin Workspace<br />
            <span className="font-mono text-[9px] text-[#5b6e82]">API: {backendUrl}</span>
          </div>
        </aside>

        {/* Content Area */}
        <section className="min-w-0 flex-1 p-6 sm:p-10">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1e2e40]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5ba4b]">Admin Workspace</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-white">Overview & Directory</h2>
              <p className="mt-1 text-xs text-[#9fb0c0]">Monitor live food court outlets and manage digital menu setups.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#1e2e40] bg-[#0f1d2c] px-4 py-2.5 text-xs font-bold text-[#e6edf8] hover:border-[#f5ba4b] hover:text-[#f5ba4b] transition-all shadow-md"
            >
              <span>View Public Menu</span>
              <span>↗</span>
            </Link>
          </header>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Outlets Registered', restaurantList.length, 'Live on directory', '🏪'],
              ['Menu Format', 'Digital', 'High-Res Menu Gallery', '📸'],
              ['System Status', 'Active', 'Database operational', '⚡'],
            ].map(([label, value, detail, icon]) => (
              <div key={label} className="rounded-3xl border border-[#1e2e40] bg-[#0f1d2c] p-5 shadow-xl transition-all hover:border-[#f5ba4b]/30">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f5ba4b]">{label}</p>
                  <span className="text-lg">{icon}</span>
                </div>
                <p className="mt-3 text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-[11px] font-medium text-[#8a9db0]">{detail}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-3xl border border-[#1e2e40] bg-[#0f1d2c] p-6 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#1e2e40]">
              <div>
                <h3 className="text-xl font-bold text-white">Live Outlets</h3>
                <p className="mt-1 text-xs text-[#8a9db0]">Active restaurants serving in Mall of Sargodha.</p>
              </div>
              <Link
                href="/admin/super"
                className="rounded-2xl bg-[#f5ba4b] px-4 py-2.5 text-xs font-bold text-[#121110] shadow-md hover:bg-[#f6c360] active:scale-95 transition-all"
              >
                + Add / Manage Outlets
              </Link>
            </div>

            <div className="divide-y divide-[#1e2e40]">
              {restaurantList.length === 0 ? (
                <p className="py-12 text-center text-xs italic text-[#8a9db0]">No restaurants found in database.</p>
              ) : (
                restaurantList.map((res) => (
                  <div key={res.id} className="flex items-center gap-4 py-4 hover:bg-[#122334]/50 px-2 rounded-2xl transition-colors">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#142637] border border-[#21354a] text-lg font-bold text-[#f5ba4b] overflow-hidden">
                      {res.logo_url ? (
                        <img src={`${backendUrl}${res.logo_url}`} alt={res.name} className="h-full w-full object-cover" />
                      ) : (
                        res.name[0]
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-white">{res.name}</p>
                      <p className="mt-0.5 text-xs text-[#8a9db0] font-semibold uppercase tracking-wider">{res.cuisine} • {res.floor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Live
                       </span>
                       <Link
                        href="/admin/super"
                        className="rounded-xl border border-[#21354a] bg-[#08121e] px-3.5 py-2 text-xs font-bold text-[#f5ba4b] hover:border-[#f5ba4b] transition-all"
                       >
                        Details
                       </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
