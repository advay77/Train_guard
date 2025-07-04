<h1 align="center">🚆 LOCOFY</h1>
<p align="center"><b>
Smart Facial Recognition System for Indian Railways
</b><br/>
A scalable, tech-powered solution to eliminate ticketless travel and bring real-time TTE accountability.
</p>

---

## 🧠 Problem Statement

> Over 50% of Indian train passengers board without valid tickets, leading to daily losses of ₹1 crore+.  
Manual ticket checking is slow, outdated, and prone to manipulation.

---

## 💡 Solution Overview

**LOCOFY** leverages facial recognition and intelligent monitoring to ensure secure, verified, and transparent train travel:

- 🎟️ <strong>Face Capture at Booking</strong>: Passengers scan/upload their face through webcam or mobile.
- 🧾 <strong>Match at Boarding</strong>: Real-time face verification with IRCTC ticket database.
- 🚨 <strong>Unauthorized Alerts</strong>: Instant system flag for mismatches.
- 🧭 <strong>Live TTE Map</strong>: Tracks TTE actions and unauthorized movements with live location.
- 🛡️ <strong>Action Logs</strong>: Every step is logged for transparency & accountability.

---

## 🔧 Tech Stack

| Category         | Tools / Frameworks                      |
|------------------|:----------------------------------------|
| ML Model         | ResNet (Face Detection via face-api.js) |
| Frontend         | TypeScript, React, TailwindCSS          |
| Backend          | Node.js, Express, JavaScript            |
| Interface        | Streamlit (Demo/POC)                    |
| Database         | MongoDB                                 |
| API Integration  | IRCTC Ticket API (Mock)                 |
| Mapping          | Leaflet, Google Maps                    |
| Testing & API    | Postman                                 |

---

## 🌐 Deployed Live Demo

- **Dashboard:** [LOCOFY Dashboard (Vercel)](https://train-guard.vercel.app/)
- For demo credentials or access, see instructions below.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm (included with Node.js) or yarn
- MongoDB (local instance or remote connection string)

### 1. Clone the Repository

```sh
git clone https://github.com/advay77/Train_guard.git
cd Train_guard
```

### 2. Install Dependencies

#### Frontend

```sh
npm install
# or
yarn
```

#### Backend

```sh
cd backend
npm install
# or
yarn
cd ..
```

### 3. Download Face-API.js Models

LOCOFY uses pre-trained models for facial recognition.

- **Option 1:** Run the script:
    ```sh
    npm run download-models
    ```
- **Option 2:** Manually download models.  
  See [`public/models/README.md`](public/models/README.md) for detailed instructions.

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/your-db
JWT_SECRET=your-secret
```

### 5. Run the Project

#### Start Backend

```sh
cd backend
npm run dev
# or
yarn dev
```

#### Start Frontend

In a new terminal at the root:

```sh
npm run dev
# or
yarn dev
```

---

## 📸 Screenshots & Demo Features

- 🎯 **Live Demo:** [LOCOFY Dashboard on Vercel](https://train-guard.vercel.app/)
- 📌 Map-based Unauthorized Flagging
- 📌 Real-Time TTE Tracking
- 📌 Dashboard Alert Popups

_Add screenshots to the `/assets/` folder or link to hosted images._

---

## 📈 Revenue & Impact Model

- ₹5L/month/zone × 17 zones = ₹85L/month
- 850 catches/day = ₹8.5L saved daily
- Extra: SaaS dashboard, analytics, AMC

---

## 👨‍💻 Made By

**Advay Anand**  
[GitHub](https://github.com/advayanand) | [LinkedIn](https://www.linkedin.com/in/advay-anand-a89024277/)  
_Solo Developer • Builder • Problem Solver_

---

## 📜 License

Licensed under the MIT License.

---
