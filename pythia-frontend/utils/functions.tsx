'use client'
import { createHash } from 'crypto'

export function formatAddress(address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function hashObject(obj: any) {
  const str = JSON.stringify(obj)
  const hash = createHash('sha256')
  hash.update(str)
  return hash.digest('hex')
}
