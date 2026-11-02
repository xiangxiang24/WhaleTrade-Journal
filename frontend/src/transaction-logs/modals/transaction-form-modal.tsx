import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import AssetPicker from '../../shared/asset-picker/asset-picker'
import { ASSET_BY_ID } from '../../shared/data/assets'
import ModalFrame from '../../shared/modal/modal-frame'
import type { Asset, Transaction, TransactionFormValues, TransactionType } from '../../shared/types/transaction'
import { formatBaht, formatDecimal, todayLocal } from '../types/format'

type TransactionFormModalProps = {
  open: boolean
  /** มีค่า = แก้รายการเดิม, ว่าง = เพิ่มใหม่ */
  transaction?: Transaction | null
  /** บันทึก: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงเหนือปุ่ม) */
  onSubmit: (values: TransactionFormValues) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200
const TAG_SUGGESTIONS = ['Core', 'Pillar', 'High Dividend']
const TYPES: { value: TransactionType; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
  { value: 'dividend', label: 'Dividend' },
]

type Errors = Partial<Record<'date' | 'asset' | 'price' | 'units' | 'fee' | 'amount' | 'tag' | 'note', string>>

const inputClass = (invalid: boolean) =>
  `h-11 short:h-10 w-full rounded-pill border-2 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
    invalid ? 'border-red-500' : 'border-blue-500'
  }`

// "1,234.5" → 1234.5, ว่าง → null, ไม่ใช่ตัวเลข → NaN
function parseNumber(text: string) {
  const cleaned = text.replace(/,/g, '').trim()
  return cleaned === '' ? null : Number(cleaned)
}

const toText = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value))

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[12px] leading-4 font-semibold text-navy-900">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
          <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="m-0 mt-1.5 text-[12px] leading-4 text-text-muted">{hint}</p>
      )}
    </div>
  )
}

function Dialog({ transaction, onSubmit, onClose }: Omit<TransactionFormModalProps, 'open'>) {
  const editing = Boolean(transaction)
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'buy')
  const [date, setDate] = useState(transaction?.date ?? todayLocal())
  const [asset, setAsset] = useState<Asset | null>(transaction ? (ASSET_BY_ID.get(transaction.assetId) ?? null) : null)
  const [price, setPrice] = useState(toText(transaction?.price))
  const [units, setUnits] = useState(toText(transaction?.units))
  const [fee, setFee] = useState(toText(transaction?.fee))
  const [amount, setAmount] = useState(toText(transaction?.amount))
  const [tag, setTag] = useState(transaction?.tag ?? '')
  const [note, setNote] = useState(transaction?.note ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const ids = {
    date: useId(),
    price: useId(),
    units: useId(),
    fee: useId(),
    amount: useId(),
    tag: useId(),
    note: useId(),
    tags: useId(),
  }
  const dividend = type === 'dividend'

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  const priceValue = parseNumber(price)
  const unitsValue = parseNumber(units)
  const feeValue = parseNumber(fee)
  const total =
    !dividend && priceValue && unitsValue && !Number.isNaN(priceValue) && !Number.isNaN(unitsValue)
      ? priceValue * unitsValue + (type === 'buy' ? 1 : -1) * (feeValue && !Number.isNaN(feeValue) ? feeValue : 0)
      : null

  function validate(): Errors {
    const found: Errors = {}
    if (!date) found.date = 'Pick the date of this transaction.'
    if (!asset) found.asset = 'Choose a stock or fund from the list.'
    if (dividend) {
      const value = parseNumber(amount)
      if (value === null || Number.isNaN(value) || value <= 0) found.amount = 'Enter the dividend amount (greater than 0).'
      if (unitsValue !== null && (Number.isNaN(unitsValue) || unitsValue < 0)) found.units = 'Enter a valid number of units.'
    } else {
      if (priceValue === null || Number.isNaN(priceValue) || priceValue <= 0) found.price = 'Enter a price greater than 0.'
      if (unitsValue === null || Number.isNaN(unitsValue) || unitsValue <= 0) found.units = 'Enter units greater than 0.'
      if (feeValue !== null && (Number.isNaN(feeValue) || feeValue < 0)) found.fee = 'Enter a fee of 0 or more.'
    }
    if (tag.trim().length > 24) found.tag = 'Keep the tag within 24 characters.'
    if (note.trim().length > 60) found.note = 'Keep the note within 60 characters.'
    return found
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const found = validate()
    setErrors(found)
    setSubmitError(undefined)
    if (Object.keys(found).length > 0 || !asset) return
    setSubmitting(true)
    try {
      await onSubmit({
        type,
        date,
        assetId: asset.id,
        price: dividend ? null : priceValue,
        units: unitsValue,
        fee: dividend ? null : feeValue,
        amount: dividend ? parseNumber(amount) : null,
        note,
        tag,
      })
      setClosing(true)
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : 'Could not save this transaction. Please try again.')
      setSubmitting(false)
    }
  }

  const describedBy = (id: string, error?: string) => (error ? `${id}-error` : undefined)

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => {
        if (!submitting) setClosing(true)
      }}
      cardClassName="max-w-140 p-5 text-left min-[640px]:p-8"
    >
      <h2 id={titleId} className="m-0 text-[24px] leading-8 font-bold text-navy-900 min-[640px]:text-[28px] min-[640px]:leading-9">
        {editing ? 'Edit Transaction' : 'Add Transaction'}
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        Record a buy, a sell or a dividend. Fields marked optional can stay empty.
      </p>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <span id={`${ids.date}-type`} className="block text-[12px] leading-4 font-semibold text-navy-900">
            Type
          </span>
          <div role="radiogroup" aria-labelledby={`${ids.date}-type`} className="mt-1.5 grid grid-cols-3 gap-1 rounded-pill bg-blue-50 p-1">
            {TYPES.map((item) => {
              const selected = item.value === type
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setType(item.value)}
                  className={`h-10 rounded-pill text-[14px] leading-5 font-semibold transition-colors duration-150 ${
                    selected ? 'bg-blue-500 text-surface' : 'text-navy-700 hover:bg-blue-100'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <Field id={ids.date} label="Date" error={errors.date}>
            <input
              id={ids.date}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={describedBy(ids.date, errors.date)}
              className={inputClass(Boolean(errors.date))}
            />
          </Field>
          <AssetPicker label="Stock / Fund" value={asset} onChange={setAsset} error={errors.asset} />
        </div>

        {dividend ? (
          <div className="grid gap-4 min-[640px]:grid-cols-2">
            <Field id={ids.amount} label="Dividend amount (THB)" error={errors.amount}>
              <input
                id={ids.amount}
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="124,000"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={describedBy(ids.amount, errors.amount)}
                className={`${inputClass(Boolean(errors.amount))} text-right tabular-nums`}
              />
            </Field>
            <Field id={ids.units} label="Units held (optional)" error={errors.units} hint="Just for your records">
              <input
                id={ids.units}
                inputMode="decimal"
                autoComplete="off"
                value={units}
                onChange={(event) => setUnits(event.target.value)}
                placeholder="12,000"
                aria-invalid={Boolean(errors.units)}
                aria-describedby={describedBy(ids.units, errors.units)}
                className={`${inputClass(Boolean(errors.units))} text-right tabular-nums`}
              />
            </Field>
          </div>
        ) : (
          <>
            <div className="grid gap-4 min-[640px]:grid-cols-2">
              <Field id={ids.price} label="Price per unit (THB)" error={errors.price}>
                <input
                  id={ids.price}
                  inputMode="decimal"
                  autoComplete="off"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="100.00"
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={describedBy(ids.price, errors.price)}
                  className={`${inputClass(Boolean(errors.price))} text-right tabular-nums`}
                />
              </Field>
              <Field id={ids.units} label="Units" error={errors.units}>
                <input
                  id={ids.units}
                  inputMode="decimal"
                  autoComplete="off"
                  value={units}
                  onChange={(event) => setUnits(event.target.value)}
                  placeholder="1,000"
                  aria-invalid={Boolean(errors.units)}
                  aria-describedby={describedBy(ids.units, errors.units)}
                  className={`${inputClass(Boolean(errors.units))} text-right tabular-nums`}
                />
              </Field>
            </div>
            <div className="grid items-start gap-4 min-[640px]:grid-cols-2">
              <Field id={ids.fee} label="Fee (optional, THB)" error={errors.fee}>
                <input
                  id={ids.fee}
                  inputMode="decimal"
                  autoComplete="off"
                  value={fee}
                  onChange={(event) => setFee(event.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.fee)}
                  aria-describedby={describedBy(ids.fee, errors.fee)}
                  className={`${inputClass(Boolean(errors.fee))} text-right tabular-nums`}
                />
              </Field>
              <div className="rounded-xl bg-blue-50 px-4 py-2.5 min-[640px]:mt-[22px]">
                <p className="m-0 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
                  {type === 'buy' ? 'Total cost' : 'Net proceeds'}
                </p>
                <p aria-live="polite" className="m-0 text-[16px] leading-6 font-bold text-navy-900 tabular-nums">
                  {total === null ? '—' : `${formatBaht(total)} THB`}
                  {total !== null && priceValue ? (
                    <span className="ml-2 text-[12px] font-medium text-text-muted">
                      {formatDecimal(unitsValue ?? 0, 6)} × {formatDecimal(priceValue, 4)}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </>
        )}

        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <Field id={ids.tag} label="Tag (optional)" error={errors.tag}>
            <input
              id={ids.tag}
              list={ids.tags}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="Core, Pillar…"
              aria-invalid={Boolean(errors.tag)}
              aria-describedby={describedBy(ids.tag, errors.tag)}
              className={inputClass(Boolean(errors.tag))}
            />
            <datalist id={ids.tags}>
              {TAG_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>
          <Field id={ids.note} label="Note (optional)" error={errors.note}>
            <input
              id={ids.note}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Semiannual pay"
              aria-invalid={Boolean(errors.note)}
              aria-describedby={describedBy(ids.note, errors.note)}
              className={inputClass(Boolean(errors.note))}
            />
          </Field>
        </div>

        {submitError && (
          <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
            {submitError}
          </p>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => setClosing(true)}
            className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal เพิ่ม/แก้ transaction (mount เฉพาะตอนเปิด ให้ฟอร์มเริ่มใหม่ทุกครั้ง)
export default function TransactionFormModal({ open, ...props }: TransactionFormModalProps) {
  return open ? <Dialog {...props} /> : null
}
