'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [search, setSearch] = useState('')
  const [activeCuisine, setActiveCuisine] = useState('All')
  const [restaurantList, setRestaurantList] = useState([])
  const [loading, setLoading] = useState(true)
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000')

  const normalize = (value = '') =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setBackendUrl(`http://${hostname}:8000`)
      }
    }
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const activeUrl = currentHost !== 'localhost' && currentHost !== '127.0.0.1'
        ? `http://${currentHost}:8000`
        : 'http://localhost:8000'

      const response = await fetch(`${activeUrl}/restaurants/`)
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setRestaurantList(data)
    } catch (err) {
      console.error('Data sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const query = normalize(search)

    return restaurantList.filter((r) => {
      const combinedSearchText = normalize([
        r.name,
        r.cuisine,
        r.floor,
        r.tagline
      ].join(' '))

      const matchesSearch = !query || combinedSearchText.includes(query)
      const matchesCuisine = activeCuisine === 'All' || normalize(r.cuisine).includes(normalize(activeCuisine))

      return matchesSearch && matchesCuisine
    })
  }, [activeCuisine, restaurantList, search])

  const cuisines = ['All', ...new Set(restaurantList.flatMap((r) => r.cuisine.split(' / ')))]

  const hasActiveFilters = search !== '' || activeCuisine !== 'All'

  const clearFilters = () => {
    setSearch('')
    setActiveCuisine('All')
  }

  const getCoverImage = (restaurant) => {
    if (restaurant.menu_images) {
      try {
        const parsed = JSON.parse(restaurant.menu_images)
        if (parsed && parsed.length > 0) {
          const url = parsed[0]
          return url.startsWith('http') ? url : `${backendUrl}${url}`
        }
      } catch (e) {}
    }
    if (restaurant.logo_url) {
      return restaurant.logo_url.startsWith('http') ? restaurant.logo_url : `${backendUrl}${restaurant.logo_url}`
    }
    return null
  }

  const formatTime12 = (timeStr = '11:00') => {
    try {
      const [h, m] = timeStr.split(':').map(Number)
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 === 0 ? 12 : h % 12
      const mStr = m < 10 ? `0${m}` : m
      return `${h12}:${mStr} ${period}`
    } catch (e) {
      return timeStr
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-[#08121e] text-[#e6edf8] flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-4 border-[#f5ba4b] border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-xs uppercase tracking-widest text-[#f5ba4b] animate-pulse">Syncing Food Directory...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#08121e] text-[#e6edf8]">
      {/* Navigation Header */}
      <nav className="border-b border-[#1e2e40] bg-[#0b1722]/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-tight">MOS Food Hub</h1>
              <p className="text-[10px] text-[#8a9db0] font-medium">Mall of Sargodha • Food Court</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase text-emerald-400">Directory Live</span>
            </div>
            <Link
              href="/admin"
              className="rounded-2xl border border-[#21354a] bg-[#0f1d2c] px-3.5 py-2 text-xs font-bold text-[#f5ba4b] hover:border-[#f5ba4b] transition-all shadow-md"
            >
              🔑 Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Hero Section */}
        <section className="mb-8 rounded-[32px] border border-[#1e2e40] bg-[#0f1d2c] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#f5ba4b]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-[#f5ba4b]/10 border border-[#f5ba4b]/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b] mb-3">
              Official Food Court Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Find Your Favorite Food & Menus</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8a9db0] leading-relaxed">
              Browse complete digital menus, actual prices, and floor locations across Mall of Sargodha restaurants.
            </p>

            {/* Live Search Input */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3.5 text-sm text-[#8a9db0] focus-within:border-[#f5ba4b] focus-within:ring-2 focus-within:ring-[#f5ba4b]/20 transition-all shadow-inner">
              <span className="text-base text-[#f5ba4b]">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by restaurant name, pizza, burger, biryani, floor..."
                className="w-full border-0 bg-transparent text-sm text-[#e6edf8] focus:outline-none placeholder-[#5b6e82]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs font-bold text-[#8a9db0] hover:text-white">✕</button>
              )}
            </div>
          </div>
        </section>

        {/* Category Filter Pills Bar */}
        <section className="mb-8 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#f5ba4b]">Categories</p>
          </div>

          {/* Cuisine Tags */}
          <div className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setActiveCuisine(cuisine)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  activeCuisine === cuisine
                    ? 'border-[#f5ba4b] bg-[#f5ba4b] text-[#121110] shadow-lg shadow-[#f5ba4b]/20 scale-105'
                    : 'border-[#1e2e40] bg-[#0f1d2c] text-[#8a9db0] hover:text-white hover:border-[#f5ba4b]/40'
                }`}
              >
                <span>🍽️</span>
                <span>{cuisine}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Snabb-Style Visual Food Cover Card Grid */}
        <section>
          <div className="mb-5 flex items-center justify-between border-b border-[#1e2e40] pb-3">
            <h3 className="text-xl font-black text-white">Outlets Directory</h3>
            <span className="rounded-full border border-[#1e2e40] bg-[#0f1d2c] px-3.5 py-1 text-xs font-mono font-bold text-[#f5ba4b]">
              {filtered.length} Restaurants
            </span>
          </div>

          {/* Fully Mobile-Responsive 1-to-4 Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((restaurant) => {
              const coverUrl = getCoverImage(restaurant)
              return (
                <Link
                  key={restaurant.slug}
                  href={`/restaurant/${restaurant.slug}`}
                  className="group block rounded-[28px] border border-[#1e2e40] bg-[#0f1d2c] overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#f5ba4b]/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Cover Image Banner */}
                    <div className="h-48 w-full relative overflow-hidden bg-[#142637]">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={restaurant.name}
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            !restaurant.is_open ? 'brightness-50' : ''
                          }`}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#142637] to-[#08121e] flex items-center justify-center text-4xl font-black text-[#f5ba4b]/30">
                          🍔
                        </div>
                      )}

                      {/* Snabb-Style Center Overlay for Closed Restaurants */}
                      {!restaurant.is_open && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
                          <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow-md">
                            Opens {formatTime12(restaurant.opening_time)}
                          </span>
                        </div>
                      )}

                      {/* Floating Star Rating Overlay */}
                      <div className="absolute top-3 right-3 rounded-full bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 text-xs font-bold text-[#f5ba4b] flex items-center gap-1 shadow-lg z-10">
                        <span>★</span>
                        <span>{restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'New'}</span>
                        <span className="text-[9px] text-[#8a9db0]">({restaurant.ratings_count})</span>
                      </div>

                      {/* Floating Shop Logo Avatar Overlay */}
                      <div className="absolute -bottom-2 left-4 h-12 w-12 rounded-2xl bg-[#08121e] border-2 border-[#f5ba4b] overflow-hidden shadow-xl flex items-center justify-center text-lg font-bold text-[#f5ba4b] z-10">
                        {restaurant.logo_url ? (
                          <img src={`${backendUrl}${restaurant.logo_url}`} alt={restaurant.name} className="h-full w-full object-cover" />
                        ) : (
                          restaurant.name[0]
                        )}
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-5 pt-5">
                      <h4 className="text-lg font-bold text-white group-hover:text-[#f5ba4b] transition-colors truncate">
                        {restaurant.name}
                      </h4>

                      <p className="mt-1 text-xs text-[#8a9db0] font-semibold truncate">
                        {restaurant.floor} • {restaurant.cuisine}
                      </p>

                      {restaurant.tagline && (
                        <p className="mt-2 text-xs italic text-[#f5ba4b]/85 line-clamp-1 font-medium">
                          "{restaurant.tagline}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Status & Action Bar */}
                  <div className="px-5 pb-5 pt-2 border-t border-[#1e2e40]/60 flex items-center justify-between">
                    {restaurant.is_open ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Open now • Closes {formatTime12(restaurant.closing_time)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        Closed now
                      </span>
                    )}

                    <span className="text-xs font-bold text-[#f5ba4b] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>View Menu</span>
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-8 rounded-[36px] border border-dashed border-[#1e2e40] bg-[#0f1d2c] p-12 text-center">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-[#8a9db0] text-sm font-medium">No restaurants found matching your search.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
