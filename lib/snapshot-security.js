const MAX_SNAPSHOT_BYTES = 5 * 1024 * 1024
const path = require('node:path')

function getSnapshotStorageRoot(env = process.env, cwd = process.cwd()) {
  const configuredRoot = env.SNAPSHOT_STORAGE_DIR
  return configuredRoot && configuredRoot.trim()
    ? path.resolve(configuredRoot.trim())
    : path.join(cwd, 'data', 'tree-snapshots')
}

function getSnapshotFilePath(userId, year, month, filename, root = getSnapshotStorageRoot()) {
  if (!/^[A-Za-z0-9_-]+$/.test(userId)) throw new Error('Invalid user ID')
  if (!/^\d{4}$/.test(year)) throw new Error('Invalid snapshot year')
  if (!/^(0[1-9]|1[0-2])$/.test(month)) throw new Error('Invalid snapshot month')
  if (!/^\d{8}\.(png|jpe?g)$/i.test(filename)) throw new Error('Invalid snapshot filename')

  return path.join(root, userId, year, month, filename)
}

function decodeSnapshotImage(imageData, maxBytes = MAX_SNAPSHOT_BYTES) {
  if (typeof imageData !== 'string') {
    throw new Error('imageData must be a string')
  }

  const match = imageData.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) {
    throw new Error('Only PNG or JPEG data URL images are allowed')
  }

  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > maxBytes) {
    throw new Error('Snapshot image is too large')
  }

  return buffer
}

module.exports = {
  MAX_SNAPSHOT_BYTES,
  decodeSnapshotImage,
  getSnapshotStorageRoot,
  getSnapshotFilePath,
}
