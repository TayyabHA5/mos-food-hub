'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { defaultFloors, restaurants as initialRestaurants } from '../../../data/restaurants'
import { readRestaurants, writeRestaurants } from '../../../data/restaurant-storage'

export default function RestaurantsAdminPage() {
  const [restaurantList, setRestaurantList] = useState(initialRestaurants)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [floors, setFloors] = useState(defaultFloors)
  const [selectedFloor, setSelectedFloor] = useState(defaultFloors[0])
  const [newFloor, setNewFloor] = useState('')
  const [showFloorInput, setShowFloorInput] = useState(false)

  useEffect(() => {
    setRestaurantList(readRestaurants())

    const savedFloors = JSON.parse(window.localStorage.getItem('mos-floors') || 'null')
    if (Array.isArray(savedFloors) && savedFloors.length) {
      setFloors(savedFloors)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('mos-floors', JSON.stringify(floors))
  }, [floors])

  const filteredRestaurants = restaurantList.filter((restaurant) => restaurant.name.toLowerCase().includes(search.toLowerCase()))

  function addRestaurant(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const cuisine = String(formData.get('cuisine') || '').trim()
    const floor = String(formData.get('floor') || '').trim()
    const tagsInput = String(formData.get('tags') || '').trim()
    const tags = tagsInput ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean) : []

    const newRestaurant = {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      cuisine,
      floor,
      tagline: 'Fresh menu coming soon.',
      tags,
      logo: '',
      menu: [],
      searchText: [name, cuisine, floor, ...tags].join(' ').toLowerCase(),
    }

    setRestaurantList((current) => [...current, newRestaurant])
    writeRestaurants([...restaurantList, newRestaurant])
    setShowForm(false)
    event.currentTarget.reset()
  }

  function handleAddFloor() {
    const trimmed = newFloor.trim()
    if (!trimmed) return

    setFloors((current) => {
      const next = [...new Set([...current, trimmed])]
      return next
    })
    setSelectedFloor(trimmed)
    setNewFloor('')
    setShowFloorInput(false)
  }

  return (
    <main className="min-h-screen bg-[#f4efe7] text-[#302a24]">
      <div className="mx-auto min-h-screen max-w-6xl p-5 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin" className="body-font text-[10px] font-bold text-[#b65b2a]">‹ Back to overview</Link>
            <p className="body-font mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b65b2a]">Content management</p>
            <h1 className="mt-1 text-3xl font-bold">Restaurants</h1>
            <p className="body-font mt-2 text-sm text-[#806f63]">Add and maintain the locations shown in the public menu.</p>
          </div>
          <button type="button" onClick={() => setShowForm(true)} className="body-font rounded-xl bg-[#b65b2a] px-4 py-2.5 text-[11px] font-bold text-white">+ Add restaurant</button>
        </header>

        <section className="mt-8 rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="body-font text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">{restaurantList.length} restaurants</p>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search restaurants" className="body-font h-9 rounded-lg border border-[#dfd2c4] bg-white px-3 text-[11px] outline-none focus:border-[#b65b2a]" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="body-font w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-[#eadfd3] text-[9px] uppercase tracking-[0.12em] text-[#997967]"><tr><th className="pb-3">Restaurant</th><th className="pb-3">Cuisine</th><th className="pb-3">Menu</th><th className="pb-3">Status</th><th className="pb-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-[#eee3d9]">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.slug}>
                    <td className="py-4"><div className="flex items-center gap-3"><span className="food-pattern flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white">{restaurant.name.slice(0, 1)}</span><span className="font-bold">{restaurant.name}<small className="mt-1 block text-[10px] font-normal text-[#917d6e]">{restaurant.floor}</small></span></div></td>
                    <td className="py-4 text-[#806f63]">{restaurant.cuisine}</td>
                    <td className="py-4 text-[#806f63]">{restaurant.menu.reduce((total, category) => total + category.items.length, 0)} items</td>
                    <td className="py-4"><span className="rounded-full bg-[#d9f5df] px-2 py-1 text-[9px] font-bold text-[#168146]">Published</span></td>
                    <td className="py-4 text-right"><Link href={`/admin/restaurants/${restaurant.slug}`} className="rounded-lg border border-[#dfd2c4] px-3 py-1.5 font-bold text-[#805239]">Manage</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#2d2925]/55 p-5 backdrop-blur-[1px]">
            <form onSubmit={addRestaurant} className="w-full max-w-lg rounded-[28px] border border-[#ead8c7] bg-[#fffaf2] p-5 shadow-[0_24px_60px_rgba(45,41,37,0.18)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="body-font text-[10px] font-bold uppercase tracking-[0.18em] text-[#b65b2a]">New restaurant</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#2d2925]">Add restaurant</h2>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd2c4] bg-[#f9f2ea] text-xl leading-none text-[#806f63] transition hover:bg-[#f3e8df]">×</button>
              </div>

              <div className="body-font mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">Restaurant name</label>
                  <input required name="name" placeholder="e.g. Pizza Point" className="h-11 w-full rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm text-[#2d2925] placeholder:text-[#9a8171] outline-none transition focus:border-[#b65b2a] focus:ring-2 focus:ring-[#f0d4b6]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">Cuisine</label>
                    <input required name="cuisine" placeholder="e.g. Fast Food" className="h-11 w-full rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm text-[#2d2925] placeholder:text-[#9a8171] outline-none transition focus:border-[#b65b2a] focus:ring-2 focus:ring-[#f0d4b6]" />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">Floor</label>
                    <select
                      name="floor"
                      value={selectedFloor}
                      onChange={(event) => {
                        const value = event.target.value
                        if (value === '__add_new_floor__') {
                          setShowFloorInput(true)
                          return
                        }
                        setSelectedFloor(value)
                        setShowFloorInput(false)
                      }}
                      className="h-11 w-full rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm text-[#2d2925] outline-none transition focus:border-[#b65b2a] focus:ring-2 focus:ring-[#f0d4b6]"
                    >
                      {floors.map((floor) => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                      <option value="__add_new_floor__">Add new floor</option>
                    </select>

                    {showFloorInput && (
                      <div role="dialog" aria-label="Add new floor" className="mt-3 rounded-2xl border border-[#e8cdb7] bg-[#fff7ed] p-3 shadow-[0_10px_24px_rgba(96,55,31,0.1)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-[#5b3827]">Add new floor</p>
                            <p className="mt-1 text-[10px] text-[#917d6e]">Enter the floor name to add it to this list.</p>
                          </div>
                          <button type="button" onClick={() => { setShowFloorInput(false); setNewFloor('') }} aria-label="Close add floor dialog" className="text-lg leading-none text-[#997967]">×</button>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <input autoFocus value={newFloor} onChange={(event) => setNewFloor(event.target.value)} placeholder="e.g. 3rd Floor" className="h-10 min-w-0 flex-1 rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm placeholder:text-[#9a8171] outline-none transition focus:border-[#b65b2a] focus:ring-2 focus:ring-[#f0d4b6]" />
                          <button type="button" onClick={handleAddFloor} className="rounded-xl bg-[#b65b2a] px-4 py-2 text-[10px] font-bold text-white">Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">Tags</label>
                  <input name="tags" placeholder="pizza, burger, family" className="h-11 w-full rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm text-[#2d2925] placeholder:text-[#9a8171] outline-none transition focus:border-[#b65b2a] focus:ring-2 focus:ring-[#f0d4b6]" />
                  <p className="mt-2 text-[10px] text-[#917d6e]">Separate tags with commas for better search results.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#dfd2c4] bg-[#f8f2ec] px-4 py-2.5 text-[11px] font-bold text-[#5b4e45] transition hover:bg-[#f2e5d8]">Cancel</button>
                  <button type="submit" className="rounded-xl bg-[#b65b2a] px-4 py-2.5 text-[11px] font-bold text-white shadow-[0_10px_25px_rgba(182,91,42,0.28)] transition hover:bg-[#9d4920]">Create restaurant</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
