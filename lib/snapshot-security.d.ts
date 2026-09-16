export const MAX_SNAPSHOT_BYTES: number
export function decodeSnapshotImage(imageData: string, maxBytes?: number): Buffer
export function getSnapshotStorageRoot(env?: NodeJS.ProcessEnv, cwd?: string): string
export function getSnapshotFilePath(
  userId: string,
  year: string,
  month: string,
  filename: string,
  root?: string
): string
