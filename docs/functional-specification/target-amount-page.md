# Functional Specifications: หน้า Target Amount (คำนวณเงินเป้าหมาย)

หน้าจอนี้เป็นเครื่องมือคำนวณเงินเป้าหมายระยะยาว (Target Calculator) ที่รวมไว้ในหน้าเดียวแบบ Scrollable Page ประกอบด้วย 3 ส่วนหลักเรียงต่อกัน: ฟอร์มคำนวณ, ส่วนแสดงผลลัพธ์คำนวณ (แสดงเมื่อกด Calculate), และรายการแผนที่บันทึกไว้ (Saved Plans)[cite: 7]

---

## 0. แถบเมนูด้านข้าง (Side Bar Navigation)
แถบเมนูด้านซ้ายสุดของหน้าจอ ทำหน้าที่เป็นศูนย์กลางการนำทางหลักทั่วทั้งแอปพลิเคชัน (แบ่งหมวดหมู่ตามข้อกำหนด Iteration 1) ประกอบด้วย:
* **ส่วนหัว (Logo & App Title):** 
  * โลโก้รูปปลาวาฬและชื่อแอป **Whale Trade Journal**
* **กลุ่ม Main:**
  * **My Journals:** เมนูสำหรับกลับสู่หน้าไทม์ไลน์บันทึกหลัก (สถานะ Active ในหน้าจอขณะนี้)[cite: 2]
  * **Portfolio:** เมนูสำหรับเข้าสู่หน้าพอร์ตการลงทุน[cite: 4]
  * **Reminder:** เมนูสำหรับเข้าสู่หน้าการแจ้งเตือนและปฏิทิน (พร้อมแสดงตัวเลข Badge แจ้งเตือนรายการที่ถึงกำหนด)[cite: 6]
* **กลุ่ม Analytics:**
  * **Saved Plan:** เมนูเข้าสู่ส่วนแผนการลงทุนที่บันทึกไว้[cite: 9]
  * **Target Amount:** เมนูเข้าสู่เครื่องคำนวณเงินเป้าหมาย[cite: 7, 8]
* **กลุ่ม Settings:**
  * **Trash:** เมนูเข้าสู่หน้าถังขยะสำหรับกู้คืนหรือลบพอร์ตถาวร[cite: 4, 5]
  * **Setting:** เมนูเข้าสู่หน้าการตั้งค่าระบบและบัญชีผู้ใช้[cite: 10]
* **ส่วนล่างสุดของ Sidebar (User Profile Card):**
  * แสดงรูปโปรไฟล์ ชื่อผู้ใช้ (เช่น *Thomas W.*) และป้ายสถานะ (เช่น *Dividend Haven*) พร้อมปุ่มลัดสำหรับออกจากระบบ (Log out)[cite: 3]

---

## 1. ส่วนหัวของหน้า (Header Section)
* **ป้ายเครื่องมือ:** `MINDFUL PROJECTION TOOL`[cite: 7, 8]
* **ชื่อหน้า (Page Title):** หัวข้อหลัก "Target Calculator ✨"[cite: 7, 8]
* **คำโปรย (Subtitle):** *"Plan gently. A little every month goes a long way toward your quiet sanctuary."*[cite: 7, 8]
* **ป้ายโมเดลคำนวณ (Right Badge):** `Model: Compounded Annualized Growth`[cite: 7, 8]

---

## 2. Section 1: ฟอร์มคำนวณเงินเป้าหมาย (Calculator Form)

ฝั่งซ้ายของฟอร์มแบ่งออกเป็น 3 ขั้นตอนการตั้งค่า:

### ขั้นตอนที่ 1: เลือกแหล่งข้อมูลหุ้น/กองทุน (Where should we start?)
ผู้ใช้สามารถสลับโหมดการดึงข้อมูลได้ 2 รูปแบบผ่าน Toggle / Tab:

#### โหมด 1: Select from Port (`Use a portfolio`) [ภาพที่ 1]
* **Dropdown เลือกพอร์ต (`Choose a portfolio`):** แสดงรายการพอร์ตที่มีอยู่ทั้งหมด (เช่น *Dividend Sanctuary (3 Active Assets)*)[cite: 7]
* **การทำงานของระบบ:** เมื่อเลือกพอร์ตแล้ว ระบบจะดึงรายชื่อหุ้น/กองทุนทั้งหมดที่ถืออยู่ในพอร์ตนั้นมาใส่ในตารางด้านล่างโดยอัตโนมัติ[cite: 7]
* **รายการหุ้นที่ดึงมา:** แสดง Logo, ชื่อหุ้น/สัญลักษณ์ (Ticker), และตลาด/ประเภทหมวดหมู่ (เช่น *SCB - SET · Financials*, *PTT - SET · Energy*, *TTB - SET · Financials*)[cite: 7]
* **ช่องกรอกอัตราปันผล (`DIVIDEND YIELD % PER YEAR`):** ผู้ใช้ต้องระบุเปอร์เซ็นต์ปันผลที่คาดว่าจะได้รับต่อปีของหุ้นแต่ละตัวด้วยตนเอง (เช่น *7.1%*, *6.4%*, *7.8%*)[cite: 7]
* **ปุ่มเสริม:** `+ Add Dividend and Ticker` สำหรับเพิ่มรายการอื่นเพิ่มเติมได้[cite: 7]

#### โหมด 2: Select by User / Enter Manually (`Enter manually`) [ภาพที่ 2]
* **ช่องพิมพ์ค้นหา (`Type Name of Ticker`):** ช่องสำหรับค้นหารายชื่อหุ้น/กองทุนจากภายนอก (อ้างอิงข้อมูล Feature 6) พร้อมปุ่ม `+ Add`[cite: 8]
* **การทำงานของระบบ:** ผู้ใช้พิมพ์ค้นหา คัดเลือกหุ้นทีละตัวเข้ามาในรายการ แล้วกรอกอัตราปันผล % ต่อปีของแต่ละตัวด้วยตนเอง[cite: 8]

---

### ขั้นตอนที่ 2: ตัวเลขเงินต้นและระยะเวลา (Your numbers)
* **Initial principal (THB):** ช่องกรอกเงินต้นเริ่มต้น (เช่น *100,000 THB*)[cite: 7, 8]
* **Monthly DCA (THB):** ช่องกรอกเงินออม/ลงทุนเพิ่มต่อเดือน (เช่น *5,000 THB*)[cite: 7, 8]
* **Duration (years):** ช่องกรอกระยะเวลาลงทุนรวมเป็นจำนวนปี (เช่น *10 years*)[cite: 7, 8]

---

### ขั้นตอนที่ 3: กำหนดเฟสการลงทุน (Split into phases - Optional)
* **สวิตช์ Toggle:** สำหรับเปิด/ปิด การแบ่งเฟสการลงทุนแบบกำหนดสัดส่วนตามช่วงเวลา[cite: 7, 8]
* **การตั้งค่าแต่ละเฟส:**
  * **Phase 1 (เช่น Foundation Stage):** ระบุระยะเวลาปี (เช่น *2 Years*) และจำนวนเงิน DCA ต่อเดือน (เช่น *5,000 THB/month*)[cite: 7, 8]
  * **Phase 2 (เช่น Expansion Stage):** ระบุระยะเวลาปี (เช่น *8 Years*) และจำนวนเงิน DCA ต่อเดือน (เช่น *8,000 THB/month*)[cite: 7, 8]
  * **ปุ่มลบเฟส:** ไอคอนถังขยะสำหรับลบเฟสออกจากรายการ[cite: 7, 8]
  * **ปุ่ม `+ Add phase`:** สำหรับเพิ่มช่วงเฟสการลงทุนถัดไป[cite: 7, 8]
* **แถบ สรุประยะเวลารวม (Calculated timeline):** แสดงผลรวมจำนวนปีของทุกเฟส (เช่น *Total duration: 10 years (2 yrs + 8 yrs)*)[cite: 7, 8]
* **ข้อความชี้แจงสมมติฐาน:**
  > *"We do not assume arbitrary stock price inflation, nor do we fluctuate calculations with volatile daily market ticks. This model presents a grounded, conservative compound estimate based exclusively on reinvested dividend streams."*[cite: 7, 8]

---

### การ์ดสรุปฝั่งขวาและการกดคำนวณ (Sanctuary Summary Sidebar)
การ์ดทางขวามือแสดงสรุปภาพรวมจากฟอร์มแบบเรียลไทม์ก่อนกดคำนวณ:
* **Initial principal:** แสดงยอดเงินต้น (เช่น *100,000 THB*)[cite: 7, 8]
* **Total DCA per phase:** ผลรวม DCA แยกตามเฟส (เช่น *888,000 THB (Phase 1: 120k + Phase 2: 768k)*)[cite: 7, 8]
* **Duration:** ระยะเวลารวม (เช่น *10 years*)[cite: 7, 8]
* **Dividend % applied:** อัตราปันผลเฉลี่ยที่นำมาคิด (เช่น *Avg 7.10%*)[cite: 7, 8]
* **TOTAL INVESTED CAPITAL:** ผลรวมเงินต้น + DCA ทั้งหมด (เช่น *988,000 THB*)[cite: 7, 8]
* **ปุ่มคำนวณ (`Calculate`):** ปุ่มหลักสีฟ้าสำหรับประมวลผล (เมื่อกดคำนวณแล้ว ปุ่มจะเปลี่ยนสถานะเป็น `Recalculate`)[cite: 7, 8]

---

## 3. Section 2: ผลลัพธ์การคำนวณ (Your Estimate / Result Section)

*(หมายเหตุ: ส่วนนี้จะแสดงผลออกมาด้านล่างทันทีหลังกดปุ่ม Calculate โดยมี Format และรูปแบบหน้าตาเหมือนกันเป๊ะทั้งสองโหมด)*[cite: 7, 8]

### 3.1 การ์ดเงินปลายทางที่คาดว่าจะได้ (Expected Amount Banner)
* **ยอดเงินรวมปลายทาง (EXPECTED AMOUNT AT THE END):** แสดงตัวเลขประเมินรวมเด่นชัด (เช่น **1,360,000 THB**)[cite: 7, 8]
* **รายละเอียดการเติบโต:** แสดงยอดเงินที่เพิ่มขึ้นจากผลตอบแทนปันผลทบต้น (เช่น *An estimated increase of +372,000 THB (+371.6%) solely generated from dividend compounding*)[cite: 7, 8]
* **กราฟส่วนโค้งระยะเวลา:** สัญลักษณ์เป้าหมายตามจำนวนปี (เช่น *after 10 years ✨*)[cite: 7, 8]

### 3.2 สัดส่วนเงินต้นและปันผล (Capital & Dividend Proportion)
* **แท็กสรุปอัตราปันผลรายตัว:** แสดงป้ายเปอร์เซ็นต์ปันผลของหุ้นที่เลือก (เช่น `SCB: 7.1%`, `PTT: 6.4%`, `TTB: 7.8%`)[cite: 7, 8]
* **Progress Bar แสดงสัดส่วนโครงสร้างเงิน:**
  * สีฟ้าอ่อน: **Initial Principal** (เช่น *7.4%*)[cite: 7, 8]
  * สีฟ้าเข้ม: **DCA Deposits** (เช่น *65.3%*)[cite: 7, 8]
  * สีเขียว: **Compounded Dividends** (เช่น *27.3%*)[cite: 7, 8]

### 3.3 รายละเอียดตารางสรุปยอดเงิน (Breakdown Table)
* **Initial principal:** แสดงยอดเงินต้น (*100,000 THB*)[cite: 7, 8]
* **DCA — Phase 1 (2 years x 5,000 THB/month):** แสดงยอด DCA สะสมเฟส 1 (*120,000 THB*)[cite: 7, 8]
* **DCA — Phase 2 (8 years x 8,000 THB/month):** แสดงยอด DCA สะสมเฟส 2 (*768,000 THB*)[cite: 7, 8]
* **Expected dividends (reinvested):** แสดงผลตอบแทนปันผลสะสมที่คาดว่าจะได้รับ (**+372,000 THB**)[cite: 7, 8]
* **Total Estimated Value:** ยอดรวมประมาณการทั้งหมด (**1,360,000 THB**)[cite: 7, 8]

---

### 3.4 แถบควบคุมและส่งออกผลลัพธ์ (Footer Action Buttons)
* **ข้อความคำเตือนทางกฎหมาย:** 
  > *"This projection is an illustrative model based on the stated recurring deposits and regular yield reinvestment. It is an educational estimate, not a forecast or guarantee of actual investment returns."*[cite: 7, 8]
* **ปุ่มบันทึกและส่งออก (Action Buttons):**
  * **Save plan:** ปุ่มสีฟ้าสำหรับบันทึกแผนเก็บไว้ใน Section 3 (Saved Plans)[cite: 7, 8]
  * **Export PDF:** ปุ่มส่งออกแผนเป็นไฟล์เอกสาร PDF สวยงามพร้อมใช้งาน[cite: 7, 8]
  * **Export image:** ปุ่มส่งออกแผนเป็นไฟล์รูปภาพ (PNG/JPEG)[cite: 7, 8]
* **ป้ายการันตี:** `Verified 100% Client-Side Simulation`[cite: 7, 8]

