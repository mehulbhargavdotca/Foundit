"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllReports, deleteReport } from "@/services/database"
import { MapPin, Calendar, Trash2, Mail, Phone } from "lucide-react"

interface Report {
  id: string
  type: "lost" | "found"
  title: string
  description: string
  contactInfo?: string
  location?: {
    latitude: number
    longitude: number
    accuracy: number
  }
  photo?: string
  timestamp: string
}

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    try {
      const allReports = await getAllReports()
      setReports(allReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    } catch (error) {
      console.error("Error loading reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(id)
        setReports(reports.filter((report) => report.id !== id))
      } catch (error) {
        console.error("Error deleting report:", error)
      }
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading reports...</p>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">No reports found.</p>
        <p className="text-sm text-gray-500">Create your first report using the "Create Report" tab.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">All Reports ({reports.length})</h3>
        <Button variant="outline" size="sm" onClick={loadReports}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <Badge
                    variant={report.type === "lost" ? "destructive" : "default"}
                    className={report.type === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                  >
                    {report.type === "lost" ? "Lost" : "Found"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReport(report.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-700">{report.description}</p>

              {report.photo && (
                <div>
                  <img
                    src={report.photo || "/placeholder.svg"}
                    alt="Report"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                </div>

                {report.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                {report.contactInfo && (
                  <div className="flex items-center gap-1">
                    {report.contactInfo.includes("@") ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    <span>{report.contactInfo}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
