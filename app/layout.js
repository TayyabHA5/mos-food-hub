import './globals.css'

// Note: Google Fonts (Fraunces + Inter) is project mein use karne ke liye
// banaya gaya hai — apne computer pe `npm run dev` chalate waqt yeh
// automatically Google se fetch ho jayengi (internet chahiye hoga).
// Filhaal hum globals.css mein system fonts se kaam chala rahe hain
// taake sandbox testing mein koi masla na ho.

export const metadata = {
  title: 'MOS Food Hub',
  description: 'Browse every Mall of Sargodha restaurant and menu in one place.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ur">
      <body className="font-body bg-charcoal text-cream antialiased">{children}</body>
    </html>
  )
}
