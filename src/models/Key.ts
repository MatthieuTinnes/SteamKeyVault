export interface Key {
  id: number
  key: string
  used: boolean
  date_added: string
  date_used?: string
  current_use?: string
  share_in_progress?: boolean
}

export const CURRENT_USE_VALUES = ['KEEP', 'TRADE', 'GIVEAWAY', 'SELL', 'OTHER'] as const
