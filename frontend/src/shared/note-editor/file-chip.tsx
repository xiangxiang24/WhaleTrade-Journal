import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { Paperclip } from 'lucide-react'
import { formatBytes } from '../data/attachments'

// กล่องไฟล์แนบในเนื้อโน้ต: ไอคอนคลิป + ชื่อไฟล์ + ขนาด คลิกเพื่อดาวน์โหลด
export default function FileChip({ node }: NodeViewProps) {
  const { url, name, size } = node.attrs as { url: string; name: string; size: number }
  return (
    <NodeViewWrapper className="note-file-wrapper">
      <a
        href={url}
        download={name}
        contentEditable={false}
        className="inline-flex max-w-full items-center gap-3 rounded-xl border border-blue-200 bg-surface px-4 py-2.5 text-navy-900 no-underline transition-colors duration-150 hover:bg-blue-50"
      >
        <Paperclip size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-blue-500" />
        <span className="min-w-0 truncate text-[14px] leading-5 font-medium">{name}</span>
        <span className="shrink-0 text-[12px] leading-4 text-text-muted">{formatBytes(size)}</span>
      </a>
    </NodeViewWrapper>
  )
}
