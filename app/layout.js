import './globals.css'
import { ThemeProvider } from '../components/ThemeProvider'

export const metadata = {
  title: 'MOS Food Hub | Mall of Sargodha Food Court Directory & Digital Menus',
  description: 'Explore verified restaurant menus, actual prices, opening hours, and floor locations across Mall of Sargodha Food Court (3rd Floor).',
  keywords: ['Mall of Sargodha', 'MOS Food Hub', 'Food Court Sargodha', 'Restaurants Sargodha', 'Digital Menus'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
