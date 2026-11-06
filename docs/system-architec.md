# Trading Journal — System Architecture

เอกสารนี้สรุปโครงสร้างระบบของแอป Trading Journal (Iteration 1) ว่าประกอบด้วยส่วนไหนบ้าง ใช้เทคโนโลยีอะไร และแต่ละส่วนคุยกันยังไง

---

## 1. ภาพรวม

แอปเป็นเว็บที่หุ้มด้วย Electron ให้ทำงานเป็นแอป macOS ใช้ส่วนตัว (ไม่ขึ้น App Store ไม่มีค่าใช้จ่าย)
โครงสร้างเป็น Client–Server แบบ 3 ชั้น: หน้าจอ (Frontend) → ระบบหลังบ้าน (Backend) → ฐานข้อมูล (Database)

ช่วงแรกทุกส่วนรันบนเครื่อง Mac ของตัวเองทั้งหมด ยังไม่ต้องมีเซิร์ฟเวอร์บนคลาวด์

---

## 2. แผนภาพสถาปัตยกรรม

```
┌──────────────────────────────────────────────────────┐
│  แอป macOS (Electron)                                 │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ RENDERER = Frontend (React)                    │  │
│  │ หน้าจอตามดีไซน์ Stitch:                          │  │
│  │ My Journals / Portfolio / Target Amount /      │  │
│  │ Reminders / Trash / Setting                    │  │
│  └───────────────┬───────────────▲────────────────┘  │
│                  │ IPC           │                   │
│  ┌───────────────▼───────────────┴────────────────┐  │
│  │ MAIN PROCESS (Node.js)                         │  │
│  │ • เปิดหน้าต่างแอป                                │  │
│  │ • ตัวตั้งเวลาเตือน (Scheduler)                    │  │
│  │ • ส่ง macOS Notification                       │  │
│  │ • ให้แอปทำงานเบื้องหลัง / เปิดตอนเริ่มเครื่อง        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │ REST API (JSON) + JWT token
┌──────────────────────▼───────────────────────────────┐
│  BACKEND (Node.js + Express)                          │
│  Auth │ Notes │ Portfolios │ Transactions │ Assets    │
│  Calculator │ Plans │ Reminders & Tasks │ CSV Export  │
└──────────────────────┬───────────────────────────────┘
                       │ SQL (ผ่าน ORM)
┌──────────────────────▼───────────────────────────────┐
│  DATABASE (SQLite ตอนพัฒนา → PostgreSQL ภายหลังได้)     │
└──────────────────────────────────────────────────────┘
                       ▲
                       │ นำเข้า/อัปเดตเป็นระยะ
        แหล่งข้อมูลรายชื่อหุ้น/กองทุนภายนอก (SET + หุ้นสหรัฐ)
```

---

## 3. เทคโนโลยีที่ใช้

Frontend
• React — สร้างหน้าจอ
• CSS หรือ Tailwind — แปลงดีไซน์จาก Stitch
• react-i18next — สลับภาษาไทย/English
• FullCalendar (หรือเขียนเอง) — หน้าปฏิทิน
• html2canvas + jsPDF — Export ผลคำนวณเป็นรูปภาพและ PDF

Desktop (ตัวหุ้มแอป)
• Electron — หุ้มเว็บให้เป็นแอป macOS
• electron-builder — สร้างไฟล์ .app

Backend
• Node.js + Express — API
• bcrypt — เข้ารหัสรหัสผ่าน
• JWT — โทเคนยืนยันตัวตนหลังล็อกอิน
• Prisma (หรือ Sequelize) — คุยกับฐานข้อมูลและจัดการ migration

Database
• SQLite — ตอนพัฒนา ไม่ต้องติดตั้งอะไร
• PostgreSQL — ถ้าจะย้ายขึ้นคลาวด์ในอนาคต

เครื่องมือช่วยตรวจ error
• DevTools ของ Electron/เบราว์เซอร์ — ดู error ฝั่งหน้าจอ
• Postman หรือ curl — ทดสอบ API โดยไม่ต้องมีหน้าจอ
• Prisma Studio — เปิดดูข้อมูลในฐานข้อมูลตรงๆ
• Jest — เขียน test ให้สูตรเครื่องคำนวณ

---

## 4. Electron สำหรับมือใหม่

Electron คือโปรแกรมที่รวมเบราว์เซอร์ (Chromium) กับ Node.js ไว้ในแอปเดียว ทำให้เว็บที่เราเขียนแสดงในหน้าต่างของแอป Mac โดยไม่มีแถบ address bar

มี 2 ส่วนที่ต้องรู้จัก
• Renderer process — คือหน้าเว็บ React ของเรา ทำงานเหมือนเว็บทั่วไป
• Main process — คือโค้ด Node.js ที่คุมตัวแอป ทำสิ่งที่เว็บทำเองไม่ได้ เช่น ส่ง notification ของ macOS และรันตัวตั้งเวลาตอนที่ปิดหน้าต่างอยู่

สองส่วนนี้คุยกันผ่าน IPC โดยมีไฟล์ preload.js เป็นตัวกลางที่เปิดช่องให้ใช้เฉพาะคำสั่งที่อนุญาต
ตัวอย่าง: หน้าจอบอกว่า "ตั้งเตือนใหม่" → main process จำเวลาไว้ → ถึงเวลา main process ส่ง notification และแจ้งหน้าจอให้อัปเดตตัวเลข badge

ตอนพัฒนา: รัน backend, รัน React dev server แล้วให้ Electron เปิด localhost เหมือนเปิดเว็บปกติ ตรวจ error เหมือนทำเว็บทุกอย่าง
ตอนสร้างแอปจริง: electron-builder รวมทุกอย่างเป็นไฟล์ .app ลากไปไว้ในโฟลเดอร์ Applications
ถ้าเปิดครั้งแรกแล้ว macOS เตือนเรื่องความปลอดภัย ให้คลิกขวาที่แอปแล้วเลือก Open

---

## 5. หน้าที่ของแต่ละส่วน

Frontend (React)
• แสดงหน้าจอทั้งหมด รับข้อมูลที่ผู้ใช้กรอก
• เรียก API ของ backend แล้วนำข้อมูลมาแสดง
• เก็บภาษาที่เลือก และแปลข้อความ
• สร้างไฟล์ PDF/รูปจากการ์ดผลลัพธ์

Electron Main process
• เปิดและปิดหน้าต่าง ให้แอปทำงานเบื้องหลังเมื่อปิดหน้าต่าง
• ตัวตั้งเวลาเตือน: เช็คการเตือนที่ถึงเวลาทุกนาที แล้วส่ง macOS notification
• ตั้งให้แอปเปิดอัตโนมัติตอนเปิดเครื่อง (เพื่อให้การเตือนไม่ขาดช่วง)

Backend (Express)
• ตรวจสอบตัวตน (token) ทุกคำขอ และกรองข้อมูลตาม user_id ของคนที่ล็อกอินเสมอ
• ใส่กฎของระบบ: soft delete, คำนวณยอด Goal, สูตรเครื่องคำนวณ
• สร้างไฟล์ CSV

Database
• เก็บข้อมูลทั้งหมดของผู้ใช้

แหล่งข้อมูลหุ้น/กองทุนภายนอก
• ใช้นำรายชื่อเข้ามาเก็บในตาราง assets ของเราเอง (ไม่เรียกจากภายนอกทุกครั้งที่ผู้ใช้พิมพ์ค้นหา)
• ต้องตรวจเงื่อนไขการนำข้อมูลไปใช้ของแหล่งที่เลือกก่อน

---

## 6. โครงสร้างฐานข้อมูล
ให้อ่านข้อมูลคำแนะนำตาม document ที่ ./docs/system-architec.md
---

## 8. Flow การทำงานหลัก

เขียนโน้ต
ผู้ใช้กรอกฟอร์มและเลือกอารมณ์ → Frontend ส่ง POST /api/notes → Backend ตรวจ token แล้วบันทึกพร้อม user_id → ส่งโน้ตใหม่กลับ → Frontend แสดงบนสุดของไทม์ไลน์

เพิ่ม transaction และอัปเดต Goal
ผู้ใช้เพิ่ม transaction → POST → Backend บันทึก → Frontend ขอ GET /api/portfolios/:id ใหม่ → Backend คำนวณยอด Goal จาก transaction ทั้งหมดตอนนั้น → แถบ progress อัปเดต

คำนวณเงินเป้าหมาย
ผู้ใช้กรอกฟอร์ม → POST /api/calculator/calculate → ฟังก์ชันคำนวณ (ไม่แตะฐานข้อมูล) → ส่งผลลัพธ์กลับ → Frontend แสดง Section ผลลัพธ์ → ผู้ใช้กด Save plan → POST /api/plans → หรือกด Export → html2canvas/jsPDF สร้างไฟล์

ตั้งเตือนและแจ้งเตือน
ผู้ใช้ตั้งเตือน → POST /api/reminders → Main process ดึงรายการเตือนที่ยังไม่ถึงเวลา → ทุกนาทีเช็คว่าถึงเวลาหรือยัง → ถึงเวลา: ส่ง macOS notification และสั่ง Frontend อัปเดตตัวเลข badge → ผู้ใช้กดทำเครื่องหมายเสร็จ → PATCH /api/reminders/:id

ลบพอร์ตและกู้คืน
กดลบ → DELETE /api/portfolios/:id → ตั้ง deleted_at → พอร์ตหายจากรายการและไปอยู่ในถังขยะ → กด Restore → ล้าง deleted_at → กด Delete forever → ลบแถวจริง (หลังยืนยัน)

---

## 9. กฎการออกแบบที่ต้องรักษาไว้

1. ทุก query ต้องกรองด้วย user_id ของผู้ที่ล็อกอิน ไม่งั้นข้อมูลคนอื่นจะหลุดมา
2. ยอด Goal คำนวณจาก transaction ตอนที่ขอข้อมูล ไม่เก็บเป็นตัวเลขแยก จึงไม่มีทางไม่ตรงกับรายการจริง
3. สูตรเครื่องคำนวณเป็นฟังก์ชันล้วน (รับตัวเลข ส่งผลออก ไม่แตะฐานข้อมูล) เขียน test และตรวจด้วยมือได้ง่าย
4. พอร์ตในถังขยะ (deleted_at ไม่ว่าง) ต้องไม่ถูกนับในรายการพอร์ต เครื่องคำนวณ และ CSV
5. เวลาเตือนเก็บเป็น UTC แล้วแปลงตามเขตเวลาที่ผู้ใช้ตั้งตอนแสดงผล
6. รายชื่อหุ้น/กองทุนค้นจากตาราง assets ของเราเอง
7. CSV ใส่ UTF-8 BOM ให้ภาษาไทยเปิดใน Excel ได้ไม่เพี้ยน
8. รหัสผ่านเก็บเป็น hash (bcrypt) เท่านั้น ห้ามเก็บข้อความจริง
9. ข้อความทุกอันในหน้าจอผ่านระบบแปลภาษา ห้ามเขียนข้อความตายตัวลงในโค้ด

---

## 10. โครงสร้างโฟลเดอร์ (ที่ใช้จริง)

```
whaletrade-journal/
├── frontend/src/             # Frontend (React) แยกโฟลเดอร์ตามหน้า
│   ├── <หน้า>/               # onboarding, my-journal, journaling, portfolio, transaction-logs,
│   │   ├── components/       # reminder, target-amount, saved-plan, setting-page, trash
│   │   ├── modals/ types/
│   │   └── apis/<หน้า>.ts    # ฟังก์ชันเรียก backend (fetch) ของหน้านั้น
│   └── shared/
│       ├── apis/             # client.ts (request + token), assets.ts
│       └── data/             # ข้อมูลจำลองระหว่างรอต่อ backend (จุดเดียวที่สลับเป็น API)
├── server/                   # Backend (Express + TypeScript) แยกตามฟีเจอร์ชื่อเดียวกับหน้า frontend
│   ├── routes/<ฟีเจอร์>.ts      # ประกาศ endpoint (+ index.ts รวมทุก router)
│   ├── controllers/<ฟีเจอร์>.ts # รับ request ตรวจข้อมูล ตอบ response
│   ├── services/<ฟีเจอร์>.ts    # กฎของระบบ + query ฐานข้อมูล (ทุก query กรอง userId)
│   ├── middleware/           # auth (ตรวจ token)
│   ├── db/client.ts          # สร้าง Prisma client (SQLite)
│   ├── index.ts              # startServer(db, port)
│   └── dev.ts                # ตัวเริ่ม server ตอนพัฒนา (ใช้กับ tsx)
├── electron/                 # ตัวหุ้มแอป (TypeScript): main.ts, preload.ts, (scheduler.ts ภายหลัง)
├── prisma/                   # schema.prisma + migrations
├── seed/ scripts/            # รายชื่อหุ้น/กองทุน และสคริปต์นำเข้า
├── tsconfig.server.json      # compile server + electron + generated → dist/
└── package.json
```

ฟีเจอร์ฝั่ง server: onboarding, my-journal, journaling, portfolio, transaction-logs, reminder, target-amount, saved-plan, setting-page, trash และ assets (รายชื่อหุ้น/กองทุนใช้ร่วมกัน)

**Build / รัน**
- ตอนพัฒนา: `npm run dev` (server ด้วย tsx watch + Vite) ใช้ `tsx` เฉพาะตอนพัฒนาเท่านั้น
- แอปจริง: `npm run build:server` (`prisma generate` + `tsc`) ได้ไฟล์ `.js` ใน `dist/` แล้วรันด้วย Node/Electron ตรงๆ ไม่พึ่ง tsx
- สร้างแอป: `npm run dist` (build frontend + build server + electron-builder) preload เป็น ESM จึงตั้ง `sandbox: false` (ยังคง `contextIsolation: true`)

---

## 11. ลำดับการสร้าง

1. Backend + ฐานข้อมูล + ระบบบัญชี (สมัคร / ล็อกอิน)
2. Frontend หน้า Journal พร้อมแท็กอารมณ์ (ใช้ฟีเจอร์แรกได้จริงเร็วที่สุด)
3. Port: พอร์ต, transaction, การ์ด Goal และถังขยะ
4. รายการหุ้น/กองทุน (เชื่อมกับข้อ 2 และ 3)
5. เครื่องคำนวณ + Export PDF/รูป + แผนที่บันทึก
6. เตือน ปฏิทิน task (ทำก่อนหุ้ม Electron ได้แบบเว็บ แล้วค่อยเปลี่ยนเป็น notification ของ macOS)
7. Setting + สลับภาษา + Export CSV
8. หุ้มเป็นแอป macOS ด้วย Electron ต่อ scheduler และตั้งให้ทำงานเบื้องหลัง

---

## 12. เรื่องที่ต้องตัดสินใจภายหลัง

• แหล่งข้อมูลรายชื่อหุ้น/กองทุน: ใช้เจ้าไหน และเงื่อนไขการใช้งานเป็นอย่างไร
• ที่เก็บข้อมูลระยะยาว: เก็บในเครื่อง หรือย้ายขึ้นคลาวด์ (ถ้าต้องการให้ข้อมูลไม่หายเมื่อเครื่องเสีย หรือใช้หลายเครื่อง)
• การสำรองข้อมูล: ใช้ Export CSV เป็นตัวสำรองหลักไปก่อน