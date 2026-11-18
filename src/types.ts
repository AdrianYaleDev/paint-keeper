export type Paint = {
  id: string
  brand: string
  name: string
  range: string
  type?: string
  code?: string | null
  color: string
  finish?: string | null
  medium?: string | null
  sizeMl?: number | null
}

export type PaintStatus = 'owned' | 'wishlist' | 'none'

export type PotCondition = 'low' | 'dried'

export type PaintEntry = {
  paint: Paint
  status: PaintStatus
  condition?: PotCondition | null
  restock?: boolean
  updatedAt: string
}

export type Collection = {
  entries: Record<string, PaintEntry>
  dirty: string[]
}

export type Project = {
  id: string
  name: string
  paintIds: string[]
  updatedAt: string
  deleted?: boolean
}
