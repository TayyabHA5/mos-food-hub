'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RestaurantCard({ restaurant, backendUrl }) {
  const [imgError, setImgError] = useState(false)
  const [logoError, setLogoError] = useState(false)

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

  // Determine cover image URL
  const getCoverImage = () => {
    if (imgError) return null

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

  const coverUrl = getCoverImage()

  // Clean vector SVG illustration for fallbacks
  const getFallbackIcon = (cuisine = '') => {
    const c = cuisine.toLowerCase()
    if (c.includes('pizza')) {
      return (
        <svg className="h-10 w-10 text-slate-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2L2 22h20L12 2z" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="9" cy="17" r="1.5" fill="currentColor" />
          <circle cx="15" cy="17" r="1.5" fill="currentColor" />
        </svg>
      )
    }
    if (c.includes('broast') || c.includes('fried chicken')) {
      return (
        <svg className="h-10 w-10 text-slate-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3a7 7 0 0 0-7 7c0 4.5 3 6.5 4 8.5v1.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V18.5c1-2 4-4 4-8.5a7 7 0 0 0-7-7z" />
        </svg>
      )
    }
    return (
      <svg className="h-10 w-10 text-slate-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    )
  }

  const logoUrl =
    restaurant.logo_url && !logoError
      ? restaurant.logo_url.startsWith('http')
        ? restaurant.logo_url
        : `${backendUrl}${restaurant.logo_url}`
      : null

  const ratingsCount = restaurant.ratings_count || 0
  const avgRating = restaurant.average_rating ? Number(restaurant.average_rating).toFixed(1) : null

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-card-hover">
      <div>
        {/* Card Header Media */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/80">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={restaurant.name}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                !restaurant.is_open ? 'grayscale-[30%] opacity-80' : ''
              }`}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900/60 p-6 text-center select-none">
              {getFallbackIcon(restaurant.cuisine)}
              <span className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {restaurant.cuisine || 'Food Court Outlet'}
              </span>
            </div>
          )}

          {/* Top Status & Rating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Open / Closed pill */}
            {restaurant.is_open ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-black/85 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Open
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-black/85 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 shadow-sm backdrop-blur-sm border border-slate-200 dark:border-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-zinc-500" />
                Closed
              </span>
            )}

            {/* Rating pill */}
            <div className="flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/85 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:text-zinc-200 shadow-sm backdrop-blur-sm border border-slate-200 dark:border-zinc-800">
              <svg className="h-3.5 w-3.5 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{avgRating ? avgRating : 'New'}</span>
              {ratingsCount > 0 && <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">({ratingsCount})</span>}
            </div>
          </div>

          {/* Outlet Logo Avatar */}
          <div className="absolute -bottom-1 left-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm group-hover:border-slate-400 dark:group-hover:border-zinc-700 transition-colors">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={restaurant.name}
                onError={() => setLogoError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-slate-800 dark:text-white">
                {restaurant.name?.charAt(0) || 'M'}
              </span>
            )}
          </div>
        </div>

        {/* Card Content Area */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white transition-colors group-hover:text-slate-700 dark:group-hover:text-zinc-300 line-clamp-1">
                {restaurant.name}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {restaurant.floor || 'Food Court (Floor 3)'}
              </p>
            </div>
          </div>

          {/* Cuisine tags */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {restaurant.cuisine?.split('/').map((c, i) => (
              <span
                key={i}
                className="rounded-md bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800"
              >
                {c.trim()}
              </span>
            ))}
          </div>

          {/* Tagline */}
          {restaurant.tagline && (
            <p className="mt-2 text-xs italic text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              &ldquo;{restaurant.tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {restaurant.is_open ? (
                <span>Closes at <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{formatTime12(restaurant.closing_time)}</strong></span>
              ) : (
                <span>Opens at <strong className="text-slate-700 dark:text-zinc-300 font-semibold">{formatTime12(restaurant.opening_time)}</strong></span>
              )}
            </p>
          </div>

          <Link
            href={`/restaurant/${restaurant.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <span>View Menu</span>
            <svg
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
