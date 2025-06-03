"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw } from "lucide-react"

interface CameraCaptureProps {
  onPhotoCapture: (photo: string | null) => void
}

export function CameraCapture({ onPhotoCapture }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      setIsCapturing(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Failed to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)

    setPhoto(photoDataUrl)
    onPhotoCapture(photoDataUrl)
    stopCamera()
  }

  const retakePhoto = () => {
    setPhoto(null)
    onPhotoCapture(null)
    startCamera()
  }

  const clearPhoto = () => {
    setPhoto(null)
    onPhotoCapture(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!isCapturing && !photo && (
          <Button type="button" variant="outline" onClick={startCamera} className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
        )}

        {photo && (
          <>
            <Button type="button" variant="outline" onClick={retakePhoto} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearPhoto}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </>
        )}
      </div>

      {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm">{error}</div>}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md mx-auto block" />
          </div>

          <div className="flex gap-2 justify-center">
            <Button type="button" onClick={capturePhoto} className="bg-blue-500 hover:bg-blue-600">
              Capture Photo
            </Button>
            <Button type="button" variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {photo && (
        <div className="space-y-2">
          <img
            src={photo || "/placeholder.svg"}
            alt="Captured"
            className="w-full max-w-md mx-auto block rounded-lg border"
          />
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
