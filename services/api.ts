import { type Report, getUnsyncedReports, markReportAsSynced } from "./database"

// Mock API endpoint - replace with your actual server endpoint
const API_BASE_URL = "https://jsonplaceholder.typicode.com/posts"

export async function sendReport(report: Report): Promise<void> {
  try {
    // Convert photo to a smaller format for transmission if needed
    const reportData = {
      ...report,
      // In a real app, you might want to upload the photo separately
      // and just send the URL here
      photo: report.photo ? "photo_uploaded" : undefined,
    }

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Report sent successfully:", result)

    // Mark as synced if it has an ID (was saved to IndexedDB first)
    if (report.id) {
      await markReportAsSynced(report.id)
    }
  } catch (error) {
    console.error("Error sending report to server:", error)
    throw error
  }
}

export async function syncPendingReports(): Promise<void> {
  if (!navigator.onLine) {
    console.log("Cannot sync - device is offline")
    return
  }

  try {
    const unsyncedReports = await getUnsyncedReports()

    if (unsyncedReports.length === 0) {
      console.log("No reports to sync")
      return
    }

    console.log(`Syncing ${unsyncedReports.length} pending reports...`)

    const syncPromises = unsyncedReports.map(async (report) => {
      try {
        await sendReport(report)
        console.log(`Synced report: ${report.title}`)
      } catch (error) {
        console.error(`Failed to sync report ${report.title}:`, error)
      }
    })

    await Promise.allSettled(syncPromises)
    console.log("Sync process completed")
  } catch (error) {
    console.error("Error during sync process:", error)
  }
}

// Utility function to check if the server is reachable
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "HEAD",
      timeout: 5000,
    } as RequestInit)
    return response.ok
  } catch (error) {
    console.error("Server health check failed:", error)
    return false
  }
}
