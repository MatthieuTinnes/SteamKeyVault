export interface Key {
  id: number
  key: string
  used: boolean
  date_added: string
  date_used?: string
  current_use?: string
}

export const CURRENT_USE_OPTIONS = [
  { label: 'Keep', value: 'KEEP' },
  { label: 'Trade', value: 'TRADE' },
  { label: 'Giveaway', value: 'GIVEAWAY' },
  { label: 'Sell', value: 'SELL' },
  { label: 'Other', value: 'OTHER' },
];
