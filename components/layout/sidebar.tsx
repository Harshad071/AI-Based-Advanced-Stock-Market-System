'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { label: 'Home', icon: '📊', href: '/' },
    { label: 'Dashboard', icon: '📈', href: '/dashboard' },
    { label: 'Stocks', icon: '📉', href: '/stocks' },
    { label: 'Orders', icon: '⚡', href: '/orders' },
    { label: 'Backtest', icon: '🤖', href: '/backtest' },
    { label: 'Community', icon: '👥', href: '/community' },
  ]

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen fixed left-0 top-0 flex flex-col`}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {isOpen && <h1 className="text-lg font-bold text-sidebar-primary">InvestIQ</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-sidebar-accent rounded"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(item => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${isOpen ? '' : 'px-3'}`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="ml-2">{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button className="w-full" variant="outline">
          {isOpen ? 'Logout' : '→'}
        </Button>
      </div>
    </aside>
  )
}
