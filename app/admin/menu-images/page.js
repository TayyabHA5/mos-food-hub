'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { restaurants } from '../../../data/restaurants'

export default function MenuImagesAdminPage() {
  const [restaurantSlug, setRestaurantSlug] = useState(restaurants[0].slug)
  const [images, setImages] = useState(null)
  const restaurant = restaurants.find((item) => item.slug === restaurantSlug)

  useEffect(() => {
    const requestedRestaurant = new URLSearchParams(window.location.search).get('restaurant')
    if (restaurants.some((item) => item.slug === requestedRestaurant)) {
      setRestaurantSlug(requestedRestaurant)
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

    const confirmed = window.confirm(`Upload ${files.length} menu image${files.length === 1 ? '' : 's'} for ${restaurant.name}?`)
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
    <main className="min-h-screen bg-[#f4efe7] text-[#302a24]">
      <div className="mx-auto min-h-screen max-w-5xl p-5 sm:p-8">
        <Link href="/admin" className="body-font text-[10px] font-bold text-[#b65b2a]">‹ Back to overview</Link>
        <header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="body-font text-[10px] font-bold uppercase tracking-[0.16em] text-[#b65b2a]">Content management</p><h1 className="mt-1 text-3xl font-bold">Menu images</h1><p className="body-font mt-2 text-sm text-[#806f63]">Upload complete menu pages instead of entering every item manually.</p></div><label className="body-font cursor-pointer rounded-xl bg-[#b65b2a] px-4 py-2.5 text-[11px] font-bold text-white">+ Upload images<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleUpload} className="sr-only" /></label></header>

        <section className="mt-8 rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="body-font text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">Restaurant<select value={restaurantSlug} onChange={(event) => setRestaurantSlug(event.target.value)} className="ml-3 rounded-lg border border-[#dfd2c4] bg-white px-3 py-2 text-xs font-normal normal-case tracking-normal outline-none"><option value={restaurant.slug}>{restaurant.name}</option>{restaurants.filter((item) => item.slug !== restaurant.slug).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <span className="body-font text-[10px] text-[#917d6e]">{images?.length || 0} uploaded pages</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(images || []).map((image, index) => <article key={`${image.name}-${index}`} className="overflow-hidden rounded-xl border border-[#eadfd3] bg-white"><img src={image.url} alt={`Menu page ${index + 1}`} className="aspect-[3/4] w-full object-cover" /><div className="body-font p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-[10px] font-bold">Page {index + 1}</p><button type="button" onClick={() => removeImage(index)} className="text-[10px] font-bold text-[#a33e2b]">Remove</button></div><div className="mt-2 flex gap-2"><button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded-md border border-[#dfd2c4] px-2 py-1 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-40">Move left</button><button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded-md border border-[#dfd2c4] px-2 py-1 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-40">Move right</button></div></div></article>)}{(!images || images.length === 0) && <label className="body-font col-span-full flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#c9b8aa] bg-[#fdf8f0] p-6 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e8dc] text-2xl text-[#b65b2a]">▧</span><p className="mt-4 text-sm font-bold">Upload menu pages</p><p className="mt-2 max-w-xs text-[10px] leading-4 text-[#917d6e]">Select one or more JPG, PNG or WebP images. Customers will view these pages on the restaurant menu.</p><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleUpload} className="sr-only" /></label>}</div>
        </section>
      </div>
    </main>
  )
}