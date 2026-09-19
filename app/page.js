'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { defaultFloors, restaurants as initialRestaurants } from '../data/restaurants'

export default function Home() {
  const [search, setSearch] = useState('')
  const [activeCuisine, setActiveCuisine] = useState('All')
  const [restaurantLogos, setRestaurantLogos] = useState({})
  const [floors, setFloors] = useState(defaultFloors)
  const [restaurantList, setRestaurantList] = useState(initialRestaurants)

  const normalize = (value = '') =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  useEffect(() => {
    const savedRestaurants = JSON.parse(window.localStorage.getItem('mos-restaurants') || 'null')
    if (Array.isArray(savedRestaurants)) {
      setRestaurantList(savedRestaurants)
    }

    const savedFloors = JSON.parse(window.localStorage.getItem('mos-floors') || 'null')
    if (Array.isArray(savedFloors) && savedFloors.length) {
      setFloors(savedFloors)
    }

    const savedLogos = Object.fromEntries(
      [...initialRestaurants, ...(Array.isArray(savedRestaurants) ? savedRestaurants : [])].map((restaurant) => [restaurant.slug, window.localStorage.getItem(`mos-restaurant-logo-${restaurant.slug}`) || ''])
    )
    setRestaurantLogos(savedLogos)
  }, [])

  const filtered = useMemo(() => {
    const query = normalize(search)

    return restaurantList.filter((r) => {
      const menuText = (r.menu || [])
        .flatMap((category) => category.items || [])
        .map((item) => item.name)
        .join(' ')

      const combinedSearchText = normalize([
        r.name,
        r.cuisine,
        r.floor,
        r.tagline,
        ...(r.tags || []),
        r.searchText || '',
        menuText,
      ].join(' '))

      const matchesSearch = !query || combinedSearchText.includes(query)
      const matchesCuisine = activeCuisine === 'All' || normalize(r.cuisine).includes(normalize(activeCuisine))
      return matchesSearch && matchesCuisine
    })
  }, [activeCuisine, restaurantList, search])

  const cuisines = ['All', ...new Set(restaurantList.flatMap((restaurant) => restaurant.cuisine.split(' / ')))]
  const cuisineIcons = {
    All: '✦',
    'Fast Food': '●',
    Desi: '◆',
    BBQ: '◇',
    Italian: '✣',
    Tea: '☕',
    Snacks: '◌',
  }

  return (
    <main className="min-h-screen bg-[#06141f] text-[#e6edf8]">
      <div className="mx-auto min-h-screen max-w-[440px] px-4 pb-8 pt-4">
        <header className="rounded-[28px] border border-[#1f2d3b] bg-[#0b1722] px-4 pb-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between py-3">
            <button type="button" className="rounded-full border border-[#243447] bg-[#0d1a27] px-2 py-1 text-[11px] text-[#dfe8f5]">←</button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-[#f7f8fb]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f5ba4b]" />
                <span>Food Court</span>
              </div>
              <p className="mt-1 text-[11px] text-[#9fb0c0]">Mall of Sargodha • 3rd Floor</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2d4053] bg-[#0d1a27] text-[10px] text-[#f6cd68]">≡</div>
          </div>

          <div className="mt-3 rounded-2xl border border-[#213147] bg-[#0f1d2b] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#efb95d]">Food Court</p>
                <h1 className="mt-2 text-[15px] font-bold text-[#f4f6fb]">Discover top spots</h1>
              </div>
              <span className="rounded-full bg-[#1a3f35] px-2.5 py-1 text-[10px] font-bold text-[#69f0ac]">Open</span>
            </div>
            <p className="mt-2 text-[11px] text-[#9db0c2]">Browse by cuisine, floor, and popular menu picks.</p>
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-full border border-[#2b3d50] bg-[#101d2b] px-3 py-2 text-[12px] text-[#8fa4b9]">
            <span>⌕</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pizza, wings, chai, fries..." className="w-full border-0 bg-transparent text-[12px] text-[#eaf3ff] placeholder:text-[#7d8ca1] focus:outline-none" />
          </label>

          <div className="scrollbar-hidden mt-4 flex gap-2 overflow-x-auto pb-1">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                onClick={() => setActiveCuisine(cuisine)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold ${activeCuisine === cuisine ? 'border-[#f2bf5d] bg-[#f5ba4b] text-[#1d1b1a]' : 'border-[#233548] bg-[#0f1d2b] text-[#dfe9f5]'}`}
              >
                <span>{cuisineIcons[cuisine] || '•'}</span>
                <span>{cuisine}</span>
              </button>
            ))}
          </div>
        </header>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold text-[#edf5ff]">Food Court Directory</h2>
            <span className="rounded-full border border-[#2a3f52] bg-[#0d1a27] px-2 py-1 text-[10px] font-bold text-[#aebdca]">{filtered.length} outlets</span>
          </div>

          <div className="space-y-3">
            {filtered.map((restaurant) => {
              const restaurantRating = 4.5 + ((restaurant.slug.length % 5) * 0.1)
              const reviewCount = 120 + (restaurant.name.length % 80)
              const displayTags = (restaurant.tags || []).slice(0, 2)

              return (
                <Link
                  key={restaurant.slug}
                  href={`/restaurant/${restaurant.slug}`}
                  className="block rounded-[22px] border border-[#1f2d3b] bg-[#0d1a27] p-3 shadow-[0_10px_20px_rgba(0,0,0,0.22)] transition hover:border-[#f3b85b]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#2b3a4c] bg-[#111f2b]">
                      {restaurantLogos[restaurant.slug] ? (
                        <img src={restaurantLogos[restaurant.slug]} alt={restaurant.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[18px] font-bold text-[#f5ba4b]">{restaurant.name.slice(0, 1)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-[17px] font-bold text-[#edf5ff]">{restaurant.name}</h3>
                          <p className="mt-1 truncate text-[11px] text-[#9db0c2]">{restaurant.cuisine} • {restaurant.floor}</p>
                        </div>
                        <span className="inline-flex rounded-full border border-[#1d7f5e] bg-[#102f2a] px-2 py-1 text-[10px] font-bold text-[#66f7b0]">Open</span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-[11px] text-[#b6c6d7]">{restaurant.tagline}</p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {displayTags.map((tag) => (
                          <span key={`${restaurant.slug}-${tag}`} className="rounded-full border border-[#2a3e52] bg-[#101d2b] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-[#d9e8f7]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 text-[#f9c85e]">
                          <span>★</span>
                          <span className="text-[12px] font-bold text-[#f8d882]">{restaurantRating.toFixed(1)}</span>
                          <span className="text-[10px] text-[#a8b9ca]">({reviewCount} reviews)</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#b9d1e4]">View menu →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#2b3d50] bg-[#0d1a27] p-8 text-center">
              <p className="text-[16px] font-semibold text-[#edf5ff]">No restaurants found.</p>
              <p className="mt-2 text-[11px] text-[#8fa4b9]">Try a different keyword or cuisine.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
