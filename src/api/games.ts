const API_BASE_URL = 'http://localhost:8000/api'

export async function searchSteamGames(query: string) {
  if (!query.trim()) return []
  const res = await fetch(API_BASE_URL + `/steam/search/?name=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  return data
}
