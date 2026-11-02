import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Bold,
  Columns3,
  Italic,
  Palette,
  Redo2,
  Rows3,
  Table2,
  Trash2,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";

type EditorToolbarProps = {
  editor: Editor | null;
};

// สีตัวอักษรที่เลือกได้ (จำกัดชุดจาก palette; เก็บเป็น CSS variable จึงเปลี่ยนธีมได้ภายหลัง)
const COLORS: { label: string; value: string | null; swatch: string }[] = [
  { label: "Default", value: null, swatch: "bg-navy-900" },
  { label: "Blue", value: "var(--color-blue-500)", swatch: "bg-blue-500" },
  { label: "Red", value: "var(--color-red-500)", swatch: "bg-red-500" },
  { label: "Green", value: "var(--color-green-500)", swatch: "bg-green-500" },
  { label: "Muted", value: "var(--color-text-muted)", swatch: "bg-text-muted" },
];

const IDLE_STATE = {
  bold: false,
  italic: false,
  underline: false,
  color: null as string | null,
  canUndo: false,
  canRedo: false,
  inTable: false,
};

// คำสั่งจัดการตาราง (ขึ้นเมื่อเคอร์เซอร์อยู่ในตาราง): เพิ่ม/ลบ แถว (row) และคอลัมน์ (column)
type TableAction = {
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  run: (editor: Editor) => void;
};
const TABLE_ACTIONS: TableAction[] = [
  {
    label: "Row above",
    icon: BetweenHorizontalStart,
    run: (e) => e.chain().focus().addRowBefore().run(),
  },
  {
    label: "Row below",
    icon: BetweenHorizontalEnd,
    run: (e) => e.chain().focus().addRowAfter().run(),
  },
  {
    label: "Column left",
    icon: BetweenVerticalStart,
    run: (e) => e.chain().focus().addColumnBefore().run(),
  },
  {
    label: "Column right",
    icon: BetweenVerticalEnd,
    run: (e) => e.chain().focus().addColumnAfter().run(),
  },
  {
    label: "Delete row",
    icon: Rows3,
    danger: true,
    run: (e) => e.chain().focus().deleteRow().run(),
  },
  {
    label: "Delete column",
    icon: Columns3,
    danger: true,
    run: (e) => e.chain().focus().deleteColumn().run(),
  },
  {
    label: "Delete table",
    icon: Trash2,
    danger: true,
    run: (e) => e.chain().focus().deleteTable().run(),
  },
];

const BUTTON =
  "inline-flex size-9 items-center justify-center rounded-md text-navy-700 transition-colors duration-150 hover:bg-blue-100 disabled:opacity-40 disabled:hover:bg-transparent";

// แถบเครื่องมือเหนือช่องจด: ย้อนกลับ/ทำซ้ำ · ตัวหนา เอียง ขีดเส้นใต้ · สีตัวอักษร (ส่วนที่ไม่มีในคำสั่ง /)
export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  const liveState = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      color:
        (current?.getAttributes("textStyle").color as string | undefined) ??
        null,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
      inTable: current?.isActive("table") ?? false,
    }),
  });

  const state = liveState ?? IDLE_STATE;

  // ปิดแผงสีเมื่อคลิกข้างนอกหรือกด Esc
  useEffect(() => {
    if (!colorOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!colorRef.current?.contains(event.target as Node))
        setColorOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setColorOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [colorOpen]);

  const toggle = (active: boolean) =>
    active ? "bg-blue-100 text-navy-900" : "";
  const preventBlur = (event: React.MouseEvent) => event.preventDefault();

  return (
    <div>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-line px-3 py-2"
      >
        <button
          type="button"
          data-no-bounce
          aria-label="Undo"
          title="Undo"
          disabled={!state.canUndo}
          onMouseDown={preventBlur}
          onClick={() => editor?.chain().focus().undo().run()}
          className={BUTTON}
        >
          <Undo2 size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          data-no-bounce
          aria-label="Redo"
          title="Redo"
          disabled={!state.canRedo}
          onMouseDown={preventBlur}
          onClick={() => editor?.chain().focus().redo().run()}
          className={BUTTON}
        >
          <Redo2 size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-blue-200" />

        <button
          type="button"
          data-no-bounce
          aria-label="Bold"
          title="Bold (Ctrl/⌘ B)"
          aria-pressed={state.bold}
          onMouseDown={preventBlur}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`${BUTTON} ${toggle(state.bold)}`}
        >
          <Bold size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          data-no-bounce
          aria-label="Italic"
          title="Italic (Ctrl/⌘ I)"
          aria-pressed={state.italic}
          onMouseDown={preventBlur}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`${BUTTON} ${toggle(state.italic)}`}
        >
          <Italic size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          data-no-bounce
          aria-label="Underline"
          title="Underline (Ctrl/⌘ U)"
          aria-pressed={state.underline}
          onMouseDown={preventBlur}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`${BUTTON} ${toggle(state.underline)}`}
        >
          <Underline size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-blue-200" />

        <div ref={colorRef} className="relative">
          <button
            type="button"
            data-no-bounce
            aria-label="Text color"
            title="Text color"
            aria-haspopup="menu"
            aria-expanded={colorOpen}
            onMouseDown={preventBlur}
            onClick={() => setColorOpen((open) => !open)}
            className={`${BUTTON} ${toggle(colorOpen)}`}
          >
            <Palette size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          {colorOpen && (
            <div
              role="menu"
              aria-label="Text color"
              className="absolute top-full left-0 z-20 mt-2 flex gap-2 rounded-xl bg-surface p-2.5 shadow-lg"
            >
              {COLORS.map(({ label, value, swatch }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitemradio"
                  data-no-bounce
                  aria-checked={state.color === value}
                  aria-label={label}
                  title={label}
                  onMouseDown={preventBlur}
                  onClick={() => {
                    if (value) editor?.chain().focus().setColor(value).run();
                    else editor?.chain().focus().unsetColor().run();
                    setColorOpen(false);
                  }}
                  className={`size-7 rounded-pill border-2 transition-transform duration-150 hover:scale-110 ${swatch} ${
                    state.color === value
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-surface ring-1 ring-line"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <p className="m-0 ml-auto flex items-center gap-1.5 pl-3 text-[12px] leading-5 text-text-muted">
          <kbd className="rounded-sm bg-blue-100 px-1.5 font-sans text-[12px] font-semibold text-navy-700">
            /
          </kbd>
          Type / to design a complete journal
        </p>
      </div>

      {/* แถบจัดการตาราง: ขึ้นเฉพาะเมื่อเคอร์เซอร์อยู่ในตาราง */}
      {state.inTable && (
        <div
          role="toolbar"
          aria-label="Table"
          className="flex flex-wrap items-center gap-1.5 border-b border-line bg-blue-50 px-3 py-2"
        >
          <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
            <Table2 size={14} strokeWidth={1.75} aria-hidden="true" />
            Table
          </span>
          {TABLE_ACTIONS.map(({ label, icon: Icon, danger, run }) => (
            <button
              key={label}
              type="button"
              data-no-bounce
              disabled={!editor}
              onMouseDown={preventBlur}
              onClick={() => editor && run(editor)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12px] leading-4 font-semibold transition-colors duration-150 ${
                danger
                  ? "text-red-500 hover:bg-red-50 active:bg-red-50"
                  : "text-navy-700 hover:bg-blue-100 active:bg-blue-100"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
