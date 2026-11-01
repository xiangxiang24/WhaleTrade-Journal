// วงกลมเขียวเด้งขึ้นมา แล้วเครื่องหมายถูกถูกวาดตาม (ใช้ร่วมกันทุก modal แจ้งสำเร็จ)
export default function SuccessCheck({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`mx-auto animate-circle-pop motion-reduce:animate-none ${className}`}
    >
      <circle cx="50" cy="50" r="50" className="fill-green-500" />
      <path
        d="M30 52 L44 66 L70 34"
        pathLength={1}
        strokeDasharray={1}
        fill="none"
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-check-draw stroke-surface motion-reduce:animate-none"
      />
    </svg>
  )
}
