'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-600 dark:text-zinc-400 text-xs transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-black font-bold text-sm">
                M
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">MOS Food Hub</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              The official centralized digital food court directory for Mall of Sargodha. Explore restaurant menus, pricing, and floor guides in real time.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              Mall of Sargodha · University Road, Sargodha, Punjab, Pakistan
            </p>
          </div>

          {/* Col 2: Directory Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Directory</p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#directory" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  All Restaurants
                </a>
              </li>
              <li>
                <a href="#amenities" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Food Court Amenities
                </a>
              </li>
              <li>
                <a href="#mall-guide" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Floor & Hours Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Management */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Management</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin/login" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Outlet Partner Login
                </Link>
              </li>
              <li>
                <Link href="/admin/super" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Mall Admin Panel
                </Link>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  Directory Live
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} MOS Food Hub · Mall of Sargodha. All rights reserved.</p>
          <p className="text-slate-400 dark:text-zinc-500">
            Official digital menu directory. Designed for mobile and desktop diners.
          </p>
        </div>
      </div>
    </footer>
  )
}
