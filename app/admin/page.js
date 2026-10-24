'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [restaurantList, setRestaurantList] = useState([])
  const [loading, setLoading] = useState(true)
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'
  const router = useRouter()

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-black flex flex-col items-center justify-center gap-3 font-sans transition-colors duration-200">
        <div className="h-8 w-8 border-2 border-slate-900 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-xs text-slate-600 dark:text-amber-400">Connecting to database...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:flex md:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold text-sm">
              M
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">MOS Food Hub</p>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Admin Console</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-1 text-xs font-semibold">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 px-3.5 py-2.5 text-white dark:text-black font-bold transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Overview</span>
            </Link>
            <Link
              href="/admin/super"
              className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Directory Editor</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 text-left rounded-lg px-3.5 py-2.5 text-slate-600 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-zinc-800 text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span className="text-emerald-800 dark:text-emerald-400 font-semibold">Database Active</span>
            </div>
            Single Admin Workspace
          </div>
        </aside>

        {/* Content Area */}
        <section className="min-w-0 flex-1 p-6 sm:p-10">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Food Court Operations</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Directory Overview</h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-400">Monitor live food court outlets and digital menu setups.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-700 hover:text-slate-950 dark:hover:text-white transition-all shadow-subtle"
            >
              <span>View Public Hub</span>
              <span>↗</span>
            </Link>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Outlets Registered', restaurantList.length, 'Live on directory'],
              ['Menu Format', 'Digital Scans', 'High-res pages'],
              ['Database Status', 'Connected', 'Operational'],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-subtle">
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{detail}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-subtle">
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Outlets</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Active restaurants serving in Mall of Sargodha.</p>
              </div>
              <Link
                href="/admin/super"
                className="rounded-lg bg-slate-900 dark:bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-subtle font-bold"
              >
                + Add / Manage Outlets
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {restaurantList.length === 0 ? (
                <p className="py-8 text-center text-xs italic text-slate-500 dark:text-zinc-500">No restaurants found in database.</p>
              ) : (
                restaurantList.map((res) => (
                  <div key={res.id} className="flex items-center gap-4 py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-zinc-900/60 rounded-lg transition-colors">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-800 dark:text-amber-400 overflow-hidden">
                      {res.logo_url ? (
                        <img src={`${backendUrl}${res.logo_url}`} alt={res.name} className="h-full w-full object-cover" />
                      ) : (
                        res.name[0]
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{res.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{res.cuisine} · {res.floor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        Live
                      </span>
                      <Link
                        href="/admin/super"
                        className="rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-950 dark:hover:text-white transition-colors"
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
