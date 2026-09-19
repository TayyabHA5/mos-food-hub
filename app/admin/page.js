 'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { restaurants as initialRestaurants } from '../../data/restaurants'

export default function AdminDashboard() {
  const [restaurantList, setRestaurantList] = useState(initialRestaurants)

  useEffect(() => {
    const savedRestaurants = JSON.parse(window.localStorage.getItem('mos-restaurants') || 'null')
    if (Array.isArray(savedRestaurants)) {
      setRestaurantList(savedRestaurants)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f4efe7] text-[#302a24]">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="hidden w-60 shrink-0 border-r border-[#dfd2c4] bg-[#2d2925] p-6 text-[#fff8ea] md:block">
          <p className="body-font text-[9px] font-bold uppercase tracking-[0.18em] text-[#e9ad7d]">MOS Food Hub</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight">Menu<br />manager</h1>
          <nav className="body-font mt-12 space-y-2 text-sm">
            <Link href="/admin" className="block rounded-xl bg-[#b65b2a] px-3 py-2.5 font-bold">Overview</Link>
            <Link href="/admin/restaurants" className="block px-3 py-2.5 text-[#cfc0b3] transition hover:text-white">Restaurants</Link>
            <Link href="/admin/menu-images" className="block px-3 py-2.5 text-[#cfc0b3] transition hover:text-white">Menu images</Link>
          </nav>
          <div className="body-font mt-auto pt-16 text-[10px] leading-4 text-[#a99a8e]">Single admin workspace<br />Database connection pending</div>
        </aside>

        <section className="min-w-0 flex-1 p-5 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="body-font text-[10px] font-bold uppercase tracking-[0.16em] text-[#b65b2a]">Admin workspace</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">Good morning.</h2>
              <p className="body-font mt-2 text-sm text-[#806f63]">Keep the food court menu fresh and accurate.</p>
            </div>
            <Link href="/" className="body-font rounded-xl border border-[#d9c8b8] bg-[#fffaf2] px-3 py-2 text-[11px] font-bold text-[#805239]">View public menu ↗</Link>
          </header>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Restaurants', restaurantList.length, 'Published locations'],
              ['Menu format', 'Images', 'Image-first public menus'],
              ['Menu status', 'Live', 'Public view is active'],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-4 shadow-[0_4px_14px_rgba(105,66,35,0.05)]">
                <p className="body-font text-[10px] font-bold uppercase tracking-[0.12em] text-[#997967]">{label}</p>
                <p className="mt-3 text-2xl font-bold text-[#382e28]">{value}</p>
                <p className="body-font mt-1 text-[10px] text-[#917d6e]">{detail}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-[#e3d5c8] bg-[#fffaf2] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Restaurants</h3>
                <p className="body-font mt-1 text-[11px] text-[#917d6e]">Manage the menus shown to customers.</p>
              </div>
              <Link href="/admin/restaurants?new=true" className="body-font rounded-xl bg-[#b65b2a] px-3 py-2 text-[10px] font-bold text-white">+ Add restaurant</Link>
            </div>
            <div className="mt-5 divide-y divide-[#eee3d9]">
              {restaurantList.map((restaurant) => (
                <div key={restaurant.slug} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="food-pattern flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white">{restaurant.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{restaurant.name}</p>
                    <p className="body-font mt-0.5 text-[10px] text-[#917d6e]">{restaurant.cuisine} · {restaurant.menu.length} categories</p>
                  </div>
                  <span className="body-font rounded-full bg-[#d9f5df] px-2 py-1 text-[9px] font-bold text-[#168146]">Published</span>
                  <Link href={`/admin/restaurants/${restaurant.slug}`} className="body-font rounded-lg border border-[#dfd2c4] px-2.5 py-1.5 text-[10px] font-bold text-[#805239]">Edit</Link>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
