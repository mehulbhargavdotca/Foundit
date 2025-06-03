"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, AlertCircle } from "lucide-react"

interface Location {
  latitude: number
  longitude: number
  accuracy: number
}

interface LocationCaptureProps {
  onLocationCapture: (location: Location | null) => void
}

export function LocationCapture({ onLocationCapture }: LocationCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<Location | null>(null)

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setIsCapturing(true)
    setError(null)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }

        setLocation(locationData)
        onLocationCapture(locationData)
        setIsCapturing(false)
      },
      (error) => {
        let errorMessage = "Failed to get location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }

        setError(errorMessage)
        setIsCapturing(false)
      },
      options,
    )
  }

  const clearLocation = () => {
    setLocation(null)
    onLocationCapture(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={captureLocation}
          disabled={isCapturing}
          className="flex items-center gap-2"
        >
          {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {isCapturing ? "Getting Location..." : "Get Current Location"}
        </Button>

        {location && (
          <Button type="button" variant="ghost" onClick={clearLocation} className="text-red-600 hover:text-red-700">
            Clear
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {location && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <div>Latitude: {location.latitude.toFixed(6)}</div>
          <div>Longitude: {location.longitude.toFixed(6)}</div>
          <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
        </div>
      )}
    </div>
  )
}
