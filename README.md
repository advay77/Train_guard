<h1 align="center">🚆 LOCOFY</h1>
<p align="center">
  <b>Smart Facial Recognition System for Indian Railways</b><br/>
  A scalable tech-powered solution to stop ticketless travel and enforce real-time TTE transparency.
</p>

---

## 🧠 Problem Statement

> More than 50% of train travelers in India board without valid tickets, causing daily revenue loss of ₹1 crore+.  
Manual ticket checking is slow, outdated, and vulnerable to manipulation.

---

## 💡 Our Solution

LOCOFY ensures secure and verified travel with the help of facial recognition and intelligent monitoring:

- 🎟️ **Face Capture at Booking** – Webcam/mobile scan or upload by real passenger  
- 🧾 **Match at Boarding** – Real-time verification with IRCTC database  
- 🚨 **Unauthorized Alerts** – System flags mismatches instantly  
- 🧭 **Live TTE Map** – Tracks TTE actions + unauthorized movement with location  
- 🛡️ **Logs Every Action** – Creates transparency & accountability  

---

## 🔧 Tech Stack

| 💻 Category       | ⚙️ Tools Used                     |
|------------------|----------------------------------|
| ML Model         | ResNet (Face Detection)          |
| Frontend         | TypeScript, TailwindCSS          |
| Backend          | JavaScript, Postman,             |
| Interface        | Streamlit                        |
| Database Sync    | IRCTC Ticket API (Mock)          |
| Mapping System   | Leaflet / Google Maps            |

---

## 📈 Revenue Model

- 💰 ₹5L/month/zone × 17 zones = ₹85L/month  
- 🔍 Just 850 catches/day = ₹8.5L saved daily  
- 📊 Additional income: SaaS for dashboard, analytics, AMC  

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (version 16 or higher recommended)
- npm (comes with Node.js) or yarn
- For backend: MongoDB (running locally or connection string for remote DB)

### 1. Clone the repository
```bash
git clone https://github.com/advay77/Train_guard.git
cd Train_guard
```

---

### 2. Install dependencies

#### Frontend
```bash
npm install
# or
yarn
```

#### Backend
```bash
cd backend
npm install
# or
yarn
cd ..
```

---

### 3. Download Face-API.js Models
The face recognition system requires pre-trained models.

**Option 1: Run the provided script**
```bash
npm run download-models
```
_Or manually:_
See `public/models/README.md` for full instructions to download and place models in `public/models`.

---

### 4. Set up Environment Variables

- Backend may need a `.env` file in `backend/` for database connection and secrets.
- Example:
  ```
  MONGODB_URI=mongodb://localhost:27017/your-db
  JWT_SECRET=your-secret
  ```

---

### 5. Start the Applications

#### Backend
```bash
cd backend
npm run dev
# or
yarn dev
```

#### Frontend
Open a new terminal in the root directory:
```bash
npm run dev
# or
yarn dev
```

---


## 🔮 Future Expansion

- 🚇 Metro systems  
- 🚌 Bus transport  
- ✈️ Airport check-ins  
- 📱 Mobile-based face alerts for on-field TTEs  

---

## 📷 Screenshots & Demo

🎯 Live Prototype: [LOCOFY Dashboard (Vercel)](https://train-guide-delta.vercel.app/)  
📌 Map-based Unauthorized Flagging  
📌 Real-Time TTE Tracking  
📌 Dashboard Alert Popups  

(Add screenshots in `/assets/` folder or link images from Netlify)

---

## 👨‍💻 Made With ❤️ by

**Advay Anand**  
[GitHub](https://github.com/advayanand) | [LinkedIn](https://www.linkedin.com/in/advayanand)  
_Solo Developer • Builder • Problem Solver_

---

## 📜 License

Licensed under the MIT License.

---

## ⚠️ Disclaimer

This is a prototype project.  
IRCTC APIs used are for mock/demo purposes and are not official or affiliated.
