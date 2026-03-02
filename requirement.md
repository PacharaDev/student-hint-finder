# Requirement: Real-time Student Hint System (Google Sheets Integration)

## 1. Project Overview
ระบบเว็บหน้าเดียว (Single Page Application) สำหรับให้นิสิตกรอกรหัสเพื่อค้นหา "คำใบ้พี่รหัส" โดยดึงข้อมูลแบบ Real-time จาก Google Sheet ที่ผู้ใช้มีสิทธิ์เพียง Viewer (อ่านได้อย่างเดียว) ระบบต้องรองรับการแบ่งรอบคำใบ้ (3 รอบ) ผ่าน URL Parameter

## 2. Tech Stack
- **Frontend:** HTML5, Tailwind CSS (CDN), Vanilla JavaScript.
- **Backend API:** Google Apps Script (GAS) ทำหน้าที่เป็น API Proxy ดึงข้อมูลจาก Google Sheet.

## 3. Data Structure (Reference from Google Sheet)
- **Sheet ID:** `1LELctfbeEVU9DTZqoUpygnzujZa1gbkfWSh4s_0K4mo`
- **Sheet Name:** `Sheet1`
- **Columns Mapping:**
    - `Column B (Index 1)`: รหัสนิสิต (Student ID) - ใช้เป็น Unique Key
    - `Column E (Index 4)`: คำใบ้รอบที่ 1
    - `Column F (Index 5)`: คำใบ้รอบที่ 2
    - `Column G (Index 6)`: คำใบ้รอบที่ 3

## 4. Backend Requirements (Google Apps Script)
- สร้างฟังก์ชัน `doGet(e)` ที่รับ Query Parameters: `id` (รหัสนิสิต) และ `round` (1, 2, หรือ 3).
- ใช้ `SpreadsheetApp.openByUrl()` เพื่อเปิด Google Sheet.
- ค้นหาข้อมูลจากแถวที่มีรหัสนิสิตตรงกับ `id` ที่ส่งมา.
- คืนค่าผลลัพธ์เป็น JSON Object:
    - กรณีพบข้อมูล: `{ "success": true, "hint": "ข้อความคำใบ้", "name": "ชื่อนิสิต" }`
    - กรณีไม่พบ: `{ "success": false, "message": "ไม่พบรหัสนิสิต" }`
- ต้องตั้งค่า Deployment ให้ "Anyone" สามารถเข้าถึงได้ (Access: Anyone).

## 5. Frontend Requirements (index.html)
### 5.1 UI/UX Design
- **Mobile-First Design:** ปรับแต่งให้ใช้งานง่ายบนสมาร์ทโฟน
- **Round Indicator:** แสดงแถบสถานะชัดเจนว่าตอนนี้คือ "คำใบ้รอบที่เท่าไหร่" โดยอิงจาก `?round=x` ใน URL (Default เป็นรอบที่ 1)
- **Input Form:** ช่องกรอกรหัส (Number/Text) และปุ่มค้นหาขนาดใหญ่
- **Result Area:** แสดงคำใบ้ใน Card ที่ดีไซน์สวยงาม (ใช้สีหวานๆ หรือตามธีมสายเทค)
- **Loading State:** แสดงข้อความหรือ Spinner ระหว่างรอ API Fetch

### 5.2 Logic & Interaction
- ดึงค่า `round` จาก URL โดยใช้ `URLSearchParams`.
- ฟังก์ชัน `search()`:
    - เรียก `fetch()` ไปยัง Web App URL ของ Google Apps Script.
    - ส่ง `id` และ `round` ไปเป็น Query String.
    - แสดงผลลัพธ์ที่ได้จาก JSON ลงในหน้าเว็บทันทีโดยไม่ต้อง Refresh หน้า.
- รองรับการกดปุ่ม "Enter" ในช่อง Input เพื่อเริ่มค้นหา.

## 6. Constraints & Security
- เนื่องจากข้อมูลยังกรอกไม่ครบ ระบบต้องดึงข้อมูลใหม่ทุกครั้งที่มีการกดค้นหา (No Caching) เพื่อให้ข้อมูล Real-time ที่สุด.
- จัดการกรณีที่ช่องคำใบ้ใน Sheet เป็นค่าว่าง ให้แสดงว่า "ยังไม่มีข้อมูลในรอบนี้".