import Link from 'next/link'

export default function AdminLogin() {
  return (
    <main className="food-pattern flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-sm rounded-3xl bg-[#fffaf2] p-6 shadow-[0_20px_60px_rgba(48,30,18,0.25)] sm:p-8">
        <Link href="/" className="body-font text-[10px] font-bold text-[#b65b2a]">‹ Back to public menu</Link>
        <div className="mt-10">
          <p className="body-font text-[10px] font-bold uppercase tracking-[0.16em] text-[#b65b2a]">MOS Food Hub</p>
          <h1 className="mt-2 text-3xl font-bold text-[#302a24]">Welcome back.</h1>
          <p className="body-font mt-2 text-sm leading-5 text-[#806f63]">Sign in to keep restaurant menus updated.</p>
        </div>
        <form className="body-font mt-8 space-y-4" action="/admin">
          <label className="block text-[11px] font-bold text-[#5f4b3e]">
            Email address
            <input type="email" placeholder="admin@example.com" className="mt-1.5 h-11 w-full rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm font-normal outline-none placeholder:text-[#b6a397] focus:border-[#b65b2a] focus:ring-2 focus:ring-[#e9c6ab]" />
          </label>
          <label className="block text-[11px] font-bold text-[#5f4b3e]">
            Password
            <input type="password" placeholder="Enter your password" className="mt-1.5 h-11 w-full rounded-xl border border-[#dfd2c4] bg-white px-3 text-sm font-normal outline-none placeholder:text-[#b6a397] focus:border-[#b65b2a] focus:ring-2 focus:ring-[#e9c6ab]" />
          </label>
          <button type="submit" className="h-11 w-full rounded-xl bg-[#b65b2a] text-sm font-bold text-white transition hover:bg-[#9d481f]">Sign in to dashboard</button>
        </form>
        <p className="body-font mt-6 text-center text-[10px] text-[#a18b7d]">Single administrator access</p>
      </section>
    </main>
  )
}
