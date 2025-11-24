'use client'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">InvestIQ</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered stock trading and backtesting platform for modern investors.
            </p>
            <p className="text-xs text-muted-foreground">
              Made by Harshad Jadhav and Vishwanath Laidwar
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <a href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </a>
              <a href="/stocks" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Stocks
              </a>
              <a href="/indices" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Indices
              </a>
              <a href="/orders" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Orders
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">📞</span>
                <span className="text-sm text-muted-foreground">+91 9075046500</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">✉️</span>
                <span className="text-sm text-muted-foreground">miharshad88@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © 2025 InvestIQ. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
            Powered by AI & Real-time Market Data
          </p>
        </div>
      </div>
    </footer>
  )
}