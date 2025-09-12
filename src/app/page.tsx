'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    router.push('/character')
  }

  const handleGuestPlay = () => {
    router.push('/character')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ef6ad652-55a5-4640-bd8f-03ee11fb4fed.png')`
        }}
      />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Game Title and Features */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-8xl font-bold font-['Cinzel'] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 animate-pulse">
              FLYFF
            </h1>
            <p className="text-2xl lg:text-3xl text-purple-300 font-medium">
              Fly For Fun
            </p>
            <p className="text-lg text-slate-300 max-w-2xl">
              Enter a magical world where you can soar through the skies, master powerful classes, and embark on epic adventures with friends!
            </p>
          </div>

          {/* Game Features */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-purple-400 font-semibold mb-1">Flying System</h3>
              <p className="text-sm text-slate-400">Soar through the skies on magical boards</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-purple-400 font-semibold mb-1">Multiple Classes</h3>
              <p className="text-sm text-slate-400">Choose from diverse character paths</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-purple-400 font-semibold mb-1">Party System</h3>
              <p className="text-sm text-slate-400">Adventure with friends online</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-purple-400 font-semibold mb-1">Epic Quests</h3>
              <p className="text-sm text-slate-400">Discover countless adventures</p>
            </div>
          </div>
        </div>

        {/* Login Panel */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-purple-500/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-['Cinzel'] text-purple-300">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">
                Login to continue your adventure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-slate-500"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  {isLoading ? 'Logging In...' : 'Login'}
                </Button>
                
                <Button
                  onClick={handleGuestPlay}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  Play as Guest
                </Button>
              </div>

              <div className="text-center text-sm text-slate-500">
                <p>New to FLYFF? <span className="text-purple-400 cursor-pointer hover:underline">Create Account</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}