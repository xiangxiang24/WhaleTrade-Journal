import { Fragment } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { txAmount } from '../../shared/data/portfolio-math'
import { ASSET_BY_ID } from '../../shared/data/assets'
import type { Transaction } from '../../shared/types/transaction'
import { formatBaht, formatDecimal, formatMonthHeading, formatTxDate } from '../types/format'
import { TYPE_LABEL } from '../types/type-label'
import TypeBadge from './type-badge'

type TransactionTableProps = {
  /** หลังกรองแล้ว เรียงใหม่ → เก่า */
  transactions: Transaction[]
  /** Yield on cost ของแต่ละ asset (เปอร์เซ็นต์) key = assetId; ไม่มีหน่วยที่ถืออยู่ = ไม่มี key */
  yields: Map<number, number>
  onEdit: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
}

const TH = 'h-11 px-4 text-left text-[11px] leading-4 font-semibold tracking-[0.08em] text-surface uppercase'
// ปุ่มไอคอนไม่เปลี่ยนพื้นหลังตอน hover: เส้นไอคอนหนาขึ้นและสีเข้มขึ้นแทน (group/icon ให้ svg ตามสถานะของปุ่ม)
const ICON_BUTTON = 'group/icon inline-flex size-9 items-center justify-center rounded-pill'
const ICON = 'transition-[color,stroke-width,filter] duration-150 group-hover/icon:stroke-[2.5] group-focus-visible/icon:stroke-[2.5]'

// ตารางธุรกรรมแบ่งกลุ่มรายเดือน: คอลัมน์ STOCK / TYPE / PERCENT UNIT / DATE / AMOUNT / ACTION
// กว้างกว่าพื้นที่ = เลื่อนแนวนอนในการ์ด โดยคอลัมน์แรก (หุ้น) ติดซ้าย (design rules 5.1)
export default function TransactionTable({ transactions, yields, onEdit, onDelete }: TransactionTableProps) {
  const groups: { month: string; items: Transaction[] }[] = []
  for (const tx of transactions) {
    const month = tx.date.slice(0, 7)
    const last = groups[groups.length - 1]
    if (last?.month === month) last.items.push(tx)
    else groups.push({ month, items: [tx] })
  }

  return (
    <div className="no-scrollbar overflow-x-auto rounded-3xl bg-surface shadow-md">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="bg-blue-500">
            <th scope="col" className={`${TH} sticky left-0 z-10 w-[32%] bg-blue-500 pl-6`}>Stock / Fund</th>
            <th scope="col" className={TH}>Type</th>
            <th scope="col" className={`${TH} text-right whitespace-nowrap`}>Percent unit</th>
            <th scope="col" className={TH}>Date</th>
            <th scope="col" className={`${TH} text-right`}>Amount</th>
            <th scope="col" className={`${TH} pr-6 text-right`}>Action</th>
          </tr>
        </thead>
        {groups.map((group) => (
          <Fragment key={group.month}>
            <tbody>
              <tr>
                <th scope="colgroup" colSpan={6} className="border-b border-line bg-blue-50 p-0 text-left">
                  <div className="sticky left-0 flex w-fit items-center gap-3 px-6 py-2 text-[13px] leading-5 font-semibold text-navy-700">
                    {formatMonthHeading(group.month)}
                    <span className="font-medium text-text-muted">
                      {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                </th>
              </tr>
              {group.items.map((tx) => {
                const asset = ASSET_BY_ID.get(tx.assetId)
                const yieldPct = yields.get(tx.assetId)
                const amount = txAmount(tx)
                const sign = tx.type === 'buy' ? '−' : '+'
                const subtitle =
                  tx.type === 'dividend'
                    ? `${formatBaht(amount / 12)} THB / mo`
                    : `${formatDecimal(tx.units ?? 0, 6)} × ${formatDecimal(tx.price ?? 0, 4)}`
                const label = `${TYPE_LABEL[tx.type]} ${asset?.ticker ?? ''} on ${formatTxDate(tx.date)}`
                return (
                  <tr key={tx.id} className="border-b border-line last:border-b-0">
                    <td className="sticky left-0 z-[1] min-w-64 bg-surface py-3 pr-4 pl-6">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-blue-100 px-1 text-[11px] leading-4 font-bold text-navy-700"
                        >
                          {asset?.ticker.slice(0, 5)}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 text-[15px] leading-6 font-bold text-navy-900">{asset?.name ?? 'Unknown asset'}</p>
                          <p className="m-0 text-[12px] leading-4 text-text-muted">
                            {asset ? `${asset.market}: ${asset.ticker}` : '—'}
                            {asset?.sector ? ` • ${asset.sector}` : ''}
                          </p>
                          {tx.tag && <p className="m-0 text-[12px] leading-4 text-text-muted">{tx.tag}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
                    <td className="px-4 py-3 text-right text-[16px] leading-6 font-semibold text-navy-700 tabular-nums">
                      {yieldPct === undefined ? <span aria-label="No yield">—</span> : `${yieldPct.toFixed(1)}%`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <time dateTime={tx.date} className="block text-[14px] leading-5 font-medium text-navy-900">
                        {formatTxDate(tx.date)}
                      </time>
                      {tx.note && <span className="block text-[12px] leading-4 text-text-muted">{tx.note}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="m-0 text-[16px] leading-6 font-bold whitespace-nowrap text-navy-900 tabular-nums">
                        {sign}
                        {formatBaht(amount)}
                        <span className="ml-1 text-[0.75em] font-semibold text-text-muted">THB</span>
                      </p>
                      <p className="m-0 text-[12px] leading-4 whitespace-nowrap text-text-muted tabular-nums">{subtitle}</p>
                    </td>
                    <td className="py-3 pr-6 pl-4">
                      <div className="flex justify-end gap-1">
                        <button type="button" aria-label={`Edit ${label}`} onClick={() => onEdit(tx)} className={ICON_BUTTON}>
                          <Pencil size={16} strokeWidth={1.75} aria-hidden="true" className={`text-navy-700 group-hover/icon:text-blue-500 ${ICON}`} />
                        </button>
                        <button type="button" aria-label={`Delete ${label}`} onClick={() => onDelete(tx)} className={ICON_BUTTON}>
                          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" className={`text-red-500 group-hover/icon:brightness-75 ${ICON}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Fragment>
        ))}
      </table>
    </div>
  )
}
