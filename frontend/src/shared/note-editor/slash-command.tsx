import { Extension, type Editor, type Range } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion'
import SlashMenu, { type SlashMenuHandle } from './slash-menu'
import { filterSlashItems, type SlashItem } from './slash-items'

type SlashCommandOptions = {
  translate: (text: string) => string
  /** เปิดกล่องแนบไฟล์/ภาพ/ลิงก์ (คำสั่ง Attachment) */
  openAttachment: () => void
  /** แจ้งเมื่อเมนูเปิด/ปิด (ให้ตัวแก้ไขกัน Esc ไปปิด modal ที่ครอบอยู่) */
  onMenuChange: (open: boolean) => void
}

const MENU_WIDTH = 256
const MENU_MAX_HEIGHT = 480
const ROW_HEIGHT = 44
const GAP = 12
const EDGE = 8

const MIN_ROOM_BELOW = 280

// วางเมนูให้อยู่ระดับเดียวกับบรรทัดที่กำลังพิมพ์: ชิดด้านขวาของ "/" โดยขอบบนเมนูตรงกับขอบบนของบรรทัด
// - ที่ว่างด้านล่างพอ (>= 280): ขอบบนตรงบรรทัดพอดี และจำกัดความสูงเมนูไม่ให้ล้นหน้าต่าง (เลื่อนในเมนูได้)
// - ที่ว่างด้านล่างไม่พอ: เลื่อนเมนูขึ้นเท่าที่จำเป็นให้ขอบล่างชิดขอบหน้าต่าง (ไม่พลิกไปอยู่เหนือบรรทัดทั้งก้อน)
// ถ้าด้านขวาไม่พอให้ไปอยู่ด้านซ้ายของ "/" และถ้าสองข้างไม่พอให้อยู่ใต้บรรทัด
function place(element: HTMLElement, rect: DOMRect | null, itemCount: number) {
  if (!rect) return
  const wanted = Math.min(MENU_MAX_HEIGHT, itemCount * ROW_HEIGHT + 40)
  element.style.position = 'fixed'
  element.style.zIndex = '60'
  element.style.bottom = ''

  const roomRight = window.innerWidth - rect.right - GAP - EDGE
  const roomLeft = rect.left - GAP - EDGE
  let left: number
  let top: number
  if (roomRight >= MENU_WIDTH) {
    left = rect.right + GAP
    top = rect.top
  } else if (roomLeft >= MENU_WIDTH) {
    left = rect.left - GAP - MENU_WIDTH
    top = rect.top
  } else {
    left = Math.max(EDGE, Math.min(rect.left, window.innerWidth - MENU_WIDTH - EDGE))
    top = rect.bottom + EDGE
  }

  const roomBelow = window.innerHeight - top - EDGE
  let maxHeight = Math.min(wanted, window.innerHeight - EDGE * 2)
  if (roomBelow >= MIN_ROOM_BELOW) {
    maxHeight = Math.min(maxHeight, roomBelow)
  } else {
    top = window.innerHeight - EDGE - maxHeight
  }

  element.style.left = `${left}px`
  element.style.top = `${Math.max(EDGE, top)}px`
  element.style.setProperty('--slash-max-h', `${maxHeight}px`)
}

// พิมพ์ / ในบรรทัดเพื่อเรียกเมนูคำสั่ง (ตามสเปก journaling-page.md หัวข้อ 4)
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return { translate: (text: string) => text, openAttachment: () => undefined, onMenuChange: () => undefined }
  },

  addProseMirrorPlugins() {
    const { translate, openAttachment, onMenuChange } = this.options

    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        char: '/',
        items: ({ query }) => filterSlashItems(query, translate),
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) => {
          props.run({ editor, range, openAttachment })
        },
        render: () => {
          let renderer: ReactRenderer<SlashMenuHandle> | null = null

          return {
            onStart: (props: SuggestionProps<SlashItem, SlashItem>) => {
              renderer = new ReactRenderer(SlashMenu, {
                props: { t: translate, items: props.items, command: (item: SlashItem) => props.command(item) },
                editor: props.editor,
              })
              document.body.appendChild(renderer.element)
              place(renderer.element, props.clientRect?.() ?? null, props.items.length)
              onMenuChange(true)
            },
            onUpdate: (props: SuggestionProps<SlashItem, SlashItem>) => {
              renderer?.updateProps({ items: props.items, command: (item: SlashItem) => props.command(item) })
              if (renderer) place(renderer.element, props.clientRect?.() ?? null, props.items.length)
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === 'Escape') return false
              return renderer?.ref?.onKeyDown(props.event) ?? false
            },
            onExit: () => {
              renderer?.element.remove()
              renderer?.destroy()
              renderer = null
              onMenuChange(false)
            },
          }
        },
      }),
    ]
  },
})
