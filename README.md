#  Movie Finder Web Application

เว็บแอปพลิเคชันค้นหาและคัดกรองข้อมูลภาพยนตร์ พัฒนาด้วย **React + Vite (Frontend)** และ **Express.js (Backend)** 

---

##  7.1 ตารางส่วนร่วม (Contribution Table)

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / Component / Route / DSA) | ช่วงที่นำเสนอในคลิป |
| :--- | :--- | :--- | :--- |
| อสมาภรณ์ อินทรตุล | [681310650] | • **Frontend Core & Sorting:** `App.jsx`, `App.css`, Custom Quick Sort Algorithm (O(log n))
• **Backend Proxy & Caching:** `server.js` (Express Proxy & Key Security), Custom Hash Table Algorithm (O(1))
• **Project Setup:** Repository Architecture & `.gitignore` | **0:00 - 3:30**(เปิดคลิป, Before/After, Express Proxy, Custom DSA) |
| อภิษฏา รุ่งเรือง | [681310648] | • **UX & Dynamic Features:** Movie Details Component (Cast & Director Details View), Interactive Cast/Crew Modal (`/api/person/:id`), Random Movie Generator (`/api/random`)
• **State & UI Feedback:** Search Filters, Category Chaining, State Handling (Loading / Success / Empty / Error States) | **3:30 - 7:00**(Demo ระบบจริง, UX States, Cast/Director Details, สรุปผล) |

---

##  7.2 ตารางข้อแนะนำจากงานแรก และสิ่งที่แก้ไข (Before / After Table)

| ข้อแนะนำจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน Before / After |
| :--- | :--- | :--- |
| **1. การดึงข้อมูลจาก API มาใช้ประโยชน์เพิ่มขึ้น**
งานแรกดึงเฉพาะข้อมูลพื้นฐาน ควรใช้ข้อมูลจาก TMDB API ให้ลึกและหลากหลายกว่าเดิม | เพิ่มระบบดึงข้อมูลเครดิตนักแสดง (Cast) และผู้กำกับ (Director/Crew) จาก TMDB Credits API มาประมวลผลและแสดงผลในระบบ | **Before:** แสดงเฉพาะชื่อเรื่อง เรื่องย่อ และคะแนนเรตติ้งทั่วไป **After:** ดึงข้อมูลเชิงลึก รายชื่อนักแสดงนำ และชื่อผู้กำกับภาพยนตร์แสดงผลบนหน้าจอ |
| **2. ปรับออกแบบ UX ให้ใช้งานง่าย และคลิกดูผลงานนักแสดง/ผู้กำกับได้**
ออกแบบ UI ให้ใช้งานสะดวก และทำให้ชื่อนักแสดง/ผู้กำกับสามารถคลิกดูรายละเอียดต่อได้ | ออกแบบ Interface สไตล์ Cinematic Glassmorphism ที่เรียบง่าย พร้อมทำปุ่ม Interactive บนชื่อนักแสดง/ผู้กำกับ เพื่อคลิกดูข้อมูลและผลงานภาพยนตร์เรื่องอื่น ๆ ได้ทันที | **Before:** ชื่อนักแสดง/ผู้กำกับเป็นเพียงข้อความนิ่ง ไม่สามารถกดโต้ตอบได้**After:**สามารถคลิกที่ชื่อนักแสดงหรือผู้กำกับเพื่อดูรายละเอียดและภาพยนตร์ที่เกี่ยวข้องได้ทันที|
| **4. DSA Implementation & UX States**
ขาดการประยุกต์ใช้ DSA เชิงลึกและการแจ้งเตือนสถานะ UI | พัฒนา Custom Hash Table บน Express Backend และ Custom Quick Sort (O(log n)) บน React พร้อมระบบแจ้งเตือนสถานะครบถ้วน | **Before:** ใช้ Built-in Methods ทั่วไปในการจัดเรียง และขาดสถานะ UI แจ้งเตือน**After:** เขียน Quick Sort / Hash Table เอง และมีสถานะ **Loading / Success / Empty / Error** ชัดเจน |

---

##  โครงสร้างระบบ (System Architecture)

- **Frontend (`/frontend`):** React + Vite, Cinematic Glassmorphism UI, Custom Quick Sort
- **Backend (`/backend`):** Express.js API Proxy Server, Custom Hash Table Data Structure, Environment Security

---

##  วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev