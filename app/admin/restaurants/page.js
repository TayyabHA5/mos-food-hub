'use client'

import Link from 'next/link'
import { useState } from 'react'
import { restaurants as initialRestaurants } from '../../../data/restaurants'

export default function RestaurantsAdminPage() {
  const [restaurantList, setRestaurantList] = useState(initialRestaurants)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filteredRestaurants = restaurantList.filter((restaurant) => restaurant.name.toLowerCase().includes(search.toLowerCase()))

  function addRestaurant(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')
    const cuisine = formData.get('cuisine')
    const floor = formData.get('floor')

    setRestaurantList((current) => [...current, {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      cuisine,
      floor,
      tagline: 'Fresh menu coming soon.',
      logo: '',
      menu: [],
    }])
    setShowForm(false)
    event.currentTarget.reset()
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

        {showForm && <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#2d2925]/50 p-5"><form onSubmit={addRestaurant} className="w-full max-w-md rounded-2xl bg-[#fffaf2] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Add restaurant</h2><button type="button" onClick={() => setShowForm(false)} className="text-xl text-[#806f63]">×</button></div><div className="body-font mt-5 space-y-3"><input required name="name" placeholder="Restaurant name" className="h-11 w-full rounded-lg border border-[#dfd2c4] px-3 text-sm outline-none focus:border-[#b65b2a]" /><input required name="cuisine" placeholder="Cuisine e.g. Fast Food" className="h-11 w-full rounded-lg border border-[#dfd2c4] px-3 text-sm outline-none focus:border-[#b65b2a]" /><select name="floor" className="h-11 w-full rounded-lg border border-[#dfd2c4] bg-white px-3 text-sm"><option>Ground Floor</option><option>1st Floor</option><option>2nd Floor</option></select><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-[#dfd2c4] px-3 py-2 text-xs font-bold">Cancel</button><button type="submit" className="rounded-lg bg-[#b65b2a] px-3 py-2 text-xs font-bold text-white">Create restaurant</button></div></div></form></div>}
      </div>
    </main>
  )
}
