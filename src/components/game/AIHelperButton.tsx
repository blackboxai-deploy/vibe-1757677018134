'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import AIHelperChat from './AIHelperChat'

export function AIHelperButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
      >
        <span className="text-lg">🧙‍♂️</span>
        <span>Sage Iris</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </Button>

      <AIHelperChat 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

export default AIHelperButton