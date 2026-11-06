# WhaleTrade Journal — Database

เอกสารนี้บอกว่าแอปเก็บข้อมูลอะไร ในตารางไหน แต่ละหน้าจออ่าน/เขียนข้อมูลอะไร และกฎของข้อมูลที่ต้องรักษาไว้
ใช้คู่กับ `requirements.md` (ต้องทำอะไร) และ `design_rules.md` (กฎระบบ)

- ฐานข้อมูล: SQLite ไฟล์เดียวในเครื่อง ผ่าน Prisma 7 + `@prisma/adapter-better-sqlite3`
- ตำแหน่งไฟล์ตอนใช้งานจริง: `app.getPath('userData')` ชื่อไฟล์ `whaletrade-journal.db`
- ตำแหน่งไฟล์ตอนพัฒนา: `dev.db` ที่ root (ค่า `DATABASE_URL="file:./dev.db"` ใน `.env`)
- ชื่อฟิลด์ในเอกสารนี้ใช้ camelCase ให้ตรงกับ `prisma/schema.prisma`

> สถานะ: เวอร์ชันสมบูรณ์ — `prisma/schema.prisma` มีครบทุกตาราง 12 ตาราง ได้แก่ `User`, `Asset`, `Note`, `NoteAttachment`, `NoteDraft`, `Portfolio`, `Transaction`, `CalcPlan`, `PlanPhase`, `PlanAsset`, `Reminder`, `Task` และทุกคอลัมน์ตามหัวข้อ 2 (รวม `fullName`, `avatar`, `language`, `timezone`, `recoveryCode` ของ User)

---

## 1. กฎของข้อมูล (อ่านก่อนเขียน schema)

1. **เงินเก็บเป็นจำนวนเต็ม ห้ามใช้ทศนิยมลอยตัว (Float)**
   - จำนวนเงิน (ปันผล, fee, เงินต้น, Goal, DCA): เก็บเป็น **สตางค์** (หน่วยย่อย 2 ตำแหน่ง) เช่น 1,234.50 บาท = `123450`
   - ราคาต่อหน่วย (`price`): กองทุนมี NAV ทศนิยมถึง 4 ตำแหน่ง จึงเก็บคูณ **10,000** เช่น 12.3456 = `123456`
   - จำนวนหน่วย (`units`): เก็บคูณ **1,000,000** เช่น 0.5 หน่วย = `500000` (รองรับหุ้นเศษส่วนและกองทุน)
   - เปอร์เซ็นต์ปันผล: เก็บเป็น **basis points** (4.25% = `425`)
   - การแปลงเป็นตัวเลขแสดงผลทำที่ชั้น service/ฟรอนต์เท่านั้น
2. **ฟิลด์เงินใช้ `BigInt` ใน Prisma ไม่ใช่ `Int`** เพราะ `Int` ของ Prisma เป็น 32 บิต (สูงสุด ≈ 2.1 พันล้าน = 21 ล้านบาทในหน่วยสตางค์ Goal ใหญ่กว่านี้จะล้น) ต้องแปลง BigInt เป็น string/number ก่อนส่ง JSON เพราะ `JSON.stringify` ไม่รองรับ BigInt
3. **ไม่มี enum ใน SQLite** ฟิลด์ที่มีชุดค่า (`type`, `emotion`) เก็บเป็น `String` แล้วตรวจค่าที่อนุญาตในโค้ด backend
   - `Note.emotion`: `overjoyed` | `happy` | `neutral` | `worried` | `sad` | (null = ไม่ระบุ)
   - `Transaction.type`: `buy` | `sell` | `dividend`
   - `Asset.type`: `stock` | `fund`
4. **วันที่ของ transaction เก็บเป็นข้อความ `YYYY-MM-DD`** (ไม่ใช่ DateTime) เพราะเป็น "วันที่ตามปฏิทิน" ไม่ใช่ช่วงเวลา ป้องกันวันเลื่อนเมื่อเขตเวลาต่างกัน
5. **เวลาที่เป็นช่วงเวลาจริง** (`remindAt`, `createdAt` ฯลฯ) เก็บเป็น UTC แล้วแปลงตามเขตเวลาผู้ใช้ตอนแสดงผล
6. **ทุก query ต้องกรองด้วย `userId` ของผู้ที่ล็อกอิน**
   - ตาราง `Transaction` ไม่มี `userId` ตรงๆ ให้ตรวจผ่าน `portfolio.userId` เสมอ (join) ห้ามดึง transaction ด้วย id อย่างเดียว
7. **Soft delete โน้ตและพอร์ต** (`Note.deletedAt` / `Portfolio.deletedAt` มีค่า = อยู่ในถังขยะ โน้ตในถังขยะไม่แสดงในไทม์ไลน์ ไม่นับในชิปอารมณ์ ค้นหาไม่เจอ และไม่อยู่ใน CSV) พอร์ตในถังขยะต้องไม่ถูกนับในรายการพอร์ต, เครื่องคำนวณ และ CSV ส่วน transaction ไม่ลบเมื่อพอร์ตถูก soft delete
8. **ตัวเลขสรุปของพอร์ตไม่เก็บเป็นตัวเลขแยก** (ความคืบหน้า Goal, Run-Rate, Total Recorded DCA, Yield on Cost, Holdings, จำนวน entries) คำนวณจาก transaction ทุกครั้งที่ขอ จึงไม่มีทางไม่ตรงกับรายการจริง (ดูข้อ 4)
9. **ฝั่ง Journal กับฝั่ง Port ไม่เกี่ยวข้องกันเลย** `Note` / `NoteDraft` อ้างอิงแค่ `User` ไม่มี foreign key ไป Portfolio, Transaction หรือ Asset และหน้า Journal ไม่แสดงตัวเลขที่คำนวณจากพอร์ต (ปันผล, Yield ฯลฯ)
10. **รหัสผ่านเก็บเป็น hash (bcrypt) เท่านั้น ส่วนรหัสกู้คืนเก็บแบบเข้ารหัสที่ถอดกลับได้** (เพื่อให้ผู้ใช้ดูและ copy ซ้ำได้ตลอด)
    - เข้ารหัสด้วย AES-256-GCM (`crypto` ของ Node) เก็บ `iv + authTag + ciphertext` เป็นข้อความเดียว (base64)
    - คีย์สุ่มสร้างครั้งแรกที่เปิดแอป เก็บใน Keychain ของ macOS ผ่าน Electron `safeStorage` ห้ามเก็บในไฟล์ `.db` หรือข้างไฟล์ `.db`
    - ตรวจรหัสกู้คืนตอนลืมรหัสผ่าน: ถอดรหัสแล้วเทียบด้วย `timingSafeEqual`
    - ห้ามบันทึกรหัสกู้คืนลง log และห้ามส่งออกใน API ใดนอกจาก endpoint "Show recovery code" ที่ต้องยืนยันรหัสผ่านปัจจุบันก่อน
11. **รอบแรกใช้สกุลเงินบาท (THB) สกุลเดียว ไม่มีการเลือกสกุลเงินและไม่มีตารางอัตราแลกเปลี่ยน**
    - ค่าเงินทุกฟิลด์ที่เก็บ (Transaction, Goal, ยอดในแผน ฯลฯ) เป็นสตางค์ของ THB และแสดงเป็นบาทเสมอ
    - ถ้าเพิ่มการเลือกสกุลเงินในรอบหลัง ไม่ต้องย้ายข้อมูลเดิม เพราะค่าที่เก็บเป็นบาทอยู่แล้ว (ค่อยเพิ่มฟิลด์ `currency` และตารางอัตราแลกเปลี่ยนตอนนั้น)

---

## 2. ตารางและข้อมูลที่เก็บ

### User — บัญชีผู้ใช้
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| email | String unique | ใช้เป็นชื่อบัญชีสำหรับล็อกอิน (ส่งเมลยืนยันไม่ได้เพราะออฟไลน์) แก้ไขได้ในหน้า Settings ต้องไม่ซ้ำกับบัญชีอื่น และต้องกรอกรหัสผ่านปัจจุบันก่อนบันทึก |
| fullName | String | ชื่อเต็มที่กรอกตอนสมัคร แสดงเป็นชื่อใหญ่ข้าง avatar ในหน้า Settings |
| displayName | String | ชื่อที่แสดงในแอป ค่าเริ่มต้นเท่ากับ fullName ตอนสมัคร แก้ได้ที่ช่อง Display name (การ์ดผู้ใช้ใน sidebar ใช้ชื่อนี้) ตัวอักษรย่อ "TW" ในวงกลม avatar ได้จากชื่อนี้ ไม่เก็บแยก |
| passwordHash | String | bcrypt |
| recoveryCode | String | รหัสกู้คืนที่เข้ารหัส AES-256-GCM (ไม่ใช่ hash) สร้างตอนสมัคร แสดงตอนสมัครและดู/copy ซ้ำได้ใน Settings หลังยืนยันรหัสผ่านปัจจุบัน ดูกฎข้อ 10 |
| avatar | String? | path ไฟล์รูปในโฟลเดอร์ userData ว่าง = แสดงตัวอักษรย่อ ("Remove" ตั้งกลับเป็นว่างและลบไฟล์) |
| language | String | `th` / `en` ค่าเริ่มต้น `th` (สวิตช์ ไทย / English) |
| timezone | String | รหัส IANA เช่น `Asia/Bangkok` (ค่าเริ่มต้น) ป้าย "Thailand (UTC+07:00 Bangkok)" และธงสร้างจากรายการประเทศ/เขตเวลาในแอป ใช้แปลงเวลา Reminder และกำหนดสัปดาห์/วันในปฏิทิน |
| tokenVersion | Int | ค่าเริ่มต้น 0 เพิ่มค่าเมื่อเปลี่ยนรหัสผ่าน เพื่อให้ token เก่าใช้ไม่ได้ (ไม่มีฟังก์ชัน "ออกจากระบบทุกอุปกรณ์" แล้ว) |
| createdAt | DateTime | |

### Asset — รายชื่อหุ้น/กองทุน (นำเข้าจาก `seed/assets.json`)
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| ticker | String | |
| name | String | |
| type | String | `stock` / `fund` |
| market | String | เช่น `SET`, `US`, `TH-FUND` (ภาพแสดงเป็น "BKK: SCB" คือตลาด + ticker ประกอบตอนแสดงผล) |
| sector | String? | หมวดอุตสาหกรรม เช่น `Banking`, `Energy` ใช้ทำแท็บกรองในตาราง Port log (ว่างได้ ถ้าแหล่งข้อมูลไม่มี เช่น กองทุน) |
| source | String | แหล่งที่มาของรายการ |
- unique `(market, ticker)` และ index ที่ `name` เพื่อค้นหา
- ไม่เก็บราคา ไม่ผูกกับ user (ทุกคนใช้ร่วมกัน อ่านอย่างเดียว)
- ลบ Asset ที่มี Transaction หรือ PlanAsset อ้างอิงอยู่ไม่ได้ (Restrict)

### Note — บันทึกการลงทุน (เขียนอิสระ)
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | ลบ user = ลบโน้ตทั้งหมด |
| title | String? | ช่อง TITLE ว่างได้ ถ้าว่างหน้าจอแสดงชื่อเริ่มต้นตามภาษา (เช่น "Today Journal") |
| content | String | เนื้อหาในช่อง "Reflective thoughts" เก็บเป็น **JSON string ของเอกสารตัวแก้ไข TipTap** (หัวข้อ รายการ เช็กลิสต์ อ้างอิง เส้นคั่น ตาราง ภาพ ไฟล์แนบ ลิงก์ และตัวหนา/เอียง/ขีดเส้นใต้/สี) โน้ตเก่าที่เป็นข้อความธรรมดายังเปิดได้ (แสดงเป็นย่อหน้า แล้วบันทึกเป็น JSON ตอน Save) |
| contentText | String | ค่าเริ่มต้น `""` **ข้อความล้วนที่ดึงจาก `content`** (ไม่มีรูปแบบ) ให้ backend อัปเดตทุกครั้งที่บันทึก ใช้กับค้นหา ตัวอย่างบนการ์ด นับคำ และ export CSV เพื่อไม่ต้องแกะ JSON ทุกครั้ง |
| emotion | String? | `overjoyed` / `happy` / `neutral` / `worried` / `sad` ว่าง (null) = ไม่ระบุ (แสดงเป็นอีโมจิสีเทา + สถานะ "ไม่ระบุ") ดูตารางอารมณ์ด้านล่าง |
| emotionChangedAt | DateTime? | เวลาที่เปลี่ยนอารมณ์ล่าสุด (เก็บเบื้องหลัง ไม่แสดง) |
| deletedAt | DateTime? | มีค่า = อยู่ในถังขยะ (ว่าง = โน้ตปกติ) |
| createdAt / updatedAt | DateTime | `createdAt` คือวันเวลาที่แสดงบนการ์ด ("21 Sep 2026 \| 21:31") และใช้เรียงไทม์ไลน์ |
- index `(userId, createdAt)` สำหรับไทม์ไลน์, `(userId, emotion)` สำหรับกรองอารมณ์ และ `(userId, deletedAt)` สำหรับถังขยะ
- ลบโน้ตจากหน้าเขียน/แก้ = Soft delete (ตั้ง `deletedAt` และลบ NoteDraft ของโน้ตนั้น) ต้องถามยืนยันก่อน; กู้คืน = ล้าง `deletedAt` (กลับตำแหน่งเดิมตาม `createdAt`); ลบถาวรทำได้เฉพาะจากหน้า Trash ที่ผู้ใช้กดเอง (ลบแถว + ไฟล์แนบ)
- โน้ตเป็นการเขียนอิสระ ไม่มีประเภท ไม่มีช่องเสริม และไม่ผูกกับหุ้น/กองทุนหรือพอร์ตใดเลย (มีแค่ผู้เขียน อารมณ์ หัวข้อ เนื้อหา)
- ไม่เก็บ: จำนวนคำ ("352 words"), ข้อความตัวอย่างย่อบนการ์ด, จำนวนในชิปกรองอารมณ์ (คำนวณตอนแสดง จาก `contentText`)
- **ตัวแก้ไข** ใช้ฟอนต์เดียวกับแอป ไม่มีการเลือกฟอนต์ เปลี่ยนได้เพียงความหนา (ตัวหนา) เอียง ขีดเส้นใต้ และสีตัวอักษร (ค่าสีเก็บเป็น CSS variable ของ token เช่น `var(--color-red-500)`) พิมพ์ `/` เรียกคำสั่งสร้างบล็อก: Text, Heading 1–3, Bulleted List, Numbered List, Check Item, Quote, Horizontal Line, Table, Attachment (ภาพ / ไฟล์ / ลิงก์)
- **โน้ตว่าง** = ไม่มีทั้งข้อความและภาพ/ไฟล์แนบ (โน้ตที่มีแต่ภาพบันทึกได้)

### NoteAttachment — ไฟล์แนบของโน้ต (ภาพและไฟล์)
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| noteId | Int FK → Note | ลบโน้ต = ลบแถวนี้ (cascade) และ **backend ต้องลบไฟล์จริงบนดิสก์ตามด้วย** |
| kind | String | `image` / `file` |
| path | String | ที่อยู่ไฟล์สัมพัทธ์ใต้ `app.getPath('userData')/attachments/` (ห้ามเก็บไฟล์ในไฟล์ `.db`) |
| name | String | ชื่อไฟล์เดิมที่ผู้ใช้แนบ (ใช้ตอนดาวน์โหลด) |
| mime | String | ชนิดไฟล์ เช่น `image/png`, `application/pdf` |
| size | Int | ไบต์ (ไม่เกิน 25 MB จึงใช้ `Int` พอ) |
| createdAt | DateTime | |
- index `(noteId)`
- **ข้อจำกัด:** ภาพไม่เกิน **10 MB** (ต้องเป็น `image/*`), ไฟล์ไม่เกิน **25 MB** ตรวจทั้งฝั่งหน้าจอและ backend
- ในเนื้อโน้ต (`content`) ภาพและไฟล์อ้างถึงไฟล์ผ่าน URL/ที่อยู่ของไฟล์ที่ backend ให้มา; **ลิงก์ (URL) เก็บอยู่ในเนื้อโน้ตเท่านั้น** ไม่มีแถวในตารางนี้ และต้องเป็น `http:` / `https:` / `mailto:`
- ไฟล์แนบ **ไม่รวมใน export CSV** (CSV ครอบคลุมข้อความล้วนเท่านั้น) จึงต้องสำรองโฟลเดอร์ `attachments/` ควบคู่กับไฟล์ `.db`

### NoteDraft — ฉบับร่างที่บันทึกอัตโนมัติ ("Draft Autosaved • Just now")
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | ลบ user = ลบฉบับร่าง |
| noteId | Int? FK → Note | ว่าง = ร่างของโน้ตใหม่ที่ยังไม่เคยกด Save; มีค่า = ร่างของการแก้โน้ตเดิม (ลบโน้ต = ลบร่างตาม) |
| data | String | JSON ของฟิลด์ที่กำลังเขียน (`emotion`, `title`, `content`) |
| savedAt | DateTime | เวลาที่บันทึกอัตโนมัติล่าสุด ใช้แสดง "Just now" |
- unique `(userId, noteId)` ผู้ใช้มีร่างได้ 1 อันต่อโน้ต และ 1 อันสำหรับโน้ตใหม่
  - ข้อควรระวัง: SQLite ถือว่าค่า NULL ไม่ซ้ำกัน unique นี้จึงไม่กันร่างโน้ตใหม่ (`noteId` ว่าง) หลายอัน ให้ service บังคับเอง: หาร่างที่ `noteId` เป็น null ของผู้ใช้ก่อน ถ้ามีให้อัปเดต ถ้าไม่มีจึงสร้าง (ทำใน transaction เดียว)
- ร่างไม่แสดงในไทม์ไลน์ และไม่นับในชิปกรองอารมณ์/จำนวน All
- กด **Save Changes** = เขียนลง Note (สร้างหรืออัปเดต) แล้วลบร่าง; กด **Cancel** = ลบร่าง ค่าใน Note ไม่เปลี่ยน; ปิดหน้าโดยไม่กดอะไร = ร่างยังอยู่ ใช้กู้คืนตอนเปิดหน้าเขียนครั้งถัดไป

### Portfolio — พอร์ต
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | ลบ user = ลบพอร์ตทั้งหมด |
| name | String | เช่น "Dividend Sanctuary" บังคับ ยาวสุด 40 ตัวอักษร (ฟอร์มสร้าง/แก้พอร์ตตรวจก่อนบันทึก) |
| tagline | String? | ข้อความสั้นใต้ชื่อบนการ์ด เช่น "Anchor Portfolio" ยาวสุด 48 ตัวอักษร ไม่บังคับ (หน้ารายละเอียดใช้แสดงเป็นป้ายเหนือชื่อพอร์ตด้วย) |
| description | String? | คำอธิบายยาวใต้ชื่อในหน้ารายละเอียด |
| icon | String? | คีย์ไอคอนที่เลือกจากชุดที่แอปมี: `leaf` (ค่าเริ่มต้น), `bag`, `pot`, `anchor`, `gem`, `landmark` (ไม่เก็บรูป) ค่าว่างหรือไม่รู้จักให้แสดงเป็น `leaf` ตรวจค่าที่อนุญาตในโค้ด backend |
| annualDividendGoal | BigInt? | เป้าเงินปันผลต่อปี หน่วยสตางค์ ว่าง = ยังไม่ตั้ง Goal (การ์ดแสดง "No goal yet" แทนแถบ) ถ้ากรอกต้อง > 0 ฟอร์มรับเป็นบาทเต็มหน่วยแล้วคูณ 100 ก่อนเก็บ |
| deletedAt | DateTime? | มีค่า = อยู่ในถังขยะ |
| createdAt | DateTime | |
| updatedAt | DateTime | ใช้แสดง "Last updated" บนการ์ด ต้องอัปเดตเมื่อพอร์ตหรือ transaction ของพอร์ตถูกเพิ่ม/แก้/ลบ (service สั่ง touch พอร์ตเอง) |
- index `(userId, deletedAt)`
- ไม่มีฟิลด์เงินต้นเริ่มต้นแล้ว (เดิมใช้กับแถบ Goal) เครื่องคำนวณรับเงินต้นเป็นค่าที่กรอกในฟอร์มของมันเอง

### Transaction — รายการใน Port log
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| portfolioId | Int FK → Portfolio | ลบพอร์ตถาวร = ลบ transaction ด้วย (cascade) |
| assetId | Int FK → Asset | |
| type | String | `buy` / `sell` / `dividend` |
| date | String | `YYYY-MM-DD` (คอลัมน์ DATE) |
| price | BigInt? | ×10,000 (ซื้อ/ขายเท่านั้น) |
| units | BigInt? | ×1,000,000 ซื้อ/ขาย = จำนวนหน่วยที่ซื้อ/ขาย, ปันผล = จำนวนหน่วยที่ถืออยู่ตอนรับปันผล (ไม่บังคับ เป็นข้อมูลประกอบ ไม่ถูกนำไปคำนวณ Holdings) คอลัมน์ "12,000 shares" |
| fee | BigInt? | สตางค์ |
| amount | BigInt? | สตางค์ ใช้กับปันผลเท่านั้น (คอลัมน์ AMOUNT) |
| note | String? | ข้อความสั้นใต้วันที่ เช่น "Semiannual pay", "High payout ratio" |
| tag | String? | ป้ายใต้ชื่อหุ้น เช่น "Core", "Pillar" (พิมพ์เองหรือเลือกจากรายการ ไม่บังคับ) |
| createdAt / updatedAt | DateTime | |
- index `(portfolioId, date)` สำหรับตารางรายเดือน และ `(assetId)`
- ค่าที่แสดงในตารางแต่ **ไม่เก็บ** (คำนวณ): Yield ("7.1%"), ยอดต่อเดือน ("10,333 THB / mo"), ชื่อ/ticker/ตลาด/sector (ดึงจาก Asset)

### ชุดอีโมจิอารมณ์ (ไฟล์ตั้งค่าในแอป ไม่ใช่ตารางฐานข้อมูล)
`Note.emotion` เก็บแค่รหัสอารมณ์ ส่วนโค้ดอีโมจิและไฟล์รูปอยู่ในไฟล์ตั้งค่าที่ติดไปกับแอป (เช่น `seed/emotions.json` + โฟลเดอร์ `assets/emotions/`) เพราะรูปอีโมจิ import มาจากเว็บอื่น และแอปต้องทำงานออฟไลน์ จึงต้องเก็บไฟล์รูปไว้ในแอปเอง ห้ามลิงก์รูปจากเว็บตอนใช้งาน

| รหัสใน DB | ลำดับ | โค้ดอีโมจิ (Unicode) | หมายเหตุ |
|---|---|---|---|
| `overjoyed` | 1 | U+1F606 😆 | ค่าเริ่มต้นตามชุดที่คุยกันไว้ ต้องแทนด้วยโค้ดที่ import จริงจากชุดในดีไซน์ |
| `happy` | 2 | U+1F642 🙂 | " |
| `neutral` | 3 | U+1F610 😐 | " |
| `worried` | 4 | U+1F61F 😟 | " (ชื่อ Unicode คือ "worried face") |
| `sad` | 5 | U+1F622 😢 | " |
| (ไม่ระบุ) | — | รูปอีโมจิสีเทา | ใช้แสดงเมื่อ `emotion` เป็น null ไม่เก็บเป็นค่าใน DB |

- แต่ละรายการในไฟล์ตั้งค่ามี: รหัส, ลำดับ, โค้ด Unicode, ชื่อไฟล์รูปในแอป
- บันทึกแหล่งที่มาของรูปและเงื่อนไขการใช้งานไว้ในไฟล์ (เช่น `assets/emotions/SOURCE.md`) เพื่อตรวจสิทธิ์ก่อนแจกจ่ายแอป
- ชื่อที่แสดงบนหน้าจอ ("Overjoyed", "Happy", "Neutral", "Worried", "Sad") มาจากระบบแปลภาษา ไม่เก็บในไฟล์นี้

### Reminder — การเตือน
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | ลบ user = ลบการเตือนทั้งหมด |
| title | String | หัวข้อ เช่น "SCB Ex-Dividend Date (XD)" |
| description | String? | ข้อความรายละเอียดในกล่องใต้หัวข้อ (ในรายการที่เสร็จแล้วแสดงเป็นตัวเอียงใต้ "Done 20 Sep") |
| remindAt | DateTime | UTC เวลาที่แสดงเช่น "25 Sep 2026 • 09:00" แปลงตาม timezone ของผู้ใช้ |
| done | Boolean | ค่าเริ่มต้น false |
| doneAt | DateTime? | เวลาที่ติ๊กเสร็จ ใช้แสดง "Done 20 Sep" |
| notifiedAt | DateTime? | เวลาที่ส่ง macOS notification แล้ว (กันเตือนซ้ำทุกนาที) |
- index `(userId, remindAt)`

### Task — task checkbox
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | ลบ user = ลบ task ทั้งหมด |
| text | String | ข้อความหลายบรรทัดได้ ไม่มีวันที่ (การ์ด Gentle To-Dos) |
| done | Boolean | ค่าเริ่มต้น false |
| createdAt | DateTime | |
- index `(userId, done, createdAt)`
- การเรียง: ที่ยังไม่เสร็จก่อน (ตาม `createdAt`) ที่เสร็จแล้วอยู่ท้าย ขีดฆ่าข้อความ
- ข้อความ "N actions pending" = จำนวน task ที่ `done` เป็น false

### CalcPlan — แผนเครื่องคำนวณที่บันทึก
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | ลบ user = ลบแผนทั้งหมด |
| portfolioId | Int? FK → Portfolio | มีค่า = สร้างแผนโดยเลือกพอร์ต ("Use a portfolio") ว่าง = กรอกเอง ("Enter manually") |
| name | String | |
| principal | BigInt | สตางค์ |
| resultAmount | BigInt | สตางค์ ผลที่แสดงบนการ์ดแผน |
| savedAt | DateTime | |
- index `(userId, savedAt)`
- ป้ายแหล่งที่มาบนการ์ดแสดงชื่อพอร์ต หรือ "Manual Portfolio" เมื่อ `portfolioId` ว่าง
- ลบพอร์ตถาวร → `portfolioId` ถูกตั้งเป็นว่าง (SetNull) ไม่ลบแผน (การ์ดจะเปลี่ยนเป็น "Manual Portfolio") พอร์ตในถังขยะยังอ้างอิงได้ตามปกติ
- ระยะเวลา (ป้าย "10 years") ไม่เก็บ คำนวณจากผลรวม `years` ของ phases

### PlanPhase — ช่วงของแผน
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| planId | Int FK → CalcPlan | cascade |
| orderNo | Int | ลำดับ phase (unique ร่วมกับ `planId`) |
| years | Int | |
| monthlyDca | BigInt | สตางค์ |
- เก็บเป็น phase เสมออย่างน้อย 1 แถว ถ้าผู้ใช้ปิดสวิตช์ "Split into phases" ให้เก็บ 1 แถว (years = Duration, monthlyDca = Monthly DCA) สวิตช์ตอนเปิดแผนกลับมา = เปิดเมื่อมี phase มากกว่า 1 แถว
- ป้ายชื่อ phase ("Foundation Stage", "Expansion Stage") เป็นข้อความคงที่ตามลำดับของหน้าจอ ไม่เก็บ

### PlanAsset — asset ในแผน
| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| id | Int PK | |
| planId | Int FK → CalcPlan | cascade |
| assetId | Int FK → Asset | |
| dividendBp | Int | basis points ของปันผล % ต่อปี เช่น 7.1% = `710` |
- index `(planId)`

> เครื่องคำนวณเป็นฟังก์ชันล้วนไม่แตะฐานข้อมูล กด Calculate ไม่เขียนอะไรลง DB จนกว่าจะกด Save plan เปิดแผนที่บันทึกแล้วให้คำนวณใหม่จาก `principal`, phases, assets ส่วน `resultAmount` มีไว้โชว์ในรายการเท่านั้น

---

## 3. ความสัมพันธ์

```
User 1 ──< Note, NoteDraft, Portfolio, Reminder, Task, CalcPlan   (ลบ User = cascade ทั้งหมด)
Note 0..1 ──< NoteDraft   (ร่างของการแก้โน้ตเดิม; noteId ว่าง = ร่างโน้ตใหม่; ลบ Note = cascade)
Note 1 ──< NoteAttachment   (ลบ Note = cascade และลบไฟล์จริงบนดิสก์ตาม)
Portfolio 1 ──< Transaction   (ลบพอร์ตถาวร = cascade)
Portfolio 0..1 ──< CalcPlan   (อ้างอิงแบบไม่บังคับ; ลบพอร์ตถาวร = SetNull)
CalcPlan 1 ──< PlanPhase, PlanAsset   (cascade)
Asset 1 ──< Transaction, PlanAsset   (Restrict: ลบ Asset ที่ถูกอ้างอิงไม่ได้)
```

---

## 4. สูตรที่อ่านจากข้อมูล

คำนวณจาก transaction ของพอร์ตนั้นเท่านั้น (ไม่รวมพอร์ตในถังขยะ) ไม่ใช้ราคาตลาด

- **ต้นทุนของ transaction ซื้อ** (สตางค์) = `round(price × units ÷ 100,000,000) + fee` (price ×10⁴, units ×10⁶, หารด้วย 10⁸ เพื่อได้สตางค์ ปัดครึ่งขึ้น)
- **Current Yield Run-Rate** = Σ `amount` ของ transaction `dividend` ที่ `date` อยู่ใน 12 เดือนล่าสุดนับจากวันนี้ (ใช้เฉพาะปันผลที่ผู้ใช้บันทึกไว้ ไม่มีข้อมูลปันผลที่ประกาศล่วงหน้า เพราะแอปออฟไลน์)
- **ความคืบหน้า Goal (%)** = Run-Rate ÷ `annualDividendGoal` ถึง ≥ 100% = "ถึงเป้าแล้ว" ถ้ายังไม่ตั้ง Goal ให้แสดงปุ่มตั้ง Goal แทนแถบ
- **Next milestone** = จุดที่เล็กที่สุดใน 25% / 50% / 75% / 100% ของ Goal ที่มากกว่า Run-Rate ปัจจุบัน และ "เหลืออีก" = milestone − Run-Rate (ตัวอย่างในภาพ: Goal 2,000,000, Run-Rate 800,000 → milestone 1,000,000 เหลือ 200,000)
- **Total Recorded DCA** = Σ ต้นทุนของ transaction `buy` (ไม่หักรายการ Sell ไม่นับปันผล การซื้อ DRIP ที่ผู้ใช้บันทึกเป็น Buy ถูกนับตามปกติ)
  - **"Across N monthly deposits"** = จำนวนเดือน (`YYYY-MM`) ที่ไม่ซ้ำกันซึ่งมี `buy` อย่างน้อย 1 รายการ
  - **ช่วงเวลาใต้กราฟ** (เช่น Nov 2021 – Oct 2024) = เดือนของ `buy` แรกและล่าสุด และกราฟเส้น = ยอดสะสมของ Total Recorded DCA รายเดือน
- **Holdings** (แต่ละ asset) = Σ units ซื้อ − Σ units ขาย แสดงเฉพาะที่ > 0 พร้อม ticker และจำนวนหน่วย; ป้าย "N shares" ที่หัวตาราง = จำนวน asset ใน Holdings
- **ต้นทุนเฉลี่ยของ asset** = Σ ต้นทุนซื้อ ÷ Σ units ซื้อ (วิธีต้นทุนเฉลี่ย) และ **ต้นทุนที่ถืออยู่** = units ที่ถืออยู่ × ต้นทุนเฉลี่ย
- **Avg. Yield on Cost** (ระดับพอร์ต) = Run-Rate ของ asset ที่ยังถืออยู่ ÷ Σ ต้นทุนที่ถืออยู่
- **Yield (% ปันผลต่อปี)** คอลัมน์ในตาราง Port log = ปันผล 12 เดือนล่าสุดของ asset นั้น ÷ ต้นทุนที่ถืออยู่ของ asset นั้น ได้ค่าเดียวกันทุกแถวของ asset เดียวกัน (ซื้อ/ขาย/ปันผล) ถ้าไม่มีหน่วยที่ถืออยู่ให้แสดง "—" ไม่ใช่ปันผลของแถวนั้นแถวเดียว เพราะปันผลครั้งเดียวไม่บอกอัตราต่อปี
- **ยอดต่อเดือนใต้ AMOUNT** = `amount` ÷ 12 (ตามภาพ คือแสดงเป็นยอดเทียบรายเดือน)
- **ข้อมูลบนการ์ดในหน้ารายการพอร์ต** (หน้า Your Portfolios) ทุกค่าอ่านจากตาราง ไม่มีคอลัมน์สรุปแยก:

| ที่แสดงบนการ์ด | มาจาก | หมายเหตุ |
|---|---|---|
| ไอคอน / ชื่อ / คำอธิบายใต้ชื่อ | `icon` / `name` / `tagline` | `tagline` ว่าง = ไม่แสดงบรรทัดนั้น |
| ANNUAL GOAL | `annualDividendGoal` | ว่าง = "No goal yet" + ข้อความชวนตั้งเป้า ไม่แสดงแถบ |
| "N reached" | Run-Rate (สูตรด้านบน) | ปันผลที่บันทึกใน 12 เดือนล่าสุด ไม่ใช่เงินต้น + DCA |
| % และความกว้างแถบ | `min(100, floor(Run-Rate ÷ Goal × 100))` | ปัดลงเพื่อไม่ขึ้น 100% ก่อนถึงเป้าจริง |
| ป้าย "100% full" + แถบเขียว | Run-Rate ≥ Goal | เปอร์เซ็นต์ไม่เกิน 100 แม้ Run-Rate มากกว่า Goal |
| Total recorded DCA | Σ ต้นทุน `buy` | |
| Transactions "N entries" | `count(Transaction)` ของพอร์ต | ทุก type (buy / sell / dividend) |
| Last updated | `Portfolio.updatedAt` | service ต้อง touch เมื่อพอร์ตหรือ transaction ถูกเพิ่ม/แก้/ลบ |
| ป้าย "N portfolios" | `count(Portfolio where userId, deletedAt = null)` | ไม่นับพอร์ตในถังขยะ |

- **รูปที่ API ส่งให้หน้ารายการพอร์ต** (เงินส่งเป็นสตางค์ในรูป string เพราะ BigInt, ฟรอนต์แปลงเป็นบาท): `{ id, name, tagline, icon, annualGoal, reached, totalDca, entries, updatedAt }` ตรงกับ type `Portfolio` ใน `frontend/src/shared/types/portfolio.ts` ซึ่งใช้ข้อมูลจำลองอยู่ใน `shared/data/portfolios.ts` (ไฟล์เดียวที่ต้องแก้ตอนต่อ API)
- **การดึงรายการ**: query เดียวกรอง `userId` + `deletedAt` ว่าง แล้วรวมค่าจาก `Transaction` ด้วย `groupBy portfolioId` (ใช้ index `(portfolioId, date)`) ห้ามวน query ทีละพอร์ต; เรียงตาม `id` น้อย → มาก
- **การกระทำบนการ์ด**: สร้าง = insert `Portfolio` (ยังไม่มี transaction จึง reached/DCA = 0, entries = 0), แก้ = update `name` / `tagline` / `icon` / `annualDividendGoal` แล้ว touch `updatedAt`, Move to Trash = ตั้ง `deletedAt` (transaction ไม่ถูกแตะ), Undo / Restore = ล้าง `deletedAt`
- ปุ่ม "Preview empty slate" เป็นโหมดดูตัวอย่างของหน้าจอเท่านั้น ไม่อ่านหรือเขียนข้อมูล
- **แท็บกรองในตาราง** = "All (n)" + ค่า `sector` ที่ไม่ซ้ำของ asset ในพอร์ตนั้น; **ช่องค้นหา** ค้นจากชื่อ/ticker ของ asset

### หน้า My Journals และหน้าเขียน/แก้โน้ต (คำนวณจาก Note ของผู้ใช้ ตาม timezone ที่ตั้งไว้)
- **ไทม์ไลน์/ตารางการ์ด**: Note ของผู้ใช้เรียงตาม `createdAt` ใหม่ไปเก่า (ไม่รวม NoteDraft) การ์ดแสดง ป้ายอารมณ์, `title`, ข้อความตัวอย่าง 4 บรรทัดแรกของ `content`, วันเวลา `createdAt`; สีการ์ดตาม `emotion` (ไม่มีป้ายประเภทแล้ว)
- **ชิปกรองอารมณ์**: "All (n)" = จำนวนโน้ตทั้งหมด (รวมที่ไม่ระบุอารมณ์) และแต่ละอารมณ์ = จำนวนโน้ตที่ `emotion` ตรงกัน ผลรวมของอารมณ์ทั้ง 5 จึงน้อยกว่าหรือเท่ากับ All โน้ตที่ไม่ระบุอารมณ์ (null) เห็นได้ใน All เท่านั้น เพราะดีไซน์ไม่มีชิปแยกให้
- **ช่องค้นหา "Search Journal Book"**: ค้นใน `title` และ `content` (ไม่สนตัวพิมพ์ใหญ่เล็กสำหรับภาษาอังกฤษ) ใช้ร่วมกับชิปอารมณ์ได้
- **จำนวนคำในหน้าเขียน** ("352 words"): นับจาก `content` ตอนแสดง (ภาษาไทยไม่มีช่องว่างคั่นคำ ให้ใช้ `Intl.Segmenter` ตัดคำ) ไม่มีเวลาอ่าน
- **ตัวเลือกอารมณ์ 5 แบบ** เก็บเป็นรหัส `overjoyed` / `happy` / `neutral` / `worried` / `sad` ชื่อที่แสดงมาจากระบบแปลภาษา อีโมจิมาจากชุดตั้งค่า (ดูหัวข้อ "ชุดอีโมจิอารมณ์"); ผู้ใช้ไม่เลือกก็ได้ ถ้ายังไม่เลือกแสดงอีโมจิสีเทาและสถานะ "ไม่ระบุ" เมื่อเปลี่ยนอารมณ์ (เลือกหรือยกเลิกการเลือก) ตั้ง `emotionChangedAt` เป็นเวลาปัจจุบัน
- **ปุ่ม Delete note** แสดงเฉพาะโน้ตที่มีอยู่แล้ว

### หน้า Target Amount (เครื่องคำนวณ ฟังก์ชันล้วน ไม่ใช้ราคาตลาด ไม่สมมติราคาหุ้นเพิ่ม)
**ค่าตั้งต้นของฟอร์ม**
- เลือกพอร์ต: แสดงพอร์ตที่ `deletedAt` ว่าง ป้าย "(3 Active Assets)" = จำนวน asset ที่ถืออยู่ (units สุทธิ > 0)
- เมื่อเลือกพอร์ต ระบบโหลด asset ที่ถืออยู่มาเป็นรายการ และ **เติมช่อง "Dividend Yield % per year" ด้วย Yield ของ asset นั้นในพอร์ต** (สูตรเดียวกับคอลัมน์ Yield ในหน้าพอร์ต เช่น 7.1 / 6.4 / 7.8) ผู้ใช้แก้ตัวเลขได้ ถ้าคำนวณ Yield ไม่ได้ (ยังไม่มีปันผลที่บันทึก) ให้เว้นช่องว่างให้กรอก
- ทั้งโหมดพอร์ตและโหมดกรอกเอง ผู้ใช้เพิ่ม asset เพิ่มเองได้ ("Add Dividend and Ticker" / ช่องค้นหา ticker) จากตาราง Asset ในเครื่อง
- ถ้าเปิดสวิตช์ phases: Duration = ผลรวม `years` ของ phases (ภาพแสดง "Total duration: 10 years (2 yrs + 8 yrs)") และ Monthly DCA ที่ด้านบนไม่ถูกใช้
- ถ้าปิดสวิตช์: ใช้ phase เดียว (years = Duration, monthlyDca = Monthly DCA)

**สูตรคำนวณ** (จำนวนเต็มสตางค์ ปัดครึ่งขึ้นทุกขั้น)
1. `avgYield` = ค่าเฉลี่ยแบบเท่ากันของ `dividendBp` ทุก asset ในรายการ (ภาพ: (7.1 + 6.4 + 7.8) ÷ 3 = 7.10%) ถ้าไม่มี asset ใช้ 0
2. เริ่มจาก `balance` = `principal`
3. วนทีละ phase ตามลำดับ และทีละเดือนตลอด `years × 12` เดือนของ phase นั้น: `balance += monthlyDca` แล้ว `balance += round(balance × avgYield ÷ 12)` (ปันผลถูกนำกลับไปลงทุนทุกเดือน ไม่มีการเติบโตของราคา)
4. `totalInvested` = `principal` + Σ (`years × 12 × monthlyDca`) ของทุก phase (การ์ด "Total Invested Capital")
5. `expectedAmount` = `balance` สุดท้าย (การ์ด "Expected amount at the end")
6. `expectedDividends` = `expectedAmount` − `totalInvested` (ส่วน "+X THB") และ `increase %` = `expectedDividends` ÷ `totalInvested`
7. สัดส่วนในแท่ง Capital & Dividend Proportion = `principal` ÷ `expectedAmount`, ผลรวม DCA ÷ `expectedAmount`, `expectedDividends` ÷ `expectedAmount`
- "Total DCA per phase" ใน Sanctuary Summary = `years × 12 × monthlyDca` ของแต่ละ phase (ตัวอย่างในภาพ: 120,000 และ 768,000 รวม 888,000)
- Sanctuary Summary แสดงค่าจากฟอร์มทันที (ยังไม่ต้องกด Calculate) ส่วน "Your Estimate" แสดงหลังกด Calculate

**ค่าอ้างอิงสำหรับเขียน test**: principal 100,000 บาท, phase 1 = 2 ปี × 5,000/เดือน, phase 2 = 8 ปี × 8,000/เดือน, avgYield 7.10% → `totalInvested` = 988,000 บาท (ตรงภาพ) และ `expectedAmount` ≈ 1,466,867 บาท (±2 บาทจากการปัดเศษ) ตัวเลข 1,360,000 ในภาพตัวอย่างไม่ตรงกับสูตรนี้ (ใกล้เคียงกับกรณี "ไม่นำปันผลไปลงทุนต่อ" ที่ได้ ≈ 1,356,000) จึงไม่ใช้เป็นค่าทดสอบ

### หน้า Saved Plans
- การ์ดแผน: ชื่อ (`name`), "Saved <วันที่>" (`savedAt`), Expected amount (`resultAmount`), ป้ายระยะเวลา (ผลรวม `years`), ป้ายแหล่งที่มา (ชื่อพอร์ต หรือ "Manual Portfolio") ป้าย "3 saved plans" = จำนวนแผนของผู้ใช้
- เรียงตาม `savedAt` ใหม่ไปเก่า

### หน้า Reminders & Calm Tasks (คำนวณจาก Reminder / Task ของผู้ใช้ ตาม timezone ที่ตั้งไว้)
- **ปฏิทิน**: เดือนที่เลือก ทุกวันที่มี Reminder อย่างน้อย 1 รายการ (ไม่ว่าเสร็จหรือไม่) แสดงเครื่องหมาย "Event" วันนี้แสดงเครื่องหมาย "Today" แยกสีวันที่มีเฉพาะรายการที่เสร็จแล้ว
- **Scheduled In Day**: Reminder ของวันที่ผู้ใช้กดในปฏิทิน (ค่าเริ่มต้น = วันนี้) เรียงตามเวลา แต่ละรายการมี title, description, เวลา, ปุ่ม Edit, วงกลมติ๊กเสร็จ (ตั้ง `done` และ `doneAt`)
- **ป้าย "N due this week"** = จำนวน Reminder ที่ `done` เป็น false และ `remindAt` อยู่ในสัปดาห์นี้ (จันทร์–อาทิตย์ ตามภาพที่ปฏิทินเริ่มวันจันทร์)
- **badge ที่เมนู Notification** = จำนวน Reminder ที่ `done` เป็น false และ `remindAt` ≤ ตอนนี้ (ถึงเวลาแล้ว)
- **การ์ด Gentle To-Dos** ใช้ตาราง Task ไม่เกี่ยวกับวันที่ และไม่ปรากฏในปฏิทิน

### หน้า Settings
- **Account**: อ่าน/เขียน `displayName`, `email`, `avatar` และอ่าน `fullName` (หัวข้อใหญ่ข้าง avatar) การเปลี่ยนอีเมลต้องกรอกรหัสผ่านปัจจุบัน และตรวจว่าไม่ซ้ำกับบัญชีอื่น ปุ่ม Save Changes บันทึก ปุ่ม Cancel คืนค่าที่ยังไม่บันทึก
- **Language & Display**: อ่าน/เขียน `language`, `timezone` ด้วยปุ่ม Save preferences (ไม่มีการเลือกสกุลเงินในรอบแรก ดูกฎข้อ 11)
- **Change password**: ตรวจรหัสเดิม → บันทึก `passwordHash` ใหม่ และเพิ่ม `tokenVersion` (ทำให้ token เก่าใช้ไม่ได้)
- **Show recovery code**: ผู้ใช้กรอกรหัสผ่านปัจจุบัน → ระบบถอดรหัส `recoveryCode` แล้วแสดงพร้อมปุ่ม Copy (ไม่เก็บค้างในหน้าจอ ซ่อนอีกเมื่อออกจากหน้า)
- **Delete account**: ลบแถว User แล้วข้อมูลลูกทั้งหมดถูกลบตามกัน (Note, NoteDraft, Portfolio → Transaction, Reminder, Task, CalcPlan → PlanPhase, PlanAsset) และลบไฟล์ avatar ในโฟลเดอร์ userData ต้องถามยืนยันก่อน

### ข้อมูลในภาพที่ไม่เก็บในฐานข้อมูล
- ข้อความตกแต่ง (A peaceful session, วันที่วันนี้, คำคม/ชื่อผู้พูด, ปุ่ม Preview empty slate) เป็นส่วนของหน้าจอ/ระบบแปลภาษา
- **"Market quiet"** และ **SET Index avg ~3.2% / spread**: เป็นข้อมูลภายนอก แอปออฟไลน์จึงไม่มีให้ ต้องเป็นค่าคงที่ในไฟล์ตั้งค่าของแอป (เช่น `seed/benchmarks.json`) หรือตัดออกจากดีไซน์ ถ้าใช้ค่าคงที่ spread = Avg. Yield on Cost − ค่าเฉลี่ยตลาดในไฟล์
- ข้อความตกแต่งในหน้า My Journals ("Welcome back", ป้าย "Safe Haven", "Market feels noisy today? Take a deep breath") และในหน้าเขียนโน้ต ("Your thoughts are safe, private, and encrypted", "Parchment Edition", "You can change this anytime…") เป็นข้อความคงที่ ไม่เก็บ; ข้อความตกแต่งในหน้า Reminders ("Roots grow quietly…", "Mindful discipline active", "Autumn Compounding 2026", ข้อความ "Model: Compounded Annualized Growth" และ "Verified 100% Client-Side Simulation" ในหน้า Target Amount, ข้อความ "Next planned portfolio update … days of undisturbed calm remaining") และ "Dividend Haven" ใต้ชื่อผู้ใช้ใน sidebar เป็นข้อความคงที่ของหน้าจอ/ระบบแปลภาษา ไม่ใช่ข้อมูลผู้ใช้

---

## 5. หน้าจอ ↔ ข้อมูล

| หน้า/ส่วน | อ่านจาก | เขียนไปที่ |
|---|---|---|
| Sign up / Log in | User | User (สร้างบัญชี, `recoveryCode`) |
| Forgot password | User (`recoveryCode` เทียบ) | User (`passwordHash`, `tokenVersion`) |
| My Journals (การ์ด, ชิปอารมณ์, ค้นหา) | Note | — (export CSV อ่าน Note) |
| Write / Edit Note | Note, NoteDraft, NoteAttachment | Note (สร้าง/แก้/ลบ รวม `content` JSON และ `contentText`), NoteDraft (บันทึกอัตโนมัติ/ลบเมื่อ Save/Cancel), NoteAttachment (แนบภาพ/ไฟล์) |
| Portfolio List (การ์ดพอร์ต) | Portfolio (deletedAt ว่าง), Transaction (Run-Rate, DCA, จำนวน entries) | Portfolio (สร้าง/แก้ชื่อ tagline icon, ลบ = ตั้ง deletedAt) |
| Trash | Note และ Portfolio (deletedAt มีค่า), Transaction (จำนวน), CalcPlan (จำนวนแผนที่อ้างอิงพอร์ต) | Note / Portfolio (restore ล้าง deletedAt / ลบถาวร / ล้างถังขยะรายแท็บ; ลบพอร์ตถาวร = ลบ Transaction ทั้งหมดและตั้ง `CalcPlan.portfolioId` เป็นว่าง) |
| Portfolio Detail: การ์ด Annual Dividend Goal | Portfolio, Transaction (dividend) | Portfolio (`annualDividendGoal`) |
| Portfolio Detail: การ์ด Total Recorded DCA | Transaction (buy) | — |
| Portfolio Detail: การ์ด Avg. Yield on Cost | Transaction, Asset | — |
| Portfolio Detail: Holdings | Transaction, Asset | — |
| Portfolio Detail: ตาราง Port log | Transaction, Asset (ชื่อ, ticker, ตลาด, sector) | Transaction (เพิ่ม/แก้/ลบ รวม note, tag), export CSV |
| Target Amount: ส่วน 1 เลือกที่มา (Use a portfolio / Enter manually) | Portfolio (deletedAt ว่าง), Transaction (Holdings และ Yield ของแต่ละ asset), Asset (ค้นหา ticker) | — |
| Target Amount: ส่วน 2–3 ตัวเลขและ phases | — (ค่าที่กรอกอยู่ในหน้าจอ) | — |
| Target Amount: Sanctuary Summary + Your Estimate | — (คำนวณจากค่าในฟอร์ม) | CalcPlan, PlanPhase, PlanAsset เฉพาะเมื่อกด Save plan |
| Saved Plans (หน้า "Personal Vault") | CalcPlan, PlanPhase (ผลรวม years), Portfolio (ชื่อแหล่งที่มา) | CalcPlan (ลบ, เปลี่ยนชื่อ), Open = เปิดหน้าสรุปผลของแผน (คำนวณใหม่จากข้อมูลที่บันทึก) |
| Reminders: ปฏิทิน + Scheduled In Day | Reminder | Reminder (สร้าง/แก้/ลบ, ติ๊กเสร็จ) |
| Reminders: Gentle To-Dos | Task | Task (เพิ่ม, ติ๊ก, ลบ) |
| Reminders: ป้าย due this week | Reminder | — |
| Setting: Account | User | User (`displayName`, `email`, `avatar`) |
| Setting: Language & Display | User | User (`language`, `timezone`) |
| Setting: Account Security | User (รวมดูรหัสกู้คืน) | User (`passwordHash`, `tokenVersion`) / ลบบัญชี = ลบข้อมูลทั้งหมด |
| ตัวเลือกหุ้น/กองทุน (ทุกหน้า) | Asset | — |

---

## 6. Schema และ Migration

- `prisma/schema.prisma` มีครบทั้ง 12 ตารางตามหัวข้อ 2 แล้ว (migration ล่าสุด `rich_notes_and_attachments` เพิ่ม `Note.contentText` และตาราง `NoteAttachment`) ไม่ต้องทยอยเพิ่มตามฟีเจอร์
- ถ้าเครื่องไหนยังมี migration เก่าที่มีแค่ตาราง User: รัน `npx prisma migrate dev --name complete_schema` ครั้งเดียวเพื่อสร้างตารางที่เหลือ แล้ว `npx prisma generate`
- แก้ `schema.prisma` ครั้งต่อไป: `npx prisma migrate dev --name <ชื่อ>` แล้ว `npx prisma generate` และอัปเดตเอกสารนี้ให้ตรงกันทุกครั้ง

---

## 7. Seed และการสำรองข้อมูล

- `seed/assets.json` สร้างตอนพัฒนาด้วย `scripts/import-assets.js` ติดไปกับแอป นำเข้าครั้งแรกที่เปิดแอป (ทำซ้ำได้ ไม่ซ้ำรายการเพราะ unique `(market, ticker)`)
- Export CSV: transaction ของพอร์ต (ไม่รวมพอร์ตในถังขยะ) และโน้ตทั้งหมด (ใช้ `contentText` ข้อความล้วน ไม่รวมภาพ/ไฟล์แนบ) ใส่ UTF-8 BOM ให้ภาษาไทยเปิดใน Excel ได้ ไม่รวมแผนเครื่องคำนวณ
- สำรองไฟล์ `.db` ทั้งไฟล์ควบคู่กัน (CSV ไม่ครอบคลุมแผนที่บันทึก)