# 🧪 Chemical Inventory Management System

A web-based **Chemical Inventory Management System** built for the **UCL Department of Chemical Engineering**.  
This system streamlines chemical tracking and auditing using **QR code scanning** for real-time status updates.

---

## 🚀 Tech Stack
- **Frontend:** Next.js (TypeScript), React, Material UI (Berry Template)  
- **Backend:** Next.js API Routes, Prisma ORM  
- **Database:** PostgreSQL  
- **Authentication:** NextAuth.js  
- **QR Scanning:** html5-qrcode  
- **Deployment:** Vercel  

---

## 🎥 Demo
▶️ **[Watch Demo on YouTube](https://www.youtube.com/watch?v=20oQAGGudqc)**  

---

## ⚙️ Getting Started

```bash
git clone https://github.com/yourusername/chemical-inventory-management.git
cd chemical-inventory-management
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔍 Key Features
- 📦 Manage and track all chemicals by building and room  
- 🧾 Create and view multiple audit rounds with live progress tracking  
- 📍 QR-code scanning to update chemical status (“Unaudited”, “Audited”, “Missing”)  
- 📊 Automatic “Missing Chemicals” report for each audit round  
- 🏁 Real-time completion status when all locations are audited  

---

## 🧱 Database Overview
- **AuditGeneral:** Tracks overall audit rounds  
- **Audit:** Tracks each location within a round  
- **AuditRecord:** Tracks individual chemical status  

---

## 📦 Deployment
Easily deploy on **[Vercel](https://vercel.com/)**.  
Add your `.env` file with:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/chemical_inventory"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

