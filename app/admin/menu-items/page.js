'use client'

import Link from 'next/link'
import { useState } from 'react'
import { restaurants } from '../../../data/restaurants'

export default function MenuItemsAdminPage() {
  const [restaurantSlug, setRestaurantSlug] = useState(restaurants[0].slug)
  const [availableItems, setAvailableItems] = useState(() => new Set(restaurants.flatMap((restaurant) => restaurant.menu.flatMap((category) => category.items.map((item) => item.name)))))
  const [menuItemsByRestaurant, setMenuItemsByRestaurant] = useState(() => Object.fromEntries(restaurants.map((restaurant) => [restaurant.slug, restaurant.menu.flatMap((category) => category.items.map((item) => ({ ...item, category: category.category })))])))
  const [showForm, setShowForm] = useState(false)
  const restaurant = restaurants.find((item) => item.slug === restaurantSlug)
  const items = menuItemsByRestaurant[restaurantSlug]

  function toggleItem(name) {
    setAvailableItems((current) => {
      const next = new Set(current)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function addMenuItem(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const item = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      category: formData.get('category'),
    }

    setMenuItemsByRestaurant((current) => ({ ...current, [restaurantSlug]: [...current[restaurantSlug], item] }))
    setAvailableItems((current) => new Set([...current, item.name]))
    setShowForm(false)
    event.currentTarget.reset()
  }

  return (
    <main className="min-h-screen bg-[#f4efe7] text-[#302a24]">
      <div className="mx-auto min-h-screen max-w-5xl p-5 sm:p-8">
        <Link href="/admin" className="body-font text-[10px] font-bold text-[#b65b2a]">‹ Back to overview</Link>
        <header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="body-font text-[10px] font-bold uppercase tracking-[0.16em] text-[#b65b2a]">Content management</p><h1 className="mt-1 text-3xl font-bold">Menu items</h1><p className="body-font mt-2 text-sm text-[#806f63]">Update prices and availability before publishing.</p></div><button type="button" onClick={() => setShowForm(true)} className="body-font rounded-xl bg-[#b65b2a] px-4 py-2.5 text-[11px] font-bold text-white">+ Add menu item</button></header>
        <section className="mt-8 rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><label className="body-font text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">Restaurant<select value={restaurantSlug} onChange={(event) => setRestaurantSlug(event.target.value)} className="ml-3 rounded-lg border border-[#dfd2c4] bg-white px-3 py-2 text-xs font-normal normal-case tracking-normal outline-none"><option value="karachi-broast">Karachi Broast</option>{restaurants.slice(1).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><span className="body-font text-[10px] text-[#917d6e]">{items.length} items</span></div><div className="mt-5 overflow-x-auto"><table className="body-font w-full min-w-[600px] text-left text-xs"><thead className="border-b border-[#eadfd3] text-[9px] uppercase tracking-[0.12em] text-[#997967]"><tr><th className="pb-3">Item</th><th className="pb-3">Category</th><th className="pb-3">Price</th><th className="pb-3">Availability</th><th className="pb-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#eee3d9]">{items.map((item) => { const isAvailable = availableItems.has(item.name); return <tr key={item.name}><td className="py-4 font-bold">{item.name}</td><td className="py-4 text-[#806f63]">{item.category}</td><td className="py-4 font-bold text-[#b65b2a]">Rs. {item.price.toLocaleString()}</td><td className="py-4"><button type="button" onClick={() => toggleItem(item.name)} aria-pressed={isAvailable} className={`rounded-full px-2 py-1 text-[9px] font-bold ${isAvailable ? 'bg-[#d9f5df] text-[#168146]' : 'bg-[#f5e0d8] text-[#a33e2b]'}`}>{isAvailable ? 'Available' : 'Unavailable'}</button></td><td className="py-4 text-right"><button type="button" className="rounded-lg border border-[#dfd2c4] px-3 py-1.5 font-bold text-[#805239]">Edit</button></td></tr> })}</tbody></table></div></section>
        {showForm && <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#2d2925]/50 p-5"><form onSubmit={addMenuItem} className="w-full max-w-md rounded-2xl bg-[#fffaf2] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Add menu item</h2><button type="button" onClick={() => setShowForm(false)} className="text-xl text-[#806f63]">×</button></div><div className="body-font mt-5 space-y-3"><input required name="name" placeholder="Item name" className="h-11 w-full rounded-lg border border-[#dfd2c4] px-3 text-sm outline-none focus:border-[#b65b2a]" /><textarea required name="description" placeholder="Short description" rows="3" className="w-full rounded-lg border border-[#dfd2c4] p-3 text-sm outline-none focus:border-[#b65b2a]" /><div className="grid grid-cols-2 gap-3"><input required min="1" type="number" name="price" placeholder="Price (Rs.)" className="h-11 rounded-lg border border-[#dfd2c4] px-3 text-sm outline-none focus:border-[#b65b2a]" /><select name="category" className="h-11 rounded-lg border border-[#dfd2c4] bg-white px-3 text-sm">{restaurant.menu.length ? restaurant.menu.map((category) => <option key={category.category}>{category.category}</option>) : <option>General</option>}</select></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-[#dfd2c4] px-3 py-2 text-xs font-bold">Cancel</button><button type="submit" className="rounded-lg bg-[#b65b2a] px-3 py-2 text-xs font-bold text-white">Add item</button></div></div></form></div>}
      </div>
    </main>
  )
}
