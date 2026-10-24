'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { restaurants as initialRestaurants } from '../../../data/restaurants'
import { readRestaurants } from '../../../data/restaurant-storage'

export default function MenuImagesAdminPage() {
  const [restaurantList, setRestaurantList] = useState(initialRestaurants)
  const [restaurantSlug, setRestaurantSlug] = useState(initialRestaurants[0]?.slug || '')
  const [images, setImages] = useState(null)
  const restaurant = restaurantList.find((item) => item.slug === restaurantSlug) || restaurantList[0]

  useEffect(() => {
    const savedRestaurants = readRestaurants()
    setRestaurantList(savedRestaurants)
    const requestedRestaurant = new URLSearchParams(window.location.search).get('restaurant')
    if (savedRestaurants.some((item) => item.slug === requestedRestaurant)) {
      setRestaurantSlug(requestedRestaurant)
    } else if (savedRestaurants.length) {
      setRestaurantSlug(savedRestaurants[0].slug)
    }
  }, [])

  useEffect(() => {
    const savedImages = window.localStorage.getItem(`mos-menu-images-${restaurantSlug}`)
    setImages(savedImages ? JSON.parse(savedImages) : [])
  }, [restaurantSlug])

  useEffect(() => {
    if (images === null) return

    if (images.length > 0) {
      window.localStorage.setItem(`mos-menu-images-${restaurantSlug}`, JSON.stringify(images))
    } else {
      window.localStorage.removeItem(`mos-menu-images-${restaurantSlug}`)
    }
  }, [images, restaurantSlug])

  function handleUpload(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const confirmed = window.confirm(`Upload ${files.length} menu image${files.length === 1 ? '' : 's'} for ${restaurant?.name || 'outlet'}?`)
    if (!confirmed) {
      event.target.value = ''
      return
    }

    Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, url: reader.result })
      reader.onerror = reject
      reader.readAsDataURL(file)
    }))).then((previews) => {
      setImages((current) => [...(current || []), ...previews])
    })
    event.target.value = ''
  }

  function removeImage(index) {
    if (!window.confirm(`Remove menu page ${index + 1}?`)) return
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
  }

  function moveImage(index, direction) {
    setImages((current) => {
      const next = [...current]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= next.length) return current
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 font-sans">
      <div className="mx-auto min-h-screen max-w-5xl p-5 sm:p-8">
        <Link href="/admin" className="text-xs font-bold text-[#f5ba4b] hover:underline">‹ Back to overview</Link>
        <header className="mt-8 flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f5ba4b]">Content management</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Menu images</h1>
            <p className="mt-2 text-xs text-zinc-400">Upload complete menu pages directly for directory preview.</p>
          </div>
          <label className="cursor-pointer rounded-xl bg-[#f5ba4b] hover:bg-[#f6c360] px-4 py-2.5 text-xs font-bold text-black transition-colors shadow-md">
            + Upload images
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleUpload} className="sr-only" />
          </label>
        </header>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#f5ba4b]">
              Restaurant
              <select
                value={restaurantSlug}
                onChange={(event) => setRestaurantSlug(event.target.value)}
                className="ml-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-normal text-white normal-case tracking-normal outline-none focus:border-[#f5ba4b]"
              >
                {restaurantList.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
            <span className="text-xs font-mono text-zinc-400">{images?.length || 0} uploaded pages</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(images || []).map((image, index) => (
              <article key={`${image.name}-${index}`} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <img src={image.url} alt={`Menu page ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-white">Page {index + 1}</p>
                    <button type="button" onClick={() => removeImage(index)} className="text-xs font-bold text-rose-400 hover:text-rose-300">Remove</button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded-md border border-zinc-800 bg-black px-2 py-1 text-[10px] font-bold text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40">Move left</button>
                    <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded-md border border-zinc-800 bg-black px-2 py-1 text-[10px] font-bold text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40">Move right</button>
                  </div>
                </div>
              </article>
            ))}
            {(!images || images.length === 0) && (
              <label className="col-span-full flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center hover:border-zinc-700 transition-colors">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-2xl text-[#f5ba4b]">▧</span>
                <p className="mt-4 text-sm font-bold text-white">Upload menu pages</p>
                <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-400">Select one or more JPG, PNG or WebP images. Customers will view these pages on the restaurant menu.</p>
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleUpload} className="sr-only" />
              </label>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
