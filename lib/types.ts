export interface User {
  id: string;
  email: string;
  balance: number;
  investedAmount: number;
  totalGains: number;
  createdAt: Date;
}

export interface Portfolio {
  userId: string;
  stocks: Position[];
  totalValue: number;
  portfolioReturn: number;
  lastUpdated: Date;
}

export interface Position {
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  gainLoss: number;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  createdAt: Date;
  executedAt?: Date;
}

export interface BacktestResult {
  id: string;
  name: string;
  strategy: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  returnPercent: number;
  winRate: number;
  trades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  startDate: Date;
  endDate: Date;
}

export interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
}
