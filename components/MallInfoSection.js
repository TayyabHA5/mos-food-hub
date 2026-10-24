'use client'

export default function MallInfoSection() {
  return (
    <section id="mall-guide" className="py-12 border-t border-slate-200 dark:border-zinc-800">
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-3">
              <svg className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
              </svg>
              <span>Mall of Sargodha Visitor Guide</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Floor Location & Operating Hours
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              Located on the 3rd floor of Mall of Sargodha, the food court houses national fast food favorites, crispy broast, gourmet pizzas, and traditional specialties in a single central dining hall.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  <svg className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Food Court Hours</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">11:00 AM – 12:00 AM (Midnight)</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">Open 7 days a week, all year round.</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  <svg className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Floor Location</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">3rd Floor (Central Elevators)</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">Accessible directly from basement parking.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <svg className="h-4 w-4 text-slate-600 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Mall Navigation</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                Mall of Sargodha, University Road, Sargodha, Punjab, Pakistan.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Information Desk</span>
                <span className="text-slate-900 dark:text-white font-semibold">Ground Floor Atrium</span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Verified Menu Database</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Digital menu scans updated directly by outlet operators.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
