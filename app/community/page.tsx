'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Post {
  id: string
  author: string
  avatar: string
  content: string
  likes: number
  comments: number
  timestamp: string
  liked?: boolean
  category: 'strategy' | 'analysis' | 'discussion' | 'question'
  tags: string[]
  reputation?: number
  verified?: boolean
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Raj Kumar',
      avatar: '👨‍💼',
      content: 'Just finished backtesting a moving average strategy. Got 65% win rate with 2.3 profit factor! This platform is amazing.',
      likes: 24,
      comments: 5,
      timestamp: '2 hours ago',
      category: 'strategy',
      tags: ['SMA', 'Crossover', 'Backtested'],
      reputation: 450,
      verified: true,
    },
    {
      id: '2',
      author: 'Priya Singh',
      avatar: '👩‍💼',
      content: 'Anyone else trading the Bank Nifty today? Market looking bullish in early session. Watching 45000 as resistance.',
      likes: 18,
      comments: 12,
      timestamp: '4 hours ago',
      category: 'analysis',
      tags: ['BANKNIFTY', 'Technical', 'RealTime'],
      reputation: 320,
    },
    {
      id: '3',
      author: 'Amit Patel',
      avatar: '🧑‍💼',
      content: 'My portfolio hit ₹12L today! Started with 10L demo capital. Momentum strategy working great. Key is discipline & risk management.',
      likes: 42,
      comments: 8,
      timestamp: '6 hours ago',
      category: 'strategy',
      tags: ['Momentum', 'Portfolio', 'Success'],
      reputation: 580,
      verified: true,
    },
  ])

  const [newPost, setNewPost] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strategy' | 'analysis' | 'discussion' | 'question'>('all')
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Math.random().toString(),
        author: 'You',
        avatar: '😊',
        content: newPost,
        likes: 0,
        comments: 0,
        timestamp: 'now',
        category: 'discussion',
        tags: [],
        reputation: 150,
      }
      setPosts([post, ...posts])
      setNewPost('')
    }
  }

  const toggleLike = (id: string) => {
    setPosts(posts.map(post =>
      post.id === id
        ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
        : post
    ))
  }

  const filteredPosts = selectedCategory === 'all' ? posts : posts.filter(p => p.category === selectedCategory)

  // Top traders leaderboard
  const leaderboard = [
    { rank: 1, name: 'Amit Patel', returns: '+52.7%', trades: 127, badge: '🥇' },
    { rank: 2, name: 'Raj Kumar', returns: '+45.2%', trades: 98, badge: '🥈' },
    { rank: 3, name: 'Priya Singh', returns: '+38.9%', trades: 112, badge: '🥉' },
    { rank: 4, name: 'Vikram Das', returns: '+35.1%', trades: 85, badge: '⭐' },
    { rank: 5, name: 'Neha Gupta', returns: '+32.5%', trades: 103, badge: '⭐' },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header with Leaderboard Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Community</h1>
            <p className="text-muted-foreground">Share strategies, discuss trades, and learn from fellow traders</p>
          </div>
          <button 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-sm px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
          >
            {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Post */}
            <Card>
              <CardContent className="pt-6">
                <textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share your trading insights, strategy results, or market analysis..."
                  className="w-full p-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-card hover:bg-card/80 rounded text-muted-foreground">📊 Strategy</button>
                    <button className="px-3 py-1 text-sm bg-card hover:bg-card/80 rounded text-muted-foreground">📈 Analysis</button>
                    <button className="px-3 py-1 text-sm bg-card hover:bg-card/80 rounded text-muted-foreground">❓ Question</button>
                  </div>
                  <Button
                    onClick={handlePostSubmit}
                    disabled={!newPost.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'strategy', 'analysis', 'discussion', 'question'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`px-4 py-2 rounded whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:border-primary text-foreground'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-3 justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{post.avatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{post.author}</p>
                            {post.verified && <span className="text-sm">✓</span>}
                            {post.reputation && (
                              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                                Rep: {post.reputation}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-card border border-border/50 rounded text-muted-foreground hover:border-primary cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex gap-6 border-t border-border pt-3">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                          post.liked
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="text-lg">{post.liked ? '❤️' : '🤍'}</span>
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <span className="text-lg">💬</span>
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <span className="text-lg">📤</span>
                        Share
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          {showLeaderboard && (
            <div className="lg:col-span-1 space-y-6">
              {/* Top Traders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Traders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.map(trader => (
                    <div key={trader.rank} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <span className="text-2xl">{trader.badge}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">{trader.name}</p>
                        <p className="text-xs text-muted-foreground">{trader.trades} trades</p>
                      </div>
                      <p className="gain font-bold text-sm">{trader.returns}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trending Strategies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['SMA Crossover', 'RSI Oversold', 'Momentum', 'Bollinger Bands'].map((strat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-card/50 rounded">
                      <p className="text-sm text-foreground">{strat}</p>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Popular</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Members</p>
                    <p className="text-2xl font-bold text-foreground">2,847</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Posts This Week</p>
                    <p className="text-2xl font-bold text-foreground">1,523</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Portfolio Return</p>
                    <p className="text-2xl font-bold gain">+32.5%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
