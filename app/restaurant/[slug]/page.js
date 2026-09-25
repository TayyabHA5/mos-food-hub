'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RestaurantPage({ params }) {
  const searchParams = useSearchParams()
  const tableId = searchParams.get('table')

  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'
  const [menuImages, setMenuImages] = useState([])
  const [restaurantRatings, setRestaurantRatings] = useState([])
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Interactive Lightbox State
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

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
    try {


      const response = await fetch(`${backendUrl}/restaurants/${params.slug}`)
      if (!response.ok) throw new Error('Not found')
      const data = await response.json()
      setRestaurant(data)

      if (data.menu_images) {
        const images = JSON.parse(data.menu_images).map(url => ({
          url: url.startsWith('http') ? url : `${backendUrl}${url}`,  // ✅ activeUrl → backendUrl
          name: 'Menu Page'
        }))
        setMenuImages(images)
      }

      const ratingsRes = await fetch(`${backendUrl}/ratings/${data.id}`)  // ✅ activeUrl → backendUrl
      if (ratingsRes.ok) {
        const ratingsData = await ratingsRes.json()
        setRestaurantRatings(ratingsData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!rating || isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`${backendUrl}/ratings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          user_name: userName || 'Anonymous',
          rating: rating,
          comment: reviewText
        })
      })

      if (response.ok) {
        setRating(0)
        setReviewText('')
        setUserName('')
        fetchRestaurant()
        alert('Thank you for your rating!')
      }
    } catch (err) {
      alert('Failed to submit rating')
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

  // Reset Zoom & Pan
  const resetZoom = () => {
    setZoomLevel(1.0)
    setPanPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }

  // Navigation Handlers
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

  // Pointer / Touch Panning Handlers
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
      // Bound limits according to zoom level
      const maxPanX = (zoomLevel - 1) * 220
      const maxPanY = (zoomLevel - 1) * 350
      setPanPosition({
        x: Math.min(Math.max(newX, -maxPanX), maxPanX),
        y: Math.min(Math.max(newY, -maxPanY), maxPanY)
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

  if (loading) return (
    <main className="min-h-screen bg-[#071722] flex flex-col items-center justify-center gap-3 text-[#f5ba4b] font-bold">
      <div className="h-10 w-10 border-4 border-[#f5ba4b] border-t-transparent rounded-full animate-spin" />
      <span>LOADING MENU...</span>
    </main>
  )

  if (!restaurant) return <main className="min-h-screen bg-[#071722] p-5 text-[#edf5ff]">Restaurant not found.</main>

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071722] text-[#edf5ff]">
      <div className="mx-auto min-h-screen max-w-[440px] px-4 pb-24 pt-4">
        <header className="rounded-[28px] border border-[#1d2f43] bg-[#0a1724] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-[18px] text-[#dfe9f5] hover:text-[#f5ba4b]">←</Link>
            <div className="flex items-center gap-2 text-center">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#2d3d52] bg-[#111e2d] text-sm font-bold text-[#f5ba4b]">
                {restaurant.logo_url ? <img src={`${backendUrl}${restaurant.logo_url}`} alt="logo" className="h-full w-full object-cover" /> : restaurant.name.slice(0, 1)}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#f4bd67]">{restaurant.cuisine}</p>
                <h1 className="text-[18px] font-bold text-[#eef6ff]">{restaurant.name}</h1>
              </div>
            </div>
            {restaurant.is_open ? (
              <span className="rounded-full border border-[#1a4537] bg-[#102d27] px-2.5 py-1 text-[10px] font-bold text-[#73efb3]">Open</span>
            ) : (
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400">Closed</span>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-[#142535] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#efb95d]">Food Court</p>
                <h2 className="mt-1 break-words text-[22px] font-bold text-[#f5f9ff]">{restaurant.tagline || 'Delicious Food'}</h2>
              </div>
              <span className="rounded-full border border-[#f1ba5d] bg-[#f4b851] px-2.5 py-1 text-[10px] font-bold text-[#1b1a17]">★ {restaurant.average_rating ? restaurant.average_rating.toFixed(1) : '0.0'}</span>
            </div>
            <p className="mt-2 text-[12px] text-[#a7b8c9]">
              {restaurant.floor} • {restaurant.cuisine} • ⏰ {formatTime12(restaurant.opening_time || '11:00')} - {formatTime12(restaurant.closing_time || '23:00')}
            </p>
          </div>
        </header>

        {/* Menu Gallery Card */}
        <section className="mt-5 rounded-[24px] border border-[#1d2f43] bg-[#0d1a27] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#d9a95d]">Menu gallery</p>
            <span className="text-[10px] font-mono text-[#9ab0c5]">
              {menuImages.length ? `Page ${activeImage + 1} of ${menuImages.length}` : 'No images yet'}
            </span>
          </div>

          {menuImages.length > 0 ? (
            <>
              {/* Swipable & Clickable Image Preview Container */}
              <div
                onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={handlePointerUp}
                onClick={() => { setViewerOpen(true); resetZoom(); }}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[20px] border border-[#2a3e53] bg-[#0a1724] p-2 transition-all hover:border-[#f5ba4b] select-none"
              >
                <img
                  src={menuImages[activeImage]?.url}
                  alt="menu"
                  className="h-[360px] w-full rounded-[16px] object-contain sm:h-[440px] transition-transform duration-200 group-hover:scale-[1.02]"
                />

                {/* Left Arrow Button for Card */}
                {menuImages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/75 border border-[#2d3d52] text-white hover:border-[#f5ba4b] hover:text-[#f5ba4b] flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    title="Previous Page"
                  >
                    ←
                  </button>
                )}

                {/* Right Arrow Button for Card */}
                {menuImages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/75 border border-[#2d3d52] text-white hover:border-[#f5ba4b] hover:text-[#f5ba4b] flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    title="Next Page"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Thumbnails list */}
              {menuImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {menuImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-black transition-all ${activeImage === index ? 'border-[#f5ba4b] scale-105' : 'border-[#2a3d4f] opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2b3d50] bg-[#0d1824] p-8 text-center">
              <p className="text-[16px] font-semibold text-[#edf5ff]">No menu images uploaded.</p>
            </div>
          )}
        </section>

        {/* Real Rating Form */}
        <section className="mt-5 rounded-[24px] border border-[#1d2f43] bg-[#0d1a27] p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#f5ba4b]">Rate & Review</h3>
            <span className="text-[10px] text-[#9ab0c5]">{restaurantRatings.length} total ratings</span>
          </div>

          <div className="space-y-4">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name (Optional)"
              className="w-full rounded-xl bg-[#111e2d] border border-[#23364c] p-3 text-xs text-white outline-none focus:border-[#f5ba4b]"
            />

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className={`text-[32px] transition-colors ${star <= rating ? 'text-[#f6c55b]' : 'text-[#4d5f75]'}`}>★</button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              placeholder="Tell us about your experience..."
              className="w-full resize-none rounded-xl border border-[#23364c] bg-[#111e2d] p-3 text-xs text-[#edf5ff] focus:border-[#f5ba4b] outline-none"
            />

            <button
              onClick={handleSubmitReview}
              disabled={!rating || isSubmitting}
              className="w-full rounded-2xl bg-[#f5ba4b] py-4 text-xs font-bold text-[#171613] disabled:bg-[#5b6780] shadow-lg shadow-[#f5ba4b]/10 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </section>

        {/* Detailed Reviews List */}
        <section className="mt-5 space-y-3">
          <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-[#5b6e82]">Customer Reviews</h3>
          {restaurantRatings.length === 0 ? (
            <p className="text-center py-10 text-xs text-[#5b6e82] italic">No reviews yet. Be the first to rate!</p>
          ) : (
            restaurantRatings.map((r) => (
              <div key={r.id} className="rounded-2xl border border-[#1d2f43] bg-[#0d1a27] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#f5f9ff]">{r.user_name}</span>
                  <div className="flex text-[#f5ba4b] text-[10px]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#a7b8c9] leading-relaxed">{r.comment || 'No comment provided.'}</p>
                <p className="mt-2 text-[8px] uppercase text-[#5b6e82] tracking-tighter">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </section>
      </div>

      {/* FULLSCREEN INTERACTIVE LIGHTBOX MODAL */}
      {viewerOpen && menuImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden">
          {/* Lightbox Top Control Bar */}
          <div className="flex items-center justify-between gap-2 z-30 bg-black/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1d2f43] shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f5ba4b]">{restaurant.name}</span>
              <span className="text-[10px] text-[#8a9db0]">• Page {activeImage + 1} of {menuImages.length}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Out Button */}
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1.0}
                className="h-9 w-9 rounded-xl border border-[#2d3d52] bg-[#111e2d] text-sm font-bold text-white hover:border-[#f5ba4b] disabled:opacity-30 flex items-center justify-center transition-all"
                title="Zoom Out"
              >
                🔍-
              </button>

              {/* Zoom Level Indicator / Reset */}
              <button
                onClick={resetZoom}
                className="px-2.5 py-1.5 rounded-xl border border-[#2d3d52] bg-[#111e2d] text-[11px] font-mono font-bold text-[#f5ba4b] hover:border-[#f5ba4b] transition-all"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              {/* Zoom In Button */}
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0}
                className="h-9 w-9 rounded-xl border border-[#2d3d52] bg-[#111e2d] text-sm font-bold text-white hover:border-[#f5ba4b] disabled:opacity-30 flex items-center justify-center transition-all"
                title="Zoom In"
              >
                🔍+
              </button>

              {/* Close Button */}
              <button
                onClick={() => { setViewerOpen(false); resetZoom(); }}
                className="h-9 w-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold hover:bg-red-500/30 flex items-center justify-center ml-2 transition-all"
                title="Close Lightbox"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lightbox Main Image, Touch Swipe & Touch/Mouse Drag Panning Area */}
          <div
            className={`relative flex-1 flex items-center justify-center my-2 overflow-hidden ${zoomLevel > 1.0 ? 'cursor-grab active:cursor-grabbing' : ''
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
            {/* Previous Page Arrow Button (ONLY SHOW WHEN NOT ZOOMED IN TO PREVENT TEXT OVERLAP) */}
            {menuImages.length > 1 && zoomLevel <= 1.0 && (
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/80 border border-[#2d3d52] text-xl text-white hover:border-[#f5ba4b] hover:text-[#f5ba4b] flex items-center justify-center shadow-2xl transition-transform active:scale-90"
                title="Previous Page"
              >
                ←
              </button>
            )}

            {/* Main Interactive Zoomable & Pannable Menu Image */}
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={menuImages[activeImage]?.url}
                alt={`menu-full-${activeImage}`}
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl origin-center"
              />
            </div>

            {/* Next Page Arrow Button (ONLY SHOW WHEN NOT ZOOMED IN TO PREVENT TEXT OVERLAP) */}
            {menuImages.length > 1 && zoomLevel <= 1.0 && (
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/80 border border-[#2d3d52] text-xl text-white hover:border-[#f5ba4b] hover:text-[#f5ba4b] flex items-center justify-center shadow-2xl transition-transform active:scale-90"
                title="Next Page"
              >
                →
              </button>
            )}
          </div>

          {/* Lightbox Bottom Controls & Thumbnail Strip */}
          <div className="z-30 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-[#1d2f43] flex flex-col items-center gap-2 shadow-2xl">
            <p className="text-[10px] text-[#8a9db0] tracking-tight">
              💡 {zoomLevel > 1.0 ? (
                <span className="text-[#f5ba4b]">Drag/Pan with finger to move around zoomed image</span>
              ) : (
                <>
                  <span className="text-[#f5ba4b]">Swipe left/right</span> or use arrows to switch pages • <span className="text-[#f5ba4b]">Double-tap</span> to zoom
                </>
              )}
            </p>

            {menuImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-w-full py-1 scrollbar-hide">
                {menuImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveImage(idx); resetZoom(); }}
                    className={`h-12 w-10 shrink-0 overflow-hidden rounded-lg border-2 bg-black transition-all ${activeImage === idx ? 'border-[#f5ba4b] scale-110 shadow-md shadow-[#f5ba4b]/30' : 'border-[#2d3d52] opacity-50'
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
    </main>
  )
}
