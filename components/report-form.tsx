"use client"

import type React from "react"

import { useState } from "react"
import { LocationCapture } from "./location-capture"
import { CameraCapture } from "./camera-capture"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { saveReport } from "@/services/database"
import { sendReport } from "@/services/api"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface Location {
  latitude: number
  longitude: number
  accuracy: number
}

export function ReportForm() {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    contactInfo: "",
  })
  const [location, setLocation] = useState<Location | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.title || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const reportData = {
        ...formData,
        location,
        photo,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      }

      // Save to IndexedDB first
      await saveReport(reportData)

      // Try to send to server if online
      if (navigator.onLine) {
        try {
          await sendReport(reportData)
          setSubmitStatus("success")
        } catch (error) {
          console.log("Failed to send to server, saved locally for later sync")
          setSubmitStatus("success")
        }
      } else {
        setSubmitStatus("success")
      }

      // Reset form
      setFormData({ type: "", title: "", description: "", contactInfo: "" })
      setLocation(null)
      setPhoto(null)
    } catch (error) {
      console.error("Error saving report:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Report Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lost">Lost Item</SelectItem>
                <SelectItem value="found">Found Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Blue iPhone 13, Black Wallet, etc."
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide detailed description of the item..."
              rows={4}
              required
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              placeholder="Email or phone number (optional)"
            />
          </div>

          {/* Location Capture */}
          <div className="space-y-2">
            <Label>Location</Label>
            <LocationCapture onLocationCapture={setLocation} />
            {location && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                ✓ Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            )}
          </div>

          {/* Camera Capture */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <CameraCapture onPhotoCapture={setPhoto} />
            {photo && (
              <div className="mt-2">
                <img
                  src={photo || "/placeholder.svg"}
                  alt="Captured"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Submit Status */}
          {submitStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
              <CheckCircle className="w-5 h-5" />
              <span>Report saved successfully!</span>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="w-5 h-5" />
              <span>Error saving report. Please try again.</span>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Report...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
