// เนื้อโน้ตเก็บเป็น JSON ของตัวแก้ไข TipTap (หรือข้อความธรรมดาของโน้ตเก่า) ส่วนข้อความล้วนใช้กับค้นหา ตัวอย่างบนการ์ด และ CSV
// ตรรกะเดียวกับ frontend/src/shared/note-editor/content.ts

type Node = { type?: string; text?: string; content?: Node[] };

const MEDIA_NODES = new Set(['image', 'fileAttachment']);

function parse(content: string): Node {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Node;
      if (parsed.type === 'doc') return parsed;
    } catch {
      // ไม่ใช่ JSON: ใช้เป็นข้อความธรรมดา
    }
  }
  return {
    type: 'doc',
    content: content.split('\n').map((line) => (line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' })),
  };
}

function nodeText(node: Node): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  if (node.type === undefined || MEDIA_NODES.has(node.type) || node.type === 'horizontalRule') return '';
  const children = node.content ?? [];
  if (node.type === 'paragraph' || node.type === 'heading') return children.map(nodeText).join('');
  if (node.type === 'tableRow') return children.map(nodeText).filter(Boolean).join(' ');
  return children.map(nodeText).filter((part) => part !== '').join('\n');
}

function hasMedia(node: Node): boolean {
  if (node.type && MEDIA_NODES.has(node.type)) return true;
  return (node.content ?? []).some(hasMedia);
}

export const contentToPlainText = (content: string) => nodeText(parse(content));

/** โน้ตว่างเมื่อไม่มีทั้งข้อความและรูป/ไฟล์แนบ */
export function isContentEmpty(content: string): boolean {
  if (!content.trim()) return true;
  return contentToPlainText(content).trim() === '' && !hasMedia(parse(content));
}
