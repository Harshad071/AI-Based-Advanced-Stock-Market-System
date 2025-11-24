# InvestIQ - AI-Powered Stock Trading Platform

A comprehensive stock trading platform with AI-powered insights, real-time market data, and automated order execution.

## Features

- **Real-time Market Data**: Live stock prices and market indices
- **AI-Powered Insights**: Intelligent portfolio analysis and recommendations
- **Automated Order Execution**: Orders execute automatically during market hours
- **Portfolio Management**: Track holdings, P&L, and performance metrics
- **Technical Analysis**: Charts with indicators and backtesting
- **Market Hours Logic**: Orders only execute during Indian market hours (9:15 AM - 3:30 PM IST)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq Llama 3.3, OpenAI GPT
- **Charts**: Recharts
- **UI**: Radix UI, Lucide Icons

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- API Keys:
  - OpenAI API Key
  - Groq API Key
  - Alpha Vantage API Key (free)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/invest-iq-stock-system.git
   cd invest-iq-stock-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   GROQ_API_KEY=your_groq_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   ```

4. **Database Setup**
   Run the SQL scripts in order:
   ```bash
   # Connect to your Supabase database and run:
   # scripts/001_create_market_tables.sql
   # scripts/002_init_market_data.sql
   # scripts/003_add_executed_price_to_orders.sql
   ```

5. **Seed Historical Data** (optional)
   ```bash
   node scripts/seed_historical_data.js
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`

### 3. Database Setup for Production

1. Create a new Supabase project
2. Run the SQL scripts in the Supabase SQL editor
3. Update environment variables in Vercel with production Supabase credentials

### 4. Build Configuration

Vercel will automatically detect Next.js and use the correct build settings. The `next.config.mjs` is already configured for production.

## API Keys Setup

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to environment variables

### Groq
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Add to environment variables

### Alpha Vantage
1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get a free API key
3. Add to environment variables

## Database Schema

The application uses the following main tables:
- `portfolios` - User portfolios
- `orders` - Trading orders
- `holdings` - Current holdings
- `stock_prices` - Real-time price data
- `ohlc_data` - Historical price data
- `indices` - Market indices

## Market Hours

The system operates during Indian Standard Time (IST):
- **Market Open**: 9:15 AM IST
- **Market Close**: 3:30 PM IST
- **Weekdays**: Monday to Friday
- Orders placed outside market hours remain pending until market opens

## Features Overview

### Dashboard
- Portfolio overview with key metrics
- AI-powered insights that update with market changes
- Sector allocation and performance charts
- Real-time portfolio value tracking

### Orders Management
- Place buy/sell orders
- Automatic execution during market hours
- Order history and status tracking
- Edit/cancel pending orders

### Stock Analysis
- Real-time price charts
- Technical indicators (SMA, RSI, MACD)
- Historical data analysis
- AI-powered price predictions

### Backtesting
- Test trading strategies
- Historical performance analysis
- Multiple strategy templates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the SETUP.md file for detailed setup instructions