import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { getAuthUserFromRequest } from '@/lib/auth'
import { getSnapshotFilePath } from '@/lib/snapshot-security'

type SnapshotParams = {
  userId: string
  year: string
  month: string
  filename: string
}

export async function GET(
  request: Request,
  { params }: { params: SnapshotParams }
) {
  const authUser = await getAuthUserFromRequest(request)
  if (!authUser || params.userId !== authUser.id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  try {
    const filePath = getSnapshotFilePath(
      params.userId,
      params.year,
      params.month,
      params.filename
    )
    const image = await fs.readFile(filePath)
    const contentType = params.filename.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg'

    return new NextResponse(new Uint8Array(image), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
}
