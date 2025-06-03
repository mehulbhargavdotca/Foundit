"use client"

import { useState, useEffect } from "react"
import { ReportForm } from "@/components/report-form"
import { ReportsList } from "@/components/reports-list"
import { OnlineStatus } from "@/components/online-status"
import { syncPendingReports } from "@/services/api"
import { MapPin, Camera, Database } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"report" | "list">("report")
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Sync pending reports when coming back online
      syncPendingReports()
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FoundIt 📍</h1>
          <p className="text-gray-600 mb-4">Report lost or found items in your area</p>
          <OnlineStatus isOnline={isOnline} />
        </div>

        {/* Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Location</span>
            </div>
            <p className="text-sm text-gray-600">Automatically capture your current location</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">Camera</span>
            </div>
            <p className="text-sm text-gray-600">Take photos directly from your device</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Database className="w-5 h-5" />
              <span className="font-semibold">Offline</span>
            </div>
            <p className="text-sm text-gray-600">Works offline with local storage</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("report")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "report" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-blue-500"
            }`}
          >
            Create Report
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "list" ? "bg-blue-500 text-white" : "text-gray-600 hover:text-blue-500"
            }`}
          >
            View Reports
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {activeTab === "report" ? <ReportForm /> : <ReportsList />}
        </div>
      </div>
    </div>
  )
}
