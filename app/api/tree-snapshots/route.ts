import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getAuthUserFromRequest } from '@/lib/auth'
import {
  decodeSnapshotImage,
  getSnapshotFilePath,
  getSnapshotStorageRoot,
} from '@/lib/snapshot-security'

const SNAPSHOT_DIR = getSnapshotStorageRoot()

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req)
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month') // 1-12

    const userSnapshotDir = path.join(SNAPSHOT_DIR, authUser.id)
    ensureDir(userSnapshotDir)

    // 列出所有文件，或按年/月过滤
    const result: Array<{ url: string; date: string; filename: string }> = []

    const years = fs.readdirSync(userSnapshotDir, { withFileTypes: true }).filter(d => d.isDirectory())
    for (const y of years) {
      if (year && y.name !== year) continue
      const yearDir = path.join(userSnapshotDir, y.name)
      const months = fs.readdirSync(yearDir, { withFileTypes: true }).filter(d => d.isDirectory())
      for (const m of months) {
        if (month && m.name !== month.padStart(2, '0')) continue
        const monthDir = path.join(yearDir, m.name)
        const files = fs.readdirSync(monthDir, { withFileTypes: true }).filter(f => f.isFile())
        for (const f of files) {
          if (!f.name.toLowerCase().endsWith('.png') && !f.name.toLowerCase().endsWith('.jpg')) continue
          const url = `/api/tree-snapshots/${authUser.id}/${y.name}/${m.name}/${f.name}`
          const basename = path.parse(f.name).name
          // 期望文件名格式: YYYYMMDD.png
          let date = basename
          if (/^\d{8}$/.test(basename)) {
            date = `${basename.substring(0,4)}-${basename.substring(4,6)}-${basename.substring(6,8)}`
          }
          result.push({ url, date, filename: f.name })
        }
      }
    }

    // 按日期倒序
    result.sort((a, b) => (a.date < b.date ? 1 : -1))
    return NextResponse.json(result)
  } catch (e) {
    console.error('List snapshots error:', e)
    return NextResponse.json({ message: 'List snapshots failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req)
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { imageData, date } = body as { imageData: string; date?: string }
    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json({ message: 'imageData缺失' }, { status: 400 })
    }

    const now = date ? new Date(date) : new Date()
    const y = String(now.getFullYear())
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')

    const targetDir = path.join(SNAPSHOT_DIR, authUser.id, y, m)
    ensureDir(targetDir)

    const buffer = decodeSnapshotImage(imageData)

    const filename = `${y}${m}${d}.png`
    const filePath = getSnapshotFilePath(authUser.id, y, m, filename, SNAPSHOT_DIR)
    fs.writeFileSync(filePath, buffer)

    const url = `/api/tree-snapshots/${authUser.id}/${y}/${m}/${filename}`
    return NextResponse.json({ url, filename })
  } catch (e) {
    console.error('Save snapshot error:', e)
    return NextResponse.json({ message: 'Save snapshot failed' }, { status: 500 })
  }
}
