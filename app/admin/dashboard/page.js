'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'

export default function RestaurantAdminDashboard() {
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('alerts')
  const [tables, setTables] = useState(['1', '2', '3', '4', '5'])
  const [restaurantSlug, setRestaurantSlug] = useState('pizza-point')
  const router = useRouter()
  const qrRef = useRef(null)

  useEffect(() => {
    const role = localStorage.getItem('mos-role')
    if (role !== 'admin') {
      router.push('/admin/login')
    }

    // Mock Notification polling
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotif = {
          id: Date.now(),
          table: Math.floor(Math.random() * 20) + 1,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'pending',
        }
        setNotifications((prev) => [newNotif, ...prev].slice(0, 10))
        try {
          new Audio('/alert.mp3').play()
        } catch (e) {}
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [router])

  const dismissNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const downloadQR = (tableNum) => {
    const canvas = document.getElementById(`qr-table-${tableNum}`)
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR-Table-${tableNum}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <nav className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 shadow-subtle">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold text-xs">
              M
            </div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">Outlet Management Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              View Public Hub
            </Link>
            <button
              onClick={() => {
                localStorage.clear()
                router.push('/admin/login')
              }}
              className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl p-6 sm:p-8">
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 rounded-xl border p-4 text-left transition-colors ${
              activeTab === 'alerts'
                ? 'border-slate-900 dark:border-amber-400 bg-white dark:bg-zinc-900 shadow-subtle'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-white dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-amber-400">Live Queue</p>
              {notifications.length > 0 && <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Table Assistance Calls</p>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 rounded-xl border p-4 text-left transition-colors ${
              activeTab === 'qr'
                ? 'border-slate-900 dark:border-amber-400 bg-white dark:bg-zinc-900 shadow-subtle'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-white dark:hover:bg-zinc-900'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-amber-400 mb-1">Setup</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Table QR Generator</p>
          </button>
        </div>

        {activeTab === 'alerts' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Requests</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Live Monitoring
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-16 text-center shadow-subtle">
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">No active calls</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Diner requests from table QR codes will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-subtle hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-amber-500 text-base font-bold text-slate-900 dark:text-black border border-slate-200 dark:border-amber-400">
                        {notif.table}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Table {notif.table} Requested Assistance</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Call Received at {notif.time}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotif(notif.id)}
                      className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 px-4 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all"
                    >
                      Dismiss Call
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-subtle">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Table QR Codes</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Print or download QR labels for table placement in food court.</p>
              </div>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">Target: /restaurant/{restaurantSlug}?table=X</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {tables.map((table) => (
                <div
                  key={table}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black p-5 text-center transition-all hover:bg-white dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-subtle"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-amber-400">Table</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{table}</p>

                  <div className="mx-auto mb-4 flex items-center justify-center rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm w-fit">
                    <QRCodeCanvas
                      id={`qr-table-${table}`}
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/restaurant/${restaurantSlug}?table=${table}`}
                      size={90}
                      level={'H'}
                      includeMargin={false}
                    />
                  </div>

                  <button
                    onClick={() => downloadQR(table)}
                    className="w-full rounded-md bg-slate-900 dark:bg-amber-500 py-2 text-[11px] font-semibold text-white dark:text-black font-bold transition-colors hover:bg-slate-800 dark:hover:bg-amber-400 shadow-subtle"
                  >
                    Download PNG
                  </button>
                </div>
              ))}

              <button
                onClick={() => setTables((prev) => [...prev, String(prev.length + 1)])}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 transition-all hover:border-slate-400 dark:hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
              >
                <span className="text-2xl font-light text-slate-600 dark:text-amber-400">+</span>
                <span className="mt-1 text-xs font-semibold text-slate-600 dark:text-zinc-300">Add New Table</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
