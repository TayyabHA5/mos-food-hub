'use client'

import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import RestaurantCard from '../components/RestaurantCard'
import AmenitiesSection from '../components/AmenitiesSection'
import MallInfoSection from '../components/MallInfoSection'
import Footer from '../components/Footer'

export default function Home() {
  const [search, setSearch] = useState('')
  const [activeCuisine, setActiveCuisine] = useState('All')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [restaurantList, setRestaurantList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'

  const normalize = (value = '') =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${backendUrl}/restaurants/`)
      if (!response.ok) throw new Error('Failed to load restaurants')
      const data = await response.json()
      setRestaurantList(data)
    } catch (err) {
      console.error('Data sync error:', err)
      setError('Could not connect to the food court server. Showing available cached outlets.')
    } finally {
      setLoading(false)
    }
  }

  // Cuisines list calculated from data (supports multiple cuisines split by /, comma, or pipe)
  const cuisines = useMemo(() => {
    const set = new Set()
    restaurantList.forEach((r) => {
      if (r.cuisine) {
        r.cuisine.split(/[/,|,]/).forEach((c) => {
          const trimmed = c.trim()
          if (trimmed) set.add(trimmed)
        })
      }
    })
    return ['All', ...Array.from(set)]
  }, [restaurantList])

  // Filtered and sorted restaurant list
  const filtered = useMemo(() => {
    const query = normalize(search)

    let results = restaurantList.filter((r) => {
      const combinedSearchText = normalize(
        [r.name, r.cuisine, r.floor, r.tagline].join(' ')
      )

      const matchesSearch = !query || combinedSearchText.includes(query)

      // Split restaurant's assigned cuisines to support multi-chip matching
      const restaurantCuisines = (r.cuisine || '')
        .split(/[/,|,]/)
        .map((c) => normalize(c))
        .filter(Boolean)

      const targetCuisine = normalize(activeCuisine)

      const matchesCuisine =
        activeCuisine === 'All' ||
        restaurantCuisines.some(
          (c) => c === targetCuisine || c.includes(targetCuisine) || targetCuisine.includes(c)
        )

      const matchesOpen = !onlyOpen || r.is_open

      return matchesSearch && matchesCuisine && matchesOpen
    })

    if (sortBy === 'rating') {
      results = [...results].sort(
        (a, b) => (b.average_rating || 0) - (a.average_rating || 0)
      )
    } else if (sortBy === 'name') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name))
    }

    return results
  }, [activeCuisine, onlyOpen, restaurantList, search, sortBy])

  const openCount = useMemo(() => {
    return restaurantList.filter((r) => r.is_open).length
  }, [restaurantList])

  const clearFilters = () => {
    setSearch('')
    setActiveCuisine('All')
    setOnlyOpen(false)
    setSortBy('default')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black text-[#0f172a] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-black pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left headline */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700 dark:bg-zinc-300" />
                  <span>Mall of Sargodha · Floor 3 Food Court</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Digital Menus & Restaurant Directory
                </h1>

                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Browse complete printed menus, actual prices, opening hours, and floor locations for all fast food, pizza, and dining outlets.
                </p>

                {/* Key Quick Stats */}
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-700 dark:text-zinc-300 shadow-subtle">
                    <span className="font-bold text-slate-900 dark:text-white">{restaurantList.length}</span>
                    <span>Total Outlets</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-700 dark:text-zinc-300 shadow-subtle">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">{openCount}</span>
                    <span>Open Now</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-700 dark:text-zinc-300 shadow-subtle">
                    <svg className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>11:00 AM – 12:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Right Search Box Card */}
              <div className="w-full lg:max-w-md">
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-5 shadow-sm">
                  <label htmlFor="search-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
                    Search Food & Restaurants
                  </label>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <input
                      id="search-input"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search pizza, burger, broast, restaurant..."
                      className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-600 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-600 dark:focus:ring-zinc-500 transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 rounded-full p-1 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white"
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Popular quick tags */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="text-[11px]">Popular:</span>
                    {['Pizza', 'Broast', 'Fast Food'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearch(tag)}
                        className="rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-zinc-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Directory & Content Section */}
        <section id="directory" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Controls Bar: Category Pills + Filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Cuisine category pills */}
              <div className="scrollbar-hidden flex items-center gap-2 overflow-x-auto pb-1">
                {cuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setActiveCuisine(cuisine)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      activeCuisine === cuisine
                        ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-black shadow-sm'
                        : 'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>

              {/* Toggles and Sorting */}
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0 text-xs">
                {/* Open now toggle */}
                <button
                  onClick={() => setOnlyOpen(!onlyOpen)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium transition-all ${
                    onlyOpen
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${onlyOpen ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-400 dark:bg-zinc-600'}`} />
                  <span>Open Now</span>
                </button>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-700 font-medium"
                >
                  <option value="default" className="dark:bg-zinc-900">Default Order</option>
                  <option value="rating" className="dark:bg-zinc-900">Highest Rated</option>
                  <option value="name" className="dark:bg-zinc-900">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Counter / Active Filters Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <p>
                Showing <strong className="text-slate-900 dark:text-white font-semibold">{filtered.length}</strong> {filtered.length === 1 ? 'outlet' : 'outlets'}
                {activeCuisine !== 'All' && <span> in <span className="text-slate-900 dark:text-white font-medium">{activeCuisine}</span></span>}
                {search && <span> matching &ldquo;<span className="text-slate-900 dark:text-white font-medium">{search}</span>&rdquo;</span>}
              </p>

              {(search || activeCuisine !== 'All' || onlyOpen || sortBy !== 'default') && (
                <button
                  onClick={clearFilters}
                  className="text-slate-900 dark:text-white hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                >
                  <div className="h-44 bg-slate-100 dark:bg-zinc-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-zinc-800/60 rounded" />
                    <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="my-8 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 mb-4">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Outlets Found</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any outlets matching your search. Try another keyword or reset filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          )}

          {/* Restaurant Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.slug || restaurant.id}
                  restaurant={restaurant}
                  backendUrl={backendUrl}
                />
              ))}
            </div>
          )}

          {/* Food Court Amenities Section */}
          <AmenitiesSection />

          {/* Mall Information Section */}
          <MallInfoSection />
        </section>
      </main>

      <Footer />
    </div>
  )
}
