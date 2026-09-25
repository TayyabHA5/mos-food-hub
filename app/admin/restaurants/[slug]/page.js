'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { defaultFloors as initialFloors } from '../../../../data/restaurants'
import { readRestaurants, writeRestaurants } from '../../../../data/restaurant-storage'

export default function RestaurantEditor({ params }) {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState(null)
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [tagline, setTagline] = useState('')
  const [floors, setFloors] = useState(initialFloors)
  const [floor, setFloor] = useState(initialFloors[0])
  const [published, setPublished] = useState(true)
  const [saved, setSaved] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    let savedFloors = initialFloors
    try {
      const storedFloors = JSON.parse(window.localStorage.getItem('mos-floors') || 'null')
      if (Array.isArray(storedFloors) && storedFloors.length) savedFloors = storedFloors
    } catch (error) {
      savedFloors = initialFloors
    }

    const foundRestaurant = readRestaurants().find((item) => item.slug === params.slug)
    setRestaurant(foundRestaurant || null)
    if (!foundRestaurant) return
    setFloors([...new Set([...savedFloors, foundRestaurant.floor].filter(Boolean))])
    setRestaurantName(foundRestaurant.name)
    setCuisine(foundRestaurant.cuisine)
    setTagline(foundRestaurant.tagline)
    setFloor(foundRestaurant.floor || defaultFloors[0])
    setLogoUrl(window.localStorage.getItem(`mos-restaurant-logo-${foundRestaurant.slug}`) || '')
  }, [params.slug])

  function handleLogoUpload(event) {
    const file = event.target.files?.[0]
    if (!file || !restaurant) return
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, 800 / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/jpeg', 0.85)
        setLogoUrl(imageData)
        window.localStorage.setItem(`mos-restaurant-logo-${restaurant.slug}`, imageData)
        setSaved(false)
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function handleSaveChanges() {
    if (!restaurant) return
    const nextRestaurants = readRestaurants().map((item) => item.slug === restaurant.slug ? {
      ...item,
      name: restaurantName.trim() || item.name,
      cuisine: cuisine.trim() || item.cuisine,
      tagline: tagline.trim() || item.tagline,
      floor,
      searchText: [restaurantName, cuisine, tagline, floor, ...(item.tags || []), ...(item.menu || []).flatMap((category) => (category.items || []).map((item) => item.name))].join(' ').toLowerCase(),
    } : item)
    writeRestaurants(nextRestaurants)
    setRestaurant(nextRestaurants.find((item) => item.slug === restaurant.slug))
    setSaved(true)
  }

  function handleDeleteRestaurant() {
    if (!restaurant || !window.confirm(`Delete ${restaurant.name}?`)) return
    writeRestaurants(readRestaurants().filter((item) => item.slug !== restaurant.slug))
    window.localStorage.removeItem(`mos-restaurant-logo-${restaurant.slug}`)
    window.localStorage.removeItem(`mos-menu-images-${restaurant.slug}`)
    window.localStorage.removeItem(`mos-restaurant-ratings-${restaurant.slug}`)
    router.push('/admin/restaurants')
  }

  const defaultFloors = floors

  if (!restaurant) return <main className="min-h-screen bg-[#f4efe7] p-5 text-[#302a24]">Restaurant not found.</main>

  return (
    <main className="min-h-screen bg-[#f4efe7] text-[#302a24]">
      <div className="mx-auto min-h-screen max-w-5xl p-5 sm:p-8">
        <Link href="/admin/restaurants" className="body-font text-[10px] font-bold text-[#b65b2a]">‹ Back to restaurants</Link>
        <header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="body-font text-[10px] font-bold uppercase tracking-[0.16em] text-[#b65b2a]">Restaurant settings</p><h1 className="mt-1 text-3xl font-bold">{restaurantName}</h1><p className="body-font mt-2 text-sm text-[#806f63]">Update public information and manage its menu.</p></div><span className="body-font rounded-full bg-[#d9f5df] px-3 py-1.5 text-[10px] font-bold text-[#168146]">{published ? 'Published' : 'Hidden'}</span></header>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-5"><h2 className="text-lg font-bold">Restaurant details</h2><div className="body-font mt-5 space-y-4"><label className="block text-[11px] font-bold">Name<input value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfd2c4] bg-white px-3 text-sm font-normal outline-none focus:border-[#b65b2a]" /></label><label className="block text-[11px] font-bold">Cuisine<input value={cuisine} onChange={(event) => setCuisine(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfd2c4] bg-white px-3 text-sm font-normal outline-none focus:border-[#b65b2a]" /></label><label className="block text-[11px] font-bold">Tagline<textarea value={tagline} onChange={(event) => setTagline(event.target.value)} rows="3" className="mt-1.5 w-full rounded-lg border border-[#dfd2c4] bg-white p-3 text-sm font-normal outline-none focus:border-[#b65b2a]" /></label><label className="block text-[11px] font-bold">Floor<select value={floor} onChange={(event) => setFloor(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfd2c4] bg-white px-3 text-sm font-normal outline-none focus:border-[#b65b2a]">{defaultFloors.map((floorOption) => <option key={floorOption}>{floorOption}</option>)}</select></label><div className="rounded-xl border border-[#eadfd3] bg-[#fdf8f0] p-3"><p className="text-[11px] font-bold">Restaurant logo</p><div className="mt-3 flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[#dfd2c4] bg-gradient-to-br from-[#f5d2ad] via-[#d99058] to-[#944421] text-xl font-bold text-[#fffaf2] shadow-sm">{logoUrl ? <img src={logoUrl} alt={`${restaurantName} logo`} className="h-full w-full object-cover" /> : restaurantName.slice(0, 1)}</div><label className="body-font cursor-pointer rounded-lg bg-[#f5e8dc] px-3 py-2 text-[10px] font-bold text-[#805239]">Upload logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="sr-only" /></label></div></div><div className="flex items-center justify-between rounded-xl bg-[#f7eee5] p-3"><div><p className="text-xs font-bold">Show in public menu</p><p className="body-font mt-1 text-[10px] text-[#917d6e]">Hide this restaurant temporarily.</p></div><button type="button" aria-pressed={published} onClick={() => setPublished(!published)} className={`h-6 w-11 rounded-full p-1 transition ${published ? 'bg-[#b65b2a]' : 'bg-[#c9b8aa]'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${published ? 'translate-x-5' : ''}`} /></button></div><div className="flex gap-2"><button type="button" onClick={handleSaveChanges} className="flex-1 rounded-lg bg-[#b65b2a] py-2.5 text-xs font-bold text-white">Save changes</button><button type="button" onClick={handleDeleteRestaurant} className="rounded-lg border border-[#e5b8aa] px-4 py-2.5 text-xs font-bold text-[#b34532]">Delete</button></div>{saved && <p className="text-center text-[10px] font-bold text-[#168146]">Changes saved.</p>}</div></section>
          <section className="rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Menu images</h2><p className="body-font mt-1 text-[10px] text-[#917d6e]">Upload the restaurant&apos;s latest menu pages.</p></div><Link href={`/admin/menu-images?restaurant=${restaurant.slug}`} className="body-font rounded-lg bg-[#f5e8dc] px-2.5 py-2 text-[10px] font-bold text-[#805239]">Manage images</Link></div><div className="body-font mt-5 rounded-xl border border-dashed border-[#c9b8aa] bg-[#fdf8f0] p-5 text-center"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e8dc] text-xl text-[#b65b2a]">▧</span><p className="mt-3 text-xs font-bold">No uploaded pages yet</p><p className="mt-1 text-[10px] text-[#917d6e]">Add menu images from the image manager.</p></div></section>
        </div>
      </div>
    </main>
  )
}
