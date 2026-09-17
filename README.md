# ChemFarm Top-Down Showdown

เกมทำฟาร์มมุมมองบนลงล่างสำหรับนักเรียนมัธยมไทย ผู้เล่นแข่งสร้างมูลค่าฟาร์มภายใน 5 นาทีและใช้ความรู้เรื่องกฎอัตราเร็วกับพลังงานก่อกัมมันต์เพื่อผลิตปุ๋ยเร่งโต

## ฟีเจอร์

- สร้างห้องหรือเข้าร่วมด้วยรหัส 6 หลักและคิวอาร์โค้ด
- ห้องรอพร้อมสถานะผู้เล่นแบบเรียลไทม์
- เวลาการแข่งขันอ้างอิง `ends_at` และเวลาฐานข้อมูล Supabase
- กระดานอันดับ broadcast เงินของผู้เล่นทุก 2 วินาที
- พืช 4 ชนิด ต้นไม้ 3 ชนิด และระบบปลดล็อก 7 แปลง
- โจทย์เคมีแบบตาราง rate law และกราฟพลังงาน
- ปุ๋ยเกรด S/A พร้อมกติกาลดเวลาจากเวลาเติบโตรวม
- หน้าสรุปอันดับ เงิน การเก็บเกี่ยว จำนวนโจทย์ และเวลาตอบดีที่สุด
- โหมดสาธิตในเครื่องเมื่อยังไม่ได้ตั้งค่า Supabase

## โครงสร้างโปรเจกต์

```text
chemfarm-showdown/
├── src/
│   ├── components/
│   │   ├── game/              # HUD, แปลงฟาร์ม, ร้านค้า, กระเป๋า, ผลการแข่งขัน
│   │   └── quiz/              # ตารางอัตราเร็ว กราฟ Ea และหน้าต่างโจทย์
│   ├── data/gameConfig.js     # สมดุลราคา เวลา และข้อมูลพืช
│   ├── hooks/
│   │   ├── useGameEngine.js   # วงจรฟาร์ม เงิน timer และ realtime broadcast
│   │   ├── useQuizGame.js     # สุ่มโจทย์ ตรวจคำตอบ เกรด และ cooldown
│   │   └── useRoom.js         # สร้าง/เข้าห้อง lobby และ subscriptions
│   ├── lib/                   # Supabase client, room API และ session storage
│   ├── screens/               # หน้าแรก ห้องรอ และหน้าฟาร์ม
│   └── utils/game.js          # สูตรเวลา ปุ๋ย progress และรูปแบบตัวเลข
├── supabase/
│   ├── schema.sql             # ตาราง RLS Realtime และ server functions
│   └── seed.sql               # โจทย์คงที่ 20 ข้อ
├── tests/game.test.js         # ทดสอบกติกาหลักของเกม
├── .env.example
├── vercel.json
└── vite.config.js
```

## เริ่มใช้งานในเครื่อง

ต้องใช้ Node.js 20.19+ หรือ 22.12+

```bash
npm install
copy .env.example .env.local
npm run dev
```

ถ้าไม่ใส่ค่า environment variables เกมจะทำงานในโหมดสาธิต ผู้เล่นสามารถสร้างห้องและทดลองเกมคนเดียวได้

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ที่ Supabase
2. เปิด SQL Editor แล้วรัน `supabase/schema.sql`
3. รัน `supabase/seed.sql` เพื่อเพิ่มโจทย์ 20 ข้อ
4. ไปที่ Project Settings → API แล้วคัดลอก Project URL และ anon public key
5. สร้าง `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Schema เปิด Realtime ให้ `rooms` และ `players` อัตโนมัติ ส่วนข้อมูลเงินระหว่างเกมใช้ Realtime Broadcast แยกตาม room id

> นโยบาย RLS ในโปรเจกต์นี้ตั้งใจให้ผู้เล่น anonymous ใช้งานได้โดยไม่มีระบบ anti-cheat ตามขอบเขตเกม หากนำไปใช้กับคะแนนหรือรางวัลจริงควรเพิ่ม Supabase Auth และย้ายการคำนวณเงินไปไว้ใน Edge Functions

## Deploy ไป Vercel

1. Push repository นี้ขึ้น GitHub
2. ใน Vercel เลือก **Add New Project** และ import repository
3. Vercel จะตรวจพบ Vite อัตโนมัติ โดยใช้ build command `npm run build` และ output directory `dist`
4. เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ที่ Settings → Environment Variables
5. Deploy แล้วนำ production URL ไปทดสอบสร้างห้องและสแกนคิวอาร์โค้ดจากโทรศัพท์อีกเครื่อง

ไฟล์ `vercel.json` มี rewrite สำหรับเส้นทาง SPA เตรียมไว้แล้ว

## คำสั่งตรวจสอบ

| คำสั่ง | การทำงาน |
| --- | --- |
| `npm run dev` | เปิด development server |
| `npm run lint` | ตรวจ JavaScript และ JSX |
| `npm test` | ทดสอบกติกา timer และปุ๋ย |
| `npm run build` | สร้าง production bundle |
| `npm run preview` | เปิดดู production build ในเครื่อง |
