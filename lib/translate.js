const cache = new Map()

export async function translateEnToAr(text) {
  const q = (text || '').trim()
  if (!q) return ''
  if (cache.has(q)) return cache.get(q)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|ar`
    const res = await fetch(url)
    if (!res.ok) throw new Error('translate failed')
    const data = await res.json()
    const translated =
      data?.responseData?.translatedText || data?.matches?.[0]?.translation || q
    if (
      typeof translated === 'string' &&
      translated.length > 0 &&
      !/MYMEMORY WARNING/i.test(translated)
    ) {
      cache.set(q, translated)
      return translated
    }
  } catch {
    // fallback to original
  }
  return q
}
