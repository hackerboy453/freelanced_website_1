const lastRequestTime = new Map<string, number>()
const MIN_REQUEST_INTERVAL = 2000 // 2 seconds between requests

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const lastTime = lastRequestTime.get(identifier) || 0
  
  if (now - lastTime < MIN_REQUEST_INTERVAL) {
    return false // Too soon
  }
  
  lastRequestTime.set(identifier, now)
  return true // OK to proceed
}