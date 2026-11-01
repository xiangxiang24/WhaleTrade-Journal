type AvatarProps = {
  /** รูปโปรไฟล์ที่ผู้ใช้อัปโหลด ถ้าไม่มีจะแสดงเงาวาฬสีเดียวแทน */
  src?: string
  /** กำหนดขนาดด้วย class เช่น "size-9" (ค่าเริ่มต้นเต็มกล่องของ parent) */
  className?: string
}

// ภาพแทนเมื่อผู้ใช้ยังไม่ได้ตั้งรูปโปรไฟล์: เงาวาฬสีเดียวไม่มีหน้าตา เล็กอยู่กลางวงกลม (ฟีลเดียวกับรูปคนสีเทา)
function WhaleSilhouette() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="size-full">
      <g className="fill-blue-200" transform="translate(11 13) scale(0.66)">
        {/* ตัววาฬหันซ้าย หางชี้ขึ้นทางขวาแยกเป็นสองแฉก */}
        <path d="M4 40 C4 28 14 22 26 22 C35 22 41 27 44 33 C46 29 48 26 50 24 C46 22 43 18 44 14 C48 15 50 18 51 21 C52 17 55 14 60 14 C60 20 56 24 53 27 C51 30 50 34 50 38 C46 48 38 52 28 52 C14 52 4 48 4 40 Z" />
        {/* น้ำพุ */}
        <circle cx="25" cy="13" r="3" />
        <circle cx="33" cy="8" r="2" />
      </g>
    </svg>
  )
}

// รูปโปรไฟล์กลม ใช้ทุกที่ที่แสดงผู้ใช้ (Sidebar, TopBar, Setting)
export default function Avatar({ src, className = '' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 overflow-hidden rounded-pill bg-blue-100 ${className}`}
    >
      {src ? <img className="size-full object-cover" src={src} alt="" /> : <WhaleSilhouette />}
    </span>
  )
}
