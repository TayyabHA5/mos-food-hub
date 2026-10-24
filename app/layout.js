import './globals.css'

export const metadata = {
  title: 'MOS Food Hub | Mall of Sargodha Food Court Directory & Digital Menus',
  description: 'Explore verified restaurant menus, actual prices, opening hours, and floor locations across Mall of Sargodha Food Court (3rd Floor).',
  keywords: ['Mall of Sargodha', 'MOS Food Hub', 'Food Court Sargodha', 'Restaurants Sargodha', 'Digital Menus'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
