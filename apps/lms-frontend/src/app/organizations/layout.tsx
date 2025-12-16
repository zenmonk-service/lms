import AppBar from '@/components/app-bar'
import React from 'react'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
  <div className="flex flex-col">
      <AppBar />
      <div className="flex flex-1 overflow-hidden max-h-[calc(100vh-77px)]">
          <main className="flex-1 overflow-auto max-h-[calc(100vh-77px)]">
            {children}
          </main>
      </div>
    </div>
  )
}
