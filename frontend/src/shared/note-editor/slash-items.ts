import type { Editor, Range } from '@tiptap/core'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Paperclip,
  Quote,
  SquareCheck,
  Table,
  Type,
  type LucideIcon,
} from 'lucide-react'

export type SlashItem = {
  id: string
  label: string
  icon: LucideIcon
  /** คำที่ใช้กรองเมื่อพิมพ์ต่อจาก / */
  keywords: string[]
  /** กลุ่ม: บล็อกเนื้อหา (blocks) กับแทรกสิ่งอื่น (insert) คั่นด้วยเส้นในเมนู */
  group: 'blocks' | 'insert'
  run: (context: { editor: Editor; range: Range; openAttachment: () => void }) => void
}

// รายการคำสั่ง / ตามที่กำหนด: Text, Heading 1-3, Bulleted List, Numbered List, Check Item, Quote, Horizontal Line | Table, Attachment
export const SLASH_ITEMS: SlashItem[] = [
  {
    id: 'text',
    label: 'Text',
    icon: Type,
    keywords: ['text', 'paragraph', 'normal'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: 'heading-1',
    label: 'Heading 1',
    icon: Heading1,
    keywords: ['heading', 'h1', 'title', 'large'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    id: 'heading-2',
    label: 'Heading 2',
    icon: Heading2,
    keywords: ['heading', 'h2', 'subtitle', 'medium'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    id: 'heading-3',
    label: 'Heading 3',
    icon: Heading3,
    keywords: ['heading', 'h3', 'small'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
  },
  {
    id: 'bulleted-list',
    label: 'Bulleted List',
    icon: List,
    keywords: ['bullet', 'bulleted', 'list', 'unordered', 'ul'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    icon: ListOrdered,
    keywords: ['number', 'numbered', 'list', 'ordered', 'ol'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: 'check-item',
    label: 'Check Item',
    icon: SquareCheck,
    keywords: ['check', 'checkbox', 'todo', 'task', 'checklist'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    id: 'quote',
    label: 'Quote',
    icon: Quote,
    keywords: ['quote', 'blockquote', 'citation'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    id: 'horizontal-line',
    label: 'Horizontal Line',
    icon: Minus,
    keywords: ['divider', 'line', 'horizontal', 'rule', 'separator', 'hr'],
    group: 'blocks',
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    id: 'table',
    label: 'Table',
    icon: Table,
    keywords: ['table', 'grid', 'columns'],
    group: 'insert',
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'attachment',
    label: 'Attachment',
    icon: Paperclip,
    keywords: ['attachment', 'attach', 'file', 'image', 'photo', 'picture', 'link', 'url'],
    group: 'insert',
    run: ({ editor, range, openAttachment }) => {
      editor.chain().focus().deleteRange(range).run()
      openAttachment()
    },
  },
]

/** กรองรายการตามคำที่พิมพ์ต่อจาก / (ตรงกับชื่อหรือคำค้น) */
export function filterSlashItems(query: string): SlashItem[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return SLASH_ITEMS
  return SLASH_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(keyword) || item.keywords.some((word) => word.includes(keyword)),
  )
}
