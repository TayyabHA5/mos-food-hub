'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

export default function RestaurantPage({ params }) {
  const searchParams = useSearchParams()
  const tableId = searchParams ? searchParams.get('table') : null

  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'

  const [menuImages, setMenuImages] = useState([])
  const [restaurantRatings, setRestaurantRatings] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Interactive Lightbox State
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    fetchRestaurant()
  }, [params.slug])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewerOpen) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') setViewerOpen(false)
      if (e.key === '+' || e.key === '=') handleZoomIn()
      if (e.key === '-') handleZoomOut()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewerOpen, activeImage, zoomLevel, menuImages])

  const fetchRestaurant = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${backendUrl}/restaurants/${params.slug}`)
      if (!response.ok) throw new Error('Restaurant not found')
      const data = await response.json()
      setRestaurant(data)

      if (data.menu_images) {
        try {
          const parsed = JSON.parse(data.menu_images)
          if (Array.isArray(parsed)) {
            const images = parsed.map((url, idx) => ({
              url: url.startsWith('http') ? url : `${backendUrl}${url}`,
              name: `Menu Page ${idx + 1}`,
            }))
            setMenuImages(images)
          }
        } catch (e) {
          console.error('Menu images parse error:', e)
        }
      }

      const ratingsRes = await fetch(`${backendUrl}/ratings/${data.id}`)
      if (ratingsRes.ok) {
        const ratingsData = await ratingsRes.json()
        setRestaurantRatings(ratingsData)
      }
    } catch (err) {
      console.error(err)
      setError('Unable to load this restaurant. Please check the URL or try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e?.preventDefault()
    if (!rating || isSubmitting) return
    setIsSubmitting(true)
    setReviewSuccess(false)

    try {
      const response = await fetch(`${backendUrl}/ratings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          user_name: userName.trim() || 'Food Court Diner',
          rating: rating,
          comment: reviewText.trim(),
        }),
      })

      if (response.ok) {
        setRating(0)
        setHoverRating(0)
        setReviewText('')
        setUserName('')
        setReviewSuccess(true)
        setTimeout(() => setReviewSuccess(false), 5000)
        fetchRestaurant()
      } else {
        alert('Could not submit rating. Please try again.')
      }
    } catch (err) {
      alert('Network error while submitting rating.')
    } finally {
      setIsSubmitting(false)
    }
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

  const resetZoom = () => {
    setZoomLevel(1.0)
    setPanPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }

  const handleNext = () => {
    if (menuImages.length === 0) return
    setActiveImage((prev) => (prev < menuImages.length - 1 ? prev + 1 : 0))
    resetZoom()
  }

  const handlePrev = () => {
    if (menuImages.length === 0) return
    setActiveImage((prev) => (prev > 0 ? prev - 1 : menuImages.length - 1))
    resetZoom()
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.0))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const nextZoom = Math.max(prev - 0.5, 1.0)
      if (nextZoom === 1.0) setPanPosition({ x: 0, y: 0 })
      return nextZoom
    })
  }

  const toggleDoubleTapZoom = () => {
    if (zoomLevel === 1.0) {
      setZoomLevel(2.0)
    } else {
      resetZoom()
    }
  }

  const handlePointerDown = (clientX, clientY) => {
    if (zoomLevel > 1.0) {
      setIsDragging(true)
      setDragStart({ x: clientX - panPosition.x, y: clientY - panPosition.y })
    } else {
      setTouchStartX(clientX)
      setTouchEndX(clientX)
    }
  }

  const handlePointerMove = (clientX, clientY) => {
    if (isDragging && zoomLevel > 1.0) {
      const newX = clientX - dragStart.x
      const newY = clientY - dragStart.y
      const maxPanX = (zoomLevel - 1) * 300
      const maxPanY = (zoomLevel - 1) * 450
      setPanPosition({
        x: Math.min(Math.max(newX, -maxPanX), maxPanX),
        y: Math.min(Math.max(newY, -maxPanY), maxPanY),
      })
    } else if (!isDragging && zoomLevel <= 1.0) {
      setTouchEndX(clientX)
    }
  }

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false)
    } else if (zoomLevel <= 1.0) {
      const distance = touchStartX - touchEndX
      if (distance > 50) handleNext()
      else if (distance < -50) handlePrev()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-slate-800 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-600 dark:text-amber-400 uppercase tracking-wider">
              Loading Menu & Outlet Details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Restaurant Not Found</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              {error || 'This outlet does not appear in the Mall of Sargodha directory.'}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-zinc-100 px-5 py-2.5 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
            >
              ← Return to Directory
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const logoUrl =
    restaurant.logo_url && !logoError
      ? restaurant.logo_url.startsWith('http')
        ? restaurant.logo_url
        : `${backendUrl}${restaurant.logo_url}`
      : null

  const avgRating = restaurant.average_rating ? Number(restaurant.average_rating).toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black text-[#0f172a] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                <span>←</span>
                <span>All Outlets</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400 dark:text-zinc-500">Food Court (Floor 3)</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{restaurant.name}</span>
            </div>

            {tableId && (
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-0.5 text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                <span>Table #{tableId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Outlet Header */}
        <section className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-black py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left Outlet Info */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shadow-sm">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={restaurant.name}
                      onError={() => setLogoError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                      {restaurant.name?.charAt(0) || 'M'}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {restaurant.is_open ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        Open Now · Closes {formatTime12(restaurant.closing_time)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                        Closed · Opens {formatTime12(restaurant.opening_time)}
                      </span>
                    )}

                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      {restaurant.floor || 'Food Court (Floor 3)'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {restaurant.name}
                  </h1>

                  {restaurant.tagline && (
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 italic">
                      &ldquo;{restaurant.tagline}&rdquo;
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {restaurant.cuisine?.split('/').map((c, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-zinc-300"
                      >
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Rating Summary */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-200 dark:border-zinc-800 pt-4 sm:pt-0 gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 text-base font-bold text-slate-900 dark:text-white">
                    <svg className="h-4 w-4 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{avgRating ? avgRating : 'New'}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {restaurantRatings.length} {restaurantRatings.length === 1 ? 'Review' : 'Reviews'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">Verified Diners</p>
                  </div>
                </div>

                <a
                  href="#review-form"
                  className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors shadow-subtle"
                >
                  Write a Review ↓
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main 2-Column Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Menu Viewer */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-6 shadow-sm">
                {/* Menu Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Digital Menu Gallery
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      High-resolution scan of the current printed food court menu.
                    </p>
                  </div>

                  {menuImages.length > 0 && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                        Page {activeImage + 1} of {menuImages.length}
                      </span>
                      <button
                        onClick={() => {
                          setViewerOpen(true)
                          resetZoom()
                        }}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-subtle"
                        title="Open Fullscreen View"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        <span>Fullscreen</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Menu Preview Card */}
                {menuImages.length > 0 ? (
                  <div>
                    <div
                      onClick={() => {
                        setViewerOpen(true)
                        resetZoom()
                      }}
                      className="group relative flex min-h-[420px] sm:min-h-[520px] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 p-3 transition-all hover:border-slate-300 dark:hover:border-zinc-700"
                    >
                      <img
                        src={menuImages[activeImage]?.url}
                        alt={`Menu page ${activeImage + 1}`}
                        className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                      />

                      {/* Floating hint pill */}
                      <div className="pointer-events-none absolute bottom-5 rounded-full bg-slate-900/80 dark:bg-black/90 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-white shadow-md flex items-center gap-1.5 border border-transparent dark:border-zinc-800">
                        <svg className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        <span>Click to Zoom & Fullscreen</span>
                      </div>

                      {/* Navigation arrow buttons */}
                      {menuImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePrev()
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/85 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white shadow-md transition-transform active:scale-90"
                            aria-label="Previous Page"
                          >
                            ←
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNext()
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/85 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white shadow-md transition-transform active:scale-90"
                            aria-label="Next Page"
                          >
                            →
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {menuImages.length > 1 && (
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
                        {menuImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveImage(idx)
                              resetZoom()
                            }}
                            className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                              activeImage === idx
                                ? 'border-slate-900 dark:border-amber-400 ring-2 ring-slate-900/10 dark:ring-amber-400/20 scale-105'
                                : 'border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img.url} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 dark:bg-black/80 text-[9px] font-mono font-bold text-center text-white py-0.5">
                              P.{idx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-6 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 p-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 mb-3">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Digital Menu In Preparation</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      The menu for {restaurant.name} is currently being scanned and uploaded. Please visit the counter directly on the 3rd Floor Food Court.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                      <span>Outlet Location: {restaurant.floor || 'Food Court (Floor 3)'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Information & Reviews */}
            <div className="lg:col-span-4 space-y-6">
              {/* Outlet Details Card */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Outlet Overview
                </h3>
                <dl className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                    <dt className="text-slate-500 dark:text-zinc-400">Floor Location</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">{restaurant.floor || 'Floor 3 Food Court'}</dd>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                    <dt className="text-slate-500 dark:text-zinc-400">Operating Hours</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">
                      {formatTime12(restaurant.opening_time)} – {formatTime12(restaurant.closing_time)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                    <dt className="text-slate-500 dark:text-zinc-400">Order Format</dt>
                    <dd className="font-semibold text-emerald-700 dark:text-emerald-400">Dine-in & Takeaway</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 dark:text-zinc-400">Seating</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">Central Food Hall</dd>
                  </div>
                </dl>
              </div>

              {/* Review Submission Card */}
              <div id="review-form" className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Rate This Restaurant
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {restaurantRatings.length} {restaurantRatings.length === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>

                {reviewSuccess && (
                  <div className="mb-4 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                    Your rating and review has been submitted successfully.
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-3">
                  {/* Star Rating Picker */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400 mb-1.5 font-medium">Select Rating</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <svg
                            className={`h-6 w-6 ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300 dark:text-zinc-700'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-600 dark:focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      placeholder="Share your dining experience (food taste, portion, speed)..."
                      className="w-full resize-none rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-600 dark:focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!rating || isSubmitting}
                    className="w-full rounded-lg bg-slate-900 dark:bg-zinc-100 py-2.5 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-subtle"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Customer Reviews Feed */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Customer Reviews
                </h3>

                {restaurantRatings.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-500 italic">No ratings yet. Be the first to share your review!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {restaurantRatings.map((r, i) => (
                      <div
                        key={r.id || i}
                        className="rounded-lg border border-slate-200 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/60 p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {r.user_name || 'Food Court Diner'}
                          </span>
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, idx) => (
                              <svg
                                key={idx}
                                className={`h-3 w-3 ${
                                  idx < r.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-zinc-700'
                                }`}
                                viewBox="0 0 24 24"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        {r.comment && (
                          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {r.comment}
                          </p>
                        )}

                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent Diner'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {viewerOpen && menuImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/90 dark:bg-black/95 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150 select-none overflow-hidden">
          {/* Lightbox Top Control Bar */}
          <div className="flex items-center justify-between gap-2 z-30 bg-white dark:bg-zinc-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{restaurant.name}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                · Page {activeImage + 1} of {menuImages.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1.0}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center transition-all"
                title="Zoom Out"
              >
                −
              </button>

              <button
                onClick={resetZoom}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[11px] font-mono font-semibold text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center transition-all"
                title="Zoom In"
              >
                +
              </button>

              <button
                onClick={() => {
                  setViewerOpen(false)
                  resetZoom()
                }}
                className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-red-500/20 border border-slate-200 dark:border-red-500/40 text-slate-700 dark:text-red-400 font-bold hover:bg-slate-200 dark:hover:bg-red-500/30 flex items-center justify-center ml-2 transition-all"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lightbox Image & Gesture Area */}
          <div
            className={`relative flex-1 flex items-center justify-center my-2 overflow-hidden ${
              zoomLevel > 1.0 ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handlePointerUp}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onDoubleClick={toggleDoubleTapZoom}
          >
            {menuImages.length > 1 && zoomLevel <= 1.0 && (
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 dark:bg-black/80 border border-slate-200 dark:border-zinc-800 text-lg text-slate-800 dark:text-white hover:bg-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="Previous Page"
              >
                ←
              </button>
            )}

            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={menuImages[activeImage]?.url}
                alt={`menu-full-${activeImage}`}
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl origin-center"
              />
            </div>

            {menuImages.length > 1 && zoomLevel <= 1.0 && (
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 dark:bg-black/80 border border-slate-200 dark:border-zinc-800 text-lg text-slate-800 dark:text-white hover:bg-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="Next Page"
              >
                →
              </button>
            )}
          </div>

          {/* Lightbox Bottom Controls & Thumbnail Strip */}
          <div className="z-30 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center gap-2 shadow-lg">
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              {zoomLevel > 1.0 ? (
                <span>Drag to pan across the magnified menu</span>
              ) : (
                <span>
                  Swipe or use arrows to change pages · <span className="font-semibold text-slate-900 dark:text-white">Double-click</span> to zoom
                </span>
              )}
            </p>

            {menuImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-w-full py-1 scrollbar-hidden">
                {menuImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(idx)
                      resetZoom()
                    }}
                    className={`h-12 w-10 shrink-0 overflow-hidden rounded-md border-2 bg-slate-100 dark:bg-black transition-all ${
                      activeImage === idx
                        ? 'border-slate-900 dark:border-amber-400 scale-105 shadow-sm'
                        : 'border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
