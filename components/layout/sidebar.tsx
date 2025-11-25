'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { label: 'Home', icon: '📊', href: '/' },
    { label: 'Dashboard', icon: '📈', href: '/dashboard' },
    { label: 'Stocks', icon: '📉', href: '/stocks' },
    { label: 'Orders', icon: '⚡', href: '/orders' },
    { label: 'Backtest', icon: '🤖', href: '/backtest' },
    { label: 'Community', icon: '👥', href: '/community' },
  ]

  // On mobile, sidebar should be overlay
  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen fixed left-0 top-0 flex flex-col`

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-sidebar-primary">InvestIQ</h1>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-sidebar-accent rounded md:hidden"
            >
              ✕
            </button>
            {!isMobile && (
              <button
                onClick={onToggle}
                className="p-1 hover:bg-sidebar-accent rounded hidden md:block"
              >
                ←
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map(item => (
            <Link key={item.href} href={item.href} onClick={isMobile ? onToggle : undefined}>
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="ml-2">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button className="w-full" variant="outline">
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
