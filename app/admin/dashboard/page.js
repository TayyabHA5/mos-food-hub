'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'

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
          status: 'pending'
        }
        setNotifications(prev => [newNotif, ...prev].slice(0, 10))
        // Play alert sound logic
        try { new Audio('/alert.mp3').play() } catch(e) {}
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [router])

  const dismissNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const downloadQR = (tableNum) => {
    const canvas = document.getElementById(`qr-table-${tableNum}`)
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `QR-Table-${tableNum}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <main className="min-h-screen bg-[#08121e] text-[#e6edf8]">
      <nav className="border-b border-[#1e2e40] bg-[#0b1722] px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍕</span>
            <h1 className="text-lg font-black tracking-tight text-white">Pizza Point <span className="text-[#8a9db0] font-medium text-xs">| Outlet Dashboard</span></h1>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/admin/login') }} className="text-xs font-bold text-[#8a9db0] hover:text-red-400 transition-colors">Sign Out</button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl p-6 sm:p-10">
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 rounded-3xl border p-5 text-left transition-all ${
              activeTab === 'alerts'
                ? 'border-[#f5ba4b] bg-[#0f1d2c] shadow-lg shadow-[#f5ba4b]/10'
                : 'border-[#1e2e40] bg-[#0b1722] hover:bg-[#0f1d2c]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b]">Live Feed</p>
              {notifications.length > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <p className="text-xl font-black text-white">Waiter Call Alerts</p>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 rounded-3xl border p-5 text-left transition-all ${
              activeTab === 'qr'
                ? 'border-[#f5ba4b] bg-[#0f1d2c] shadow-lg shadow-[#f5ba4b]/10'
                : 'border-[#1e2e40] bg-[#0b1722] hover:bg-[#0f1d2c]/50'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b] mb-1">Table Setup</p>
            <p className="text-xl font-black text-white">QR Code Generator</p>
          </button>
        </div>

        {activeTab === 'alerts' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#1e2e40]">
              <h2 className="text-lg font-bold text-white">Incoming Table Calls</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Monitoring
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-[36px] border border-dashed border-[#1e2e40] bg-[#0f1d2c]/50 py-20 text-center">
                <span className="text-3xl block mb-2">🔔</span>
                <p className="text-sm font-medium text-[#8a9db0]">No active table calls right now.</p>
                <p className="text-xs text-[#5b6e82] mt-1">New waiter call requests will appear here in real-time.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {notifications.map(notif => (
                  <div key={notif.id} className="flex items-center justify-between rounded-3xl border border-[#1e2e40] bg-[#0f1d2c] p-5 shadow-xl animate-in fade-in duration-200 hover:border-[#f5ba4b]/30">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5ba4b] text-2xl font-black text-[#121110] shadow-md shadow-[#f5ba4b]/15">
                        {notif.table}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">Table {notif.table} Requested Assistance</p>
                        <p className="text-xs font-mono text-[#8a9db0] mt-0.5">Call Received at {notif.time}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotif(notif.id)}
                      className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-md"
                    >
                      ✓ Dismiss Call
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[36px] border border-[#1e2e40] bg-[#0f1d2c] p-8 shadow-xl">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1e2e40]">
              <div>
                <h2 className="text-2xl font-black text-white">Table QR Codes</h2>
                <p className="text-xs text-[#8a9db0]">Print or download QR labels for table placement in food court.</p>
              </div>
              <span className="text-xs font-mono text-[#5b6e82]">Target: /restaurant/{restaurantSlug}?table=X</span>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {tables.map(table => (
                <div key={table} className="group relative rounded-3xl border border-[#1e2e40] bg-[#08121e] p-6 text-center transition-all hover:border-[#f5ba4b] hover:shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b]">Table Number</p>
                  <p className="text-3xl font-black text-white mb-4">{table}</p>

                  <div className="mx-auto mb-5 flex items-center justify-center rounded-2xl bg-white p-3 shadow-md w-fit">
                    <QRCodeCanvas
                      id={`qr-table-${table}`}
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/restaurant/${restaurantSlug}?table=${table}`}
                      size={100}
                      level={"H"}
                      includeMargin={false}
                    />
                  </div>

                  <button
                    onClick={() => downloadQR(table)}
                    className="w-full rounded-2xl bg-[#f5ba4b] py-3 text-[10px] font-bold uppercase tracking-wider text-[#121110] transition-all hover:bg-[#f6c360] active:scale-95 shadow-md shadow-[#f5ba4b]/10"
                  >
                    Download PNG
                  </button>
                </div>
              ))}

              <button
                onClick={() => setTables(prev => [...prev, String(prev.length + 1)])}
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#1e2e40] bg-[#08121e]/50 p-6 transition-all hover:bg-[#08121e] hover:border-[#f5ba4b]"
              >
                <span className="text-3xl text-[#f5ba4b]">+</span>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#8a9db0]">Add New Table</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
