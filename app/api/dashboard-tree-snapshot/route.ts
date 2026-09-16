import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { getAuthUserFromRequest } from '@/lib/auth'
import {
  decodeSnapshotImage,
  getSnapshotFilePath,
  getSnapshotStorageRoot,
} from '@/lib/snapshot-security'

export async function POST(request: Request) {
  const authUser = await getAuthUserFromRequest(request)
  if (!authUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageData, date } = await request.json()

    if (!imageData || !date) {
      return NextResponse.json({ message: 'Image data and date are required' }, { status: 400 })
    }

    const buffer = decodeSnapshotImage(imageData)

    const snapshotDate = dayjs(date)
    const year = snapshotDate.format('YYYY')
    const month = snapshotDate.format('MM')
    const filename = snapshotDate.format('YYYYMMDD') + '.png'

    const storageRoot = getSnapshotStorageRoot()
    const yearDir = path.join(storageRoot, authUser.id, year)
    const monthDir = path.join(yearDir, month)
    const filePath = getSnapshotFilePath(authUser.id, year, month, filename, storageRoot)

    await fs.mkdir(monthDir, { recursive: true })
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ 
      message: 'Dashboard tree snapshot saved successfully', 
      url: `/api/tree-snapshots/${authUser.id}/${year}/${month}/${filename}`,
      filename: filename
    })
  } catch (error) {
    console.error('Error saving dashboard tree snapshot:', error)
    return NextResponse.json({ message: 'Failed to save snapshot' }, { status: 500 })
  }
}
