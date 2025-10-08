import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: Request) {
  const authUser = await getAuthUser()
  if (!authUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageData, date } = await request.json()

    if (!imageData || !date) {
      return NextResponse.json({ message: 'Image data and date are required' }, { status: 400 })
    }

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const snapshotDate = dayjs(date)
    const year = snapshotDate.format('YYYY')
    const month = snapshotDate.format('MM')
    const filename = snapshotDate.format('YYYYMMDD') + '.png'

    const yearDir = path.join(process.cwd(), 'public', 'tree-snapshots', year)
    const monthDir = path.join(yearDir, month)
    const filePath = path.join(monthDir, filename)

    await fs.mkdir(monthDir, { recursive: true })
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ 
      message: 'Dashboard tree snapshot saved successfully', 
      url: `/tree-snapshots/${year}/${month}/${filename}`,
      filename: filename
    })
  } catch (error) {
    console.error('Error saving dashboard tree snapshot:', error)
    return NextResponse.json({ message: 'Failed to save snapshot' }, { status: 500 })
  }
}
