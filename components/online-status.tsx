"use client"

import { Wifi, WifiOff } from "lucide-react"

interface OnlineStatusProps {
  isOnline: boolean
}

export function OnlineStatus({ isOnline }: OnlineStatusProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isOnline ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline - Data saved locally</span>
        </>
      )}
    </div>
  )
}
