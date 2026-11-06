// สูตรของพอร์ต (database.md หัวข้อ 4) คำนวณจาก transaction ทุกครั้ง ไม่เก็บเป็นตัวเลขแยก
// ตรรกะเดียวกับ frontend/src/shared/data/portfolio-math.ts (หน่วยเป็นบาท)

export type TxMath = {
  type: string;
  date: string;
  price: number | null;
  units: number | null;
  fee: number | null;
  amount: number | null;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/** ต้นทุนของรายการซื้อ = ราคา × หน่วย + ค่าธรรมเนียม */
export const buyCost = (tx: TxMath) => round2((tx.price ?? 0) * (tx.units ?? 0) + (tx.fee ?? 0));

/** ยอดเงินของรายการ: ซื้อ = ต้นทุน, ขาย = ยอดรับสุทธิ, ปันผล = amount */
export function txAmount(tx: TxMath) {
  if (tx.type === 'buy') return buyCost(tx);
  if (tx.type === 'sell') return round2((tx.price ?? 0) * (tx.units ?? 0) - (tx.fee ?? 0));
  return tx.amount ?? 0;
}

function twelveMonthsBefore(asOf: Date) {
  return new Date(Date.UTC(asOf.getUTCFullYear() - 1, asOf.getUTCMonth(), asOf.getUTCDate())).toISOString().slice(0, 10);
}

/** Current Yield Run-Rate = Σ ปันผล 12 เดือนล่าสุด (นับถึงวันนี้) */
export function runRate(txs: TxMath[], asOf = new Date()) {
  const from = twelveMonthsBefore(asOf);
  const to = asOf.toISOString().slice(0, 10);
  return round2(
    txs.filter((tx) => tx.type === 'dividend' && tx.date >= from && tx.date <= to).reduce((sum, tx) => sum + (tx.amount ?? 0), 0),
  );
}

/** Total Recorded DCA = Σ ต้นทุนของรายการซื้อ */
export const totalDca = (txs: TxMath[]) => round2(txs.filter((tx) => tx.type === 'buy').reduce((sum, tx) => sum + buyCost(tx), 0));
