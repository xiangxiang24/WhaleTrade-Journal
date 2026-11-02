import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { TaskItem } from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import AttachmentModal, { type AttachmentResult } from './attachment-modal'
import { canonicalContent, parseContent } from './content'
import EditorToolbar from './editor-toolbar'
import { FileAttachment } from './file-attachment'
import { createMenuState } from './menu-state'
import { SlashCommand } from './slash-command'
import './note-editor.css'

type NoteEditorProps = {
  /** เนื้อโน้ต (JSON ของตัวแก้ไข หรือข้อความธรรมดาของโน้ตเก่า) */
  value: string
  /** ส่งเนื้อโน้ตใหม่ (JSON string) ทุกครั้งที่ผู้ใช้แก้ */
  onChange: (content: string) => void
  /** id ของป้ายชื่อช่อง (ใช้กับโปรแกรมอ่านหน้าจอ) */
  labelledBy?: string
  describedBy?: string
  invalid?: boolean
  placeholder?: string
  /** ความสูงขั้นต่ำของพื้นที่เขียน (class ของ Tailwind) */
  minHeightClass?: string
}

// ตัวแก้ไขโน้ตแบบ Notion-like: พิมพ์ / เรียกเมนูคำสั่ง, แถบเครื่องมือเหนือช่องจด (ย้อนกลับ/ทำซ้ำ, หนา/เอียง/ขีดเส้นใต้, สี)
// ฟอนต์ใช้ของแอปเท่านั้น เปลี่ยนได้แค่ความหนา/เอียง/ขีดเส้นใต้/สี
export default function NoteEditor({
  value,
  onChange,
  labelledBy,
  describedBy,
  invalid = false,
  placeholder = 'Why did you invest? What would change your mind? What will you measure?',
  minHeightClass = 'min-h-64',
}: NoteEditorProps) {
  const [attachmentOpen, setAttachmentOpen] = useState(false)

  // เก็บ callback ล่าสุดไว้ใน ref เพื่อไม่ต้องสร้างตัวแก้ไขใหม่เมื่อ parent ส่งฟังก์ชันตัวใหม่
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // กัน Esc ที่ปิดเมนู / ไม่ให้ลอยไปปิด modal ที่ครอบตัวแก้ไขอยู่
  const [menu] = useState(createMenuState)

  const openAttachment = useCallback(() => setAttachmentOpen(true), [])
  const onMenuChange = useCallback((open: boolean) => menu.set(open), [menu])

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // รอบนี้ใช้เฉพาะ หนา/เอียง/ขีดเส้นใต้ จึงปิดขีดฆ่าและโค้ด
        strike: false,
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } },
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      // รูปปรับขนาดได้: ลากมุมทั้งสี่ (รักษาสัดส่วน) ขนาดที่ปรับเก็บเป็น width/height ในเนื้อโน้ต
      Image.configure({
        inline: false,
        allowBase64: true,
        resize: {
          enabled: true,
          directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          minWidth: 80,
          minHeight: 60,
          alwaysPreserveAspectRatio: true,
        },
      }),
      FileAttachment,
      Placeholder.configure({ placeholder }),
      SlashCommand.configure({ openAttachment, onMenuChange }),
    ],
    [placeholder, openAttachment, onMenuChange],
  )

  const editor = useEditor({
    extensions,
    content: parseContent(value),
    editorProps: {
      attributes: {
        class: `note-editor-content ${minHeightClass}`,
        role: 'textbox',
        'aria-multiline': 'true',
        ...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(JSON.stringify(current.getJSON())),
  })

  // ค่าจากภายนอกเปลี่ยน (เช่นกู้ฉบับร่าง) ให้ตัวแก้ไขตามโดยไม่ถือว่าเป็นการแก้ของผู้ใช้
  useEffect(() => {
    if (!editor) return
    if (canonicalContent(value) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(parseContent(value), { emitUpdate: false })
    }
  }, [value, editor])

  function insertAttachment(result: AttachmentResult) {
    if (!editor) return
    const chain = editor.chain().focus()
    if (result.kind === 'image') {
      chain.setImage({ src: result.url, alt: result.name }).run()
    } else if (result.kind === 'file') {
      chain.insertContent({ type: 'fileAttachment', attrs: { url: result.url, name: result.name, size: result.size, mime: result.mime } }).run()
    } else if (editor.state.selection.empty) {
      chain
        .insertContent({
          type: 'text',
          text: result.label || result.url,
          marks: [{ type: 'link', attrs: { href: result.url } }],
        })
        .run()
    } else {
      chain.setLink({ href: result.url }).run()
    }
  }

  return (
    <div
      className={`rounded-md border border-blue-200 bg-surface transition-shadow duration-150 focus-within:shadow-focus ${
        invalid ? 'ring-2 ring-red-500' : ''
      }`}
      onKeyDown={(event) => {
        // Esc ที่ใช้ปิดเมนู / หรือแผงในตัวแก้ไข ไม่ให้ปิด modal ที่ครอบอยู่
        if (event.key === 'Escape' && menu.isOpenOrJustClosed()) {
          event.stopPropagation()
        }
      }}
    >
      <EditorToolbar editor={editor} />
      <div className="px-4 py-4 short:py-3">
        <EditorContent editor={editor} />
      </div>
      <AttachmentModal
        open={attachmentOpen}
        onInsert={insertAttachment}
        onClose={() => {
          setAttachmentOpen(false)
          editor?.commands.focus()
        }}
      />
    </div>
  )
}
