import { useEffect, useId, useState } from 'react'
import ModalFrame from '../../shared/modal/modal-frame'
import NoteForm from '../../shared/note-form/note-form'
import type { NoteFormValues } from '../../shared/types/note-form'

type NewNoteModalProps = {
  open: boolean
  /** บันทึกโน้ตใหม่: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในฟอร์ม) */
  onSubmit: (values: NoteFormValues) => Promise<void>
  /** เรียกเมื่อ modal ปิดเสร็จ (บันทึกสำเร็จ, กด Cancel หรือกด Esc) */
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ onSubmit, onClose }: Omit<NewNoteModalProps, 'open'>) {
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => setClosing(true)}
      cardClassName="max-w-190 p-5 text-left min-[640px]:p-8"
    >
      <h2 id={titleId} className="m-0 text-[24px] leading-8 font-bold text-navy-900 min-[640px]:text-[28px] min-[640px]:leading-9">
        New Journal Book
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        Your thoughts are safe, private, and encrypted.
      </p>
      <NoteForm
        submitLabel="Save Note"
        onCancel={() => setClosing(true)}
        onSubmit={async (values) => {
          await onSubmit(values)
          setClosing(true)
        }}
      />
    </ModalFrame>
  )
}

// modal สร้างโน้ตใหม่ (New Journal Book) ใช้ฟอร์มกลาง NoteForm
export default function NewNoteModal({ open, ...props }: NewNoteModalProps) {
  // mount เฉพาะตอนเปิด เพื่อให้ฟอร์มและแอนิเมชันเริ่มใหม่ทุกครั้ง
  return open ? <Dialog {...props} /> : null
}
