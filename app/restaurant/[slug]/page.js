 'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { restaurants as initialRestaurants } from '../../../data/restaurants'
import { readRestaurants } from '../../../data/restaurant-storage'

const defaultReviews = [
  { name: 'Sara', rating: 5, text: 'Best menu experience. Loved the food quality and portion size.' },
  { name: 'Ali R.', rating: 4, text: 'Really nice flavors and quick service. Good family spot.' },
  { name: 'Hina', rating: 5, text: 'Freshly prepared and delicious. Will definitely come back.' },
]

export default function RestaurantPage({ params }) {
  const [restaurant, setRestaurant] = useState(() => initialRestaurants.find((item) => item.slug === params.slug) || null)

  const [restaurantLogo, setRestaurantLogo] = useState('')
  const [menuImages, setMenuImages] = useState([])
  const [restaurantReviews, setRestaurantReviews] = useState(defaultReviews)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [lastTap, setLastTap] = useState(0)
  const [touchDistance, setTouchDistance] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setRestaurant(readRestaurants().find((item) => item.slug === params.slug) || null)
  }, [params.slug])

  useEffect(() => {
    if (!restaurant) return
    const savedImages = window.localStorage.getItem(`mos-menu-images-${restaurant.slug}`)
    setMenuImages(savedImages ? JSON.parse(savedImages) : [])

    const savedLogo = window.localStorage.getItem(`mos-restaurant-logo-${restaurant.slug}`)
    setRestaurantLogo(savedLogo || '')

    const savedRatings = window.localStorage.getItem(`mos-restaurant-ratings-${restaurant.slug}`)
    if (savedRatings) {
      const parsed = JSON.parse(savedRatings)
      setRestaurantReviews(parsed.reviews || defaultReviews)
    }
  }, [restaurant])

  useEffect(() => {
    if (!viewerOpen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [viewerOpen])

  const averageRating = useMemo(() => {
    if (restaurantReviews.length === 0) return 0
    const total = restaurantReviews.reduce((sum, review) => sum + review.rating, 0)
    return total / restaurantReviews.length
  }, [restaurantReviews])

  function selectImage(index) {
    setActiveImage(index)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  function openImageViewer(index) {
    selectImage(index)
    setViewerOpen(true)
  }

  function handleSubmitReview() {
    if (!rating) return

    const nextReview = {
      name: 'You',
      rating,
      text: reviewText || 'Great food and experience.',
    }

    const nextReviews = [nextReview, ...restaurantReviews]
    setRestaurantReviews(nextReviews)
    setRating(0)
    setReviewText('')
    window.localStorage.setItem(`mos-restaurant-ratings-${restaurant.slug}`, JSON.stringify({ reviews: nextReviews }))
  }

  function handleImageTap() {
    const now = Date.now()
    if (now - lastTap < 250) {
      setZoom((current) => (current >= 2 ? 1 : 2))
      setPosition({ x: 0, y: 0 })
    }
    setLastTap(now)
  }

  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      const distance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      )
      setTouchDistance(distance)
      return
    }

    if (event.touches.length === 1 && zoom > 1) {
      setDragging(true)
      setStartPos({
        x: event.touches[0].clientX - position.x,
        y: event.touches[0].clientY - position.y,
      })
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length === 2 && touchDistance) {
      const distance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      )
      const nextZoom = Math.min(3, Math.max(1, (distance / touchDistance) * zoom))
      setZoom(nextZoom)
      return
    }

    if (dragging && event.touches.length === 1) {
      setPosition({
        x: event.touches[0].clientX - startPos.x,
        y: event.touches[0].clientY - startPos.y,
      })
    }
  }

  function handleTouchEnd() {
    setDragging(false)
    setTouchDistance(null)
  }

  function handleWheel(event) {
    event.preventDefault()
    setZoom((current) => {
      const delta = event.deltaY > 0 ? -0.2 : 0.2
      return Math.min(3, Math.max(1, Number((current + delta).toFixed(2))))
    })
  }

  if (!restaurant) {
    return <main className="min-h-screen bg-[#071722] p-5 text-[#edf5ff]">Restaurant not found.</main>
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071722] text-[#edf5ff]">
      <div className="mx-auto min-h-screen max-w-[440px] px-4 pb-8 pt-4">
        <header className="rounded-[28px] border border-[#1d2f43] bg-[#0a1724] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-[18px] text-[#dfe9f5]">←</Link>
            <div className="flex items-center gap-2 text-center">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#2d3d52] bg-[#111e2d] text-sm font-bold text-[#f5ba4b]">
                {restaurantLogo ? <img src={restaurantLogo} alt={`${restaurant.name} logo`} className="h-full w-full object-cover" /> : restaurant.name.slice(0, 1)}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#f4bd67]">{restaurant.cuisine}</p>
                <h1 className="text-[18px] font-bold text-[#eef6ff]">{restaurant.name}</h1>
              </div>
            </div>
            <span className="rounded-full border border-[#1a4537] bg-[#102d27] px-2 py-1 text-[10px] font-bold text-[#73efb3]">Open</span>
          </div>

          <div className="mt-4 rounded-2xl bg-[#142535] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#efb95d]">Food Court</p>
                <h2 className="mt-1 break-words text-[22px] font-bold text-[#f5f9ff]">{restaurant.tagline}</h2>
              </div>
              <span className="rounded-full border border-[#f1ba5d] bg-[#f4b851] px-2.5 py-1 text-[10px] font-bold text-[#1b1a17]">★ {averageRating.toFixed(1)}</span>
            </div>
            <p className="mt-2 text-[12px] text-[#a7b8c9]">{restaurant.floor} • {restaurant.cuisine}</p>
          </div>
        </header>

        <section className="mt-5 rounded-[24px] border border-[#1d2f43] bg-[#0d1a27] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#d9a95d]">Menu gallery</p>
            <span className="text-[10px] text-[#9ab0c5]">{menuImages.length ? `${activeImage + 1} / ${menuImages.length}` : 'No images yet'}</span>
          </div>

          {menuImages.length > 0 ? (
            <>
              <button type="button" onClick={() => openImageViewer(activeImage)} className="block w-full overflow-hidden rounded-[20px] border border-[#2a3e53] bg-[#0a1724] p-2">
                <img src={menuImages[activeImage]?.url} alt={`${restaurant.name} menu image ${activeImage + 1}`} className="h-[360px] w-full rounded-[16px] object-contain sm:h-[440px]" />
              </button>

              {menuImages.length > 1 && (
                <div className="scrollbar-hidden mt-3 flex gap-2 overflow-x-auto pb-1">
                  {menuImages.map((image, index) => (
                    <button
                      key={`${image.name}-${index}`}
                      type="button"
                      onClick={() => selectImage(index)}
                      className={`h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-0.5 ${activeImage === index ? 'border-[#f5ba4b]' : 'border-[#2a3d4f]'}`}
                      aria-label={`View menu image ${index + 1}`}
                    >
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2b3d50] bg-[#0d1824] p-8 text-center">
              <p className="text-[16px] font-semibold text-[#edf5ff]">No menu images uploaded yet.</p>
              <p className="mt-2 text-[11px] text-[#8fa4b9]">Upload menu pages from the admin panel.</p>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-[24px] border border-[#1d2f43] bg-[#0d1a27] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-[#f5d07b]">
              <span>★</span>
              <span className="font-bold text-[#f5f9ff]">{averageRating.toFixed(1)}</span>
            </div>
            <span className="rounded-full border border-[#24364d] bg-[#101d2b] px-2 py-1 text-[10px] text-[#9ab0c5]">{restaurantReviews.length} ratings</span>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-[26px] ${star <= rating ? 'text-[#f6c55b]' : 'text-[#4d5f75]'}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={3}
            placeholder="Write your review..."
            className="mt-4 w-full resize-none rounded-2xl border border-[#23364c] bg-[#0a1724] p-3 text-[12px] text-[#edf5ff] placeholder:text-[#7e90a3] focus:border-[#f4ba61] focus:outline-none"
          />

          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={!rating}
            className="mt-3 w-full rounded-2xl bg-[#f5ba4b] px-4 py-3 text-[12px] font-bold text-[#171613] disabled:cursor-not-allowed disabled:bg-[#5b6780] disabled:text-[#dfe9f5]"
          >
            Submit Review
          </button>
        </section>

        <section className="mt-5 rounded-[24px] border border-[#1e2d40] bg-[#0d1a27] p-4 shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#d9a95d]">Visitor comments</p>
            <span className="text-[10px] text-[#9ab0c5]">All {restaurantReviews.length} reviews</span>
          </div>

          <div className="mt-4 space-y-3">
            {restaurantReviews.slice(0, 2).map((review, index) => (
              <div key={`${review.name}-${index}`} className="min-w-0 overflow-hidden rounded-2xl border border-[#253548] bg-[#122637] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="break-words text-[12px] font-bold text-[#edf5ff]">{review.name}</span>
                    <span className="shrink-0 whitespace-nowrap text-[#f6bf5a]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <span className="shrink-0 text-[10px] text-[#9ab0c5]">{review.rating}.0</span>
                </div>
                <p className="mt-2 break-words text-[12px] leading-5 text-[#d5deea]">“{review.text}”</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1713]/95 p-3">
          <button type="button" onClick={() => setViewerOpen(false)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white">Close</button>
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-[#120d0b]">
            <button type="button" onClick={() => selectImage((activeImage - 1 + menuImages.length) % menuImages.length)} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-lg text-white">‹</button>
            <button type="button" onClick={() => selectImage((activeImage + 1) % menuImages.length)} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-lg text-white">›</button>
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden" onWheel={handleWheel}>
              <img
                src={menuImages[activeImage]?.url}
                alt={`${restaurant.name} menu image ${activeImage + 1}`}
                className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
                style={{ transform: `scale(${zoom}) translate(${position.x / 10}px, ${position.y / 10}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleImageTap}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold text-white">{activeImage + 1} / {menuImages.length} · pinch or tap to zoom</div>
          </div>
        </div>
      )}
    </main>
  )
}
