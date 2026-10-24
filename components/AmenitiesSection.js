'use client'

export default function AmenitiesSection() {
  const amenities = [
    {
      title: 'Centrally Air Conditioned',
      description: 'Expansive temperature-controlled dining atrium with panoramic high ceilings.',
      icon: (
        <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v18M3 12h18M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" />
        </svg>
      ),
      badge: 'Climate Control',
    },
    {
      title: 'Family & Group Seating',
      description: 'Spacious dining layout with comfortable high chairs for toddlers and family booths.',
      icon: (
        <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      badge: 'Family Dining',
    },
    {
      title: 'Instant QR Digital Menus',
      description: 'Scan table QR codes with your phone to view high-resolution menus and live pricing.',
      icon: (
        <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      badge: 'Contactless',
    },
    {
      title: 'Dedicated Prayer Facilities',
      description: 'Separate, peaceful prayer halls and wudu areas for men and women on Floor 3.',
      icon: (
        <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z" />
        </svg>
      ),
      badge: 'Floor 3',
    },
    {
      title: 'Covered Multi-Level Parking',
      description: 'Secure mall basement parking with direct elevator access straight to the Food Court.',
      icon: (
        <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="22" height="13" rx="2" ry="2" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      ),
      badge: 'Basement Access',
    },
    {
      title: 'Dine-In & Takeout Friendly',
      description: 'Grab a quick bite on the go or enjoy a sit-down meal with friends and family.',
      icon: (
        <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      badge: 'Full Service',
    },
  ]

  return (
    <section id="amenities" className="py-12 border-t border-slate-200">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Visitor Experience
          </span>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Food Court Amenities
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-xl">
            Clean, accessible, and comfortable facilities designed for diners at Mall of Sargodha.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 w-fit shadow-subtle">
          <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Floor 3 Central Atrium</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {amenities.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-subtle transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {item.badge}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
