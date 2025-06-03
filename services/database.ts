import Dexie, { type Table } from "dexie"

export interface Report {
  id?: string
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
  synced?: boolean
}

export class FoundItDatabase extends Dexie {
  reports!: Table<Report>

  constructor() {
    super("FoundItDatabase")
    this.version(1).stores({
      reports: "++id, type, title, timestamp, synced",
    })
  }
}

export const db = new FoundItDatabase()

// Database operations
export async function saveReport(report: Report): Promise<void> {
  try {
    await db.reports.add({
      ...report,
      synced: false,
    })
    console.log("Report saved to IndexedDB")
  } catch (error) {
    console.error("Error saving report to IndexedDB:", error)
    throw error
  }
}

export async function getAllReports(): Promise<Report[]> {
  try {
    return await db.reports.toArray()
  } catch (error) {
    console.error("Error getting reports from IndexedDB:", error)
    throw error
  }
}

export async function getUnsyncedReports(): Promise<Report[]> {
  try {
    return await db.reports.where("synced").equals(false).toArray()
  } catch (error) {
    console.error("Error getting unsynced reports:", error)
    throw error
  }
}

export async function markReportAsSynced(id: string): Promise<void> {
  try {
    await db.reports.update(id, { synced: true })
  } catch (error) {
    console.error("Error marking report as synced:", error)
    throw error
  }
}

export async function deleteReport(id: string): Promise<void> {
  try {
    await db.reports.delete(id)
    console.log("Report deleted from IndexedDB")
  } catch (error) {
    console.error("Error deleting report:", error)
    throw error
  }
}

export async function clearAllReports(): Promise<void> {
  try {
    await db.reports.clear()
    console.log("All reports cleared from IndexedDB")
  } catch (error) {
    console.error("Error clearing reports:", error)
    throw error
  }
}
