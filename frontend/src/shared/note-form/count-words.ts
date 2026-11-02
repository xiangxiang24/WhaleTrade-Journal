// นับคำ (ภาษาไทยไม่มีช่องว่างคั่นคำ จึงใช้ Intl.Segmenter ตัดคำ)
export function countWords(text: string): number {
  if (!text.trim()) return 0
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
  let count = 0
  for (const part of segmenter.segment(text)) if (part.isWordLike) count += 1
  return count
}
