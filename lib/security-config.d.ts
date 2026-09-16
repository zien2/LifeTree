export const AUTH_COOKIE_NAME: string

export function getRequiredEnv(
  name: string,
  env?: Record<string, string | undefined>
): string

export function extractTokenFromHeaders(headers: Headers): string | null

export function buildAuthCookie(
  token: string,
  maxAgeSeconds?: number,
  secure?: boolean
): string

export function buildClearAuthCookie(secure?: boolean): string
