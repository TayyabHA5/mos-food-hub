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
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 shadow-subtle">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
              M
            </div>
            <h1 className="text-sm font-bold text-slate-900">Outlet Management Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              View Public Hub
            </Link>
            <button
              onClick={() => {
                localStorage.clear()
                router.push('/admin/login')
              }}
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
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
                ? 'border-slate-900 bg-white shadow-subtle'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Live Queue</p>
              {notifications.length > 0 && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
            </div>
            <p className="text-sm font-bold text-slate-900">Table Assistance Calls</p>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 rounded-xl border p-4 text-left transition-colors ${
              activeTab === 'qr'
                ? 'border-slate-900 bg-white shadow-subtle'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Setup</p>
            <p className="text-sm font-bold text-slate-900">Table QR Generator</p>
          </button>
        </div>

        {activeTab === 'alerts' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">Active Requests</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Live Monitoring
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-subtle">
                <p className="text-xs font-semibold text-slate-800">No active calls</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Diner requests from table QR codes will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-subtle hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-base font-bold text-slate-900 border border-slate-200">
                        {notif.table}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Table {notif.table} Requested Assistance</p>
                        <p className="text-xs text-slate-500 mt-0.5">Call Received at {notif.time}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotif(notif.id)}
                      className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-all"
                    >
                      Dismiss Call
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-subtle">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Table QR Codes</h2>
                <p className="text-xs text-slate-500">Print or download QR labels for table placement in food court.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Target: /restaurant/{restaurantSlug}?table=X</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {tables.map((table) => (
                <div
                  key={table}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center transition-all hover:bg-white hover:border-slate-300 hover:shadow-subtle"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Table</p>
                  <p className="text-2xl font-bold text-slate-900 mb-3">{table}</p>

                  <div className="mx-auto mb-4 flex items-center justify-center rounded-lg bg-white p-2.5 border border-slate-200 w-fit">
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
                    className="w-full rounded-md bg-slate-900 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800 shadow-subtle"
                  >
                    Download PNG
                  </button>
                </div>
              ))}

              <button
                onClick={() => setTables((prev) => [...prev, String(prev.length + 1)])}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="text-2xl font-light text-slate-600">+</span>
                <span className="mt-1 text-xs font-semibold text-slate-600">Add New Table</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
