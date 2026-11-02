import type { JSONContent } from '@tiptap/core'

// เนื้อโน้ตเก็บเป็น JSON ของตัวแก้ไข TipTap (สตริงเดียวใน Note.content) ส่วนข้อความล้วนใช้กับการค้นหา ตัวอย่างบนการ์ด นับคำ และ export CSV
// โน้ตเก่าที่เป็นข้อความธรรมดายังเปิดได้ (แปลงเป็นย่อหน้าตอนเปิด และเป็น JSON ตอนบันทึก)

const MEDIA_NODES = new Set(['image', 'fileAttachment'])

/** ข้อความธรรมดา → เอกสารที่ขึ้นบรรทัดละ 1 ย่อหน้า */
export function plainTextToDoc(text: string): JSONContent {
  return {
    type: 'doc',
    content: text.split('\n').map((line) =>
      line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' },
    ),
  }
}

/** แปลง Note.content (JSON หรือข้อความธรรมดาเก่า) เป็นเอกสารของตัวแก้ไข */
export function parseContent(content: string): JSONContent {
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as JSONContent
      if (parsed.type === 'doc') return parsed
    } catch {
      // ไม่ใช่ JSON: ใช้เป็นข้อความธรรมดา
    }
  }
  return plainTextToDoc(content)
}

/** รูปแบบมาตรฐานของเนื้อหา ใช้เทียบว่าเปลี่ยนจริงหรือไม่ (ไม่ขึ้นกับว่าเก็บเป็นข้อความเก่าหรือ JSON) */
export function canonicalContent(content: string): string {
  return JSON.stringify(parseContent(content))
}

function nodeText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  if (node.type === undefined || MEDIA_NODES.has(node.type) || node.type === 'horizontalRule') return ''
  const children = node.content ?? []
  if (node.type === 'paragraph' || node.type === 'heading') return children.map(nodeText).join('')
  if (node.type === 'tableRow') return children.map(nodeText).filter(Boolean).join(' ')
  return children.map(nodeText).filter((text) => text !== '').join('\n')
}

/** ข้อความล้วนของโน้ต (ไม่มีรูปแบบ) */
export function contentToPlainText(content: string): string {
  return nodeText(parseContent(content))
}

function hasMedia(node: JSONContent): boolean {
  if (node.type && MEDIA_NODES.has(node.type)) return true
  return (node.content ?? []).some(hasMedia)
}

/** โน้ตว่างเมื่อไม่มีทั้งข้อความและรูป/ไฟล์แนบ */
export function isContentEmpty(content: string): boolean {
  if (!content.trim()) return true
  const doc = parseContent(content)
  return contentToPlainText(content).trim() === '' && !hasMedia(doc)
}
