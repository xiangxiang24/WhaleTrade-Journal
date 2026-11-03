import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import banner from '../assets/Banner.png'
import { avgYieldOnCost, dcaSeries, depositMonths, holdings, runRate, totalDca } from '../shared/data/portfolio-math'
import { ASSET_BY_ID } from '../shared/data/assets'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { Transaction, TransactionFormValues } from '../shared/types/transaction'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import PortfolioFormModal from '../portfolio/modals/portfolio-form-modal'
import DcaCard from './components/dca-card'
import DetailHeader from './components/detail-header'
import GoalCard from './components/goal-card'
import HoldingsStrip from './components/holdings-strip'
import LogToolbar, { type SectorTab } from './components/log-toolbar'
import TransactionTable from './components/transaction-table'
import YieldCard from './components/yield-card'
import DeleteTransactionModal from './modals/delete-transaction-modal'
import GoalModal from './modals/goal-modal'
import TransactionFormModal from './modals/transaction-form-modal'
import { csvFilename, buildTransactionsCsv, downloadCsv } from './types/export-csv'
import type { DetailToast } from './types/transaction-logs'
import { usePortfolioDetail } from './types/use-portfolio-detail'
import { useI18n } from '../shared/i18n/use-i18n'

type TransactionLogsProps = {
  /** พอร์ตที่เปิดดู (กด Open จากหน้า Portfolio) */
  portfolioId: number
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  onBack?: () => void
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
}

const CARD = 'rounded-4xl bg-surface shadow-md'
const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

function Message({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className={`${CARD} flex flex-col items-center px-6 py-12 text-center`}>
      <img className="h-36 w-auto min-[640px]:h-44" src={banner} alt="" />
      <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">{title}</p>
      <p className="m-0 mt-1 max-w-110 text-[14px] leading-6 text-text-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

// หน้ารายละเอียดพอร์ต (Goal + สรุป + Holdings + Transaction Logs) เปิดจากปุ่ม Open ในหน้า Portfolio
export default function TransactionLogs({
  portfolioId,
  user,
  reminderBadge,
  onBack,
  onNavigate,
  onLogout,
}: TransactionLogsProps) {
  const { t } = useI18n()
  const { portfolio, transactions, status, reload, addTransaction, editTransaction, removeTransaction, editPortfolio } =
    usePortfolioDetail(portfolioId)
  const { leaving, leaveTo } = usePageLeave()

  const [query, setQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [month, setMonth] = useState('all')
  // txForm = null ปิด, { transaction: null } = เพิ่มใหม่, { transaction } = แก้รายการเดิม
  const [txForm, setTxForm] = useState<{ transaction: Transaction | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [goalOpen, setGoalOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState<DetailToast | null>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  // ตัวเลขสรุปทั้งหมดคำนวณจาก transaction ทุกครั้ง (เพิ่ม/แก้/ลบแล้วการ์ดอัปเดตทันที)
  const summary = useMemo(() => {
    const held = holdings(transactions)
    return {
      rate: runRate(transactions),
      dca: totalDca(transactions),
      months: depositMonths(transactions).length,
      series: dcaSeries(transactions),
      held,
      avgYield: avgYieldOnCost(held),
      yields: new Map(held.flatMap((item) => (item.yieldPct === null ? [] : [[item.asset.id, item.yieldPct] as const]))),
    }
  }, [transactions])

  // แท็บ sector = All (n) + sector ของหุ้นในพอร์ต (n = จำนวนรายการ)
  const tabs = useMemo<SectorTab[]>(() => {
    const counts = new Map<string, number>()
    for (const tx of transactions) {
      const sector = ASSET_BY_ID.get(tx.assetId)?.sector
      if (sector) counts.set(sector, (counts.get(sector) ?? 0) + 1)
    }
    return [
      { value: 'all', label: t('All'), count: transactions.length },
      ...[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, label: t(value), count })),
    ]
  }, [transactions, t])

  const months = useMemo(() => [...new Set(transactions.map((tx) => tx.date.slice(0, 7)))].sort().reverse(), [transactions])

  // ลบรายการจนแท็บ/เดือนที่เลือกไว้หายไป = กลับไปแสดงทั้งหมด
  const sector = tabs.some((tab) => tab.value === sectorFilter) ? sectorFilter : 'all'
  const activeMonth = month === 'all' || months.includes(month) ? month : 'all'

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return transactions.filter((tx) => {
      const asset = ASSET_BY_ID.get(tx.assetId)
      if (sector !== 'all' && asset?.sector !== sector) return false
      if (activeMonth !== 'all' && tx.date.slice(0, 7) !== activeMonth) return false
      return !keyword || (asset?.name.toLowerCase().includes(keyword) ?? false) || (asset?.ticker.toLowerCase().includes(keyword) ?? false)
    })
  }, [transactions, query, sector, activeMonth])

  function clearFilters() {
    setQuery('')
    setSectorFilter('all')
    setMonth('all')
  }

  async function handleSubmitTransaction(values: TransactionFormValues) {
    const editing = txForm?.transaction
    if (editing) await editTransaction(editing.id, values)
    else await addTransaction(values)
    showToast(editing ? t('Transaction updated') : t('Transaction added'))
  }

  async function handleDelete(tx: Transaction) {
    await removeTransaction(tx.id)
    showToast(t('Transaction deleted'))
  }

  async function saveGoal(goal: number | null) {
    if (!portfolio) return
    await editPortfolio({
      name: portfolio.name,
      tagline: portfolio.tagline ?? '',
      description: portfolio.description ?? '',
      icon: portfolio.icon,
      annualGoal: goal,
    })
    showToast(goal ? t('Annual goal updated') : t('Annual goal removed'))
  }

  function handleExport() {
    if (!portfolio || transactions.length === 0) return
    downloadCsv(csvFilename(portfolio.name), buildTransactionsCsv(transactions))
    showToast(t(transactions.length === 1 ? 'Exported {n} transaction' : 'Exported {n} transactions', { n: transactions.length }))
  }

  const goBack = () => leaveTo(onBack)

  return (
    <AppLayout
      active="portfolio"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key === 'portfolio') goBack()
        else leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          {status === 'loading' && (
            <div role="status" aria-label={t('Loading your portfolio')} className="flex flex-col gap-4">
              <div className="h-10 w-48 animate-pulse rounded-pill bg-blue-100 motion-reduce:animate-none" />
              <div className="h-16 w-full max-w-lg animate-pulse rounded-3xl bg-blue-100 motion-reduce:animate-none" />
              <div className="grid gap-4 min-[1360px]:grid-cols-[2fr_1fr_1fr]">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="h-60 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
                ))}
              </div>
              <div className="h-60 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
            </div>
          )}

          {(status === 'error' || status === 'missing') && (
            <Message
              title={status === 'missing' ? t('This portfolio is not here anymore') : t('Could not load this portfolio')}
              description={
                status === 'missing'
                  ? t('It may have been moved to Trash. Head back to your portfolios to pick another one.')
                  : t('Something went wrong. Please try again.')
              }
            >
              {status === 'missing' ? (
                <button type="button" onClick={goBack} className={PRIMARY_BUTTON}>
                  {t('Back to Portfolios')}
                </button>
              ) : (
                <button type="button" onClick={reload} className={PRIMARY_BUTTON}>
                  {t('Try again')}
                </button>
              )}
            </Message>
          )}

          {status === 'ready' && portfolio && (
            <>
              <div className="animate-fade-up motion-reduce:animate-none">
                <DetailHeader
                  portfolio={portfolio}
                  canExport={transactions.length > 0}
                  onBack={goBack}
                  onEdit={() => setEditOpen(true)}
                  onExport={handleExport}
                  onAdd={() => setTxForm({ transaction: null })}
                />
              </div>

              {/* กว้างน้อยกว่า 1360: Goal เต็มแถว แล้ว DCA + Yield 2 คอลัมน์ (design rules 5.2) */}
              <div className="mt-6 grid animate-fade-up grid-cols-1 gap-4 px-1 pb-1 [animation-delay:80ms] min-[640px]:grid-cols-2 min-[1360px]:grid-cols-[2fr_1fr_1fr] min-[1280px]:gap-6 motion-reduce:animate-none">
                <div className="min-[640px]:col-span-2 min-[1360px]:col-span-1">
                  <GoalCard goal={portfolio.annualGoal} rate={summary.rate} onEditGoal={() => setGoalOpen(true)} />
                </div>
                <DcaCard total={summary.dca} depositMonths={summary.months} series={summary.series} />
                <YieldCard yieldPct={summary.avgYield} />
              </div>

              <div className="mt-6 animate-fade-up px-1 [animation-delay:160ms] min-[1280px]:mt-8 motion-reduce:animate-none">
                <HoldingsStrip holdings={summary.held} />
              </div>

              <section
                aria-label={t('Transaction logs')}
                className="mt-6 animate-fade-up px-1 [animation-delay:240ms] min-[1280px]:mt-8 motion-reduce:animate-none"
              >
                <LogToolbar
                  holdingCount={summary.held.length}
                  query={query}
                  onQueryChange={setQuery}
                  tabs={tabs}
                  sector={sector}
                  onSectorChange={setSectorFilter}
                  months={months}
                  month={activeMonth}
                  onMonthChange={setMonth}
                />
                <div className="mt-4">
                  {transactions.length === 0 ? (
                    <Message
                      title={t('No transactions yet')}
                      description={t('Record your first buy, sell or dividend. Your goal progress and yield will grow from here.')}
                    >
                      <button type="button" onClick={() => setTxForm({ transaction: null })} className={PRIMARY_BUTTON}>
                        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
                        {t('Add your first transaction')}
                      </button>
                    </Message>
                  ) : visible.length === 0 ? (
                    <Message title={t('No transactions match')} description={t('Try a different name or clear the filters.')}>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex h-10 items-center rounded-pill px-5 text-[14px] leading-5 font-semibold text-navy-700 hover:bg-blue-50 active:bg-blue-100"
                      >
                        {t('Clear filters')}
                      </button>
                    </Message>
                  ) : (
                    <TransactionTable
                      transactions={visible}
                      yields={summary.yields}
                      onEdit={(tx) => setTxForm({ transaction: tx })}
                      onDelete={setDeleteTarget}
                    />
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <TransactionFormModal
          open={txForm !== null}
          transaction={txForm?.transaction}
          onSubmit={handleSubmitTransaction}
          onClose={() => setTxForm(null)}
        />
        <DeleteTransactionModal transaction={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
        <GoalModal open={goalOpen} goal={portfolio?.annualGoal ?? null} onSubmit={saveGoal} onClose={() => setGoalOpen(false)} />
        <PortfolioFormModal
          open={editOpen}
          portfolio={portfolio}
          onSubmit={async (values) => {
            await editPortfolio(values)
            showToast(t('Portfolio details saved'))
          }}
          onClose={() => setEditOpen(false)}
        />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}
