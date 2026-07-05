# 🛡️ FinShield

**FinShield** is an AI-powered UPI fraud and scam risk analysis platform that helps users verify suspicious UPI messages, links, UPI IDs, payment screenshots, and scam-related content before trusting them.

It provides risk score, trust score, scam category prediction, warning signals, safety guidance, and emergency steps to help users make safer digital payment decisions.

---

## 🚀 Project Overview

Online payment scams, fake KYC messages, reward scams, digital arrest threats, fake customer care numbers, and fake payment screenshots are becoming common. Many users are confused about whether they should trust a message, link, UPI ID, or screenshot.

**FinShield solves this problem by acting as a digital trust-check assistant.**

Users can paste suspicious content or upload screenshots, and FinShield analyzes them using rule-based detection, AI/ML classification, OCR, URL/UPI checking, and safety recommendations.

---

## 🎯 Main Objective

The main goal of FinShield is to help users answer one important question:

> **“Should I trust this message, link, UPI ID, or payment screenshot?”**

FinShield does not claim 100% fraud detection. It provides risk-based awareness support and recommends users verify through official bank or UPI app channels.

---

## ✨ Features

### 🔍 1. Quick Scam Scan

Users can paste suspicious messages, banking warnings, reward texts, UPI requests, or URLs and get instant risk analysis.

### 🧠 2. AI/ML Scam Category Detection

FinShield predicts scam categories such as:

- KYC Scam
- Reward Scam
- OTP / UPI PIN Scam
- Digital Arrest Scam
- Fake Customer Care Scam
- Remote Access Scam
- Suspicious Payment Request
- Fake Payment Proof
- Safe Message / Payment Receipt

### 📊 3. Trust Score & Risk Score

The system provides:

- Risk Score
- Trust Score
- Risk Level
- Scam Category
- ML Confidence
- Explanation of why the content is risky

### 🔗 4. URL & UPI ID Checker

FinShield detects suspicious URLs and UPI IDs by checking:

- Fake KYC links
- Short URLs
- HTTP links
- Suspicious domain words
- Suspicious UPI IDs like `refundclaim@ybl`, `kycverify@upi`, etc.

### 🖼️ 5. Screenshot OCR Analysis

Users can upload payment screenshots or scam screenshots.  
FinShield extracts text using browser-based OCR and then analyzes the extracted text.

### 📜 6. PDF Scam Report Export

Users can download a scam analysis report containing:

- Input text / OCR text
- Risk score
- Trust score
- Scam category
- Detected signals
- Extracted URLs / UPI IDs
- Recommended action
- Safety tips

### 🚨 7. Emergency Action Guide

If a user is scammed, FinShield provides emergency steps such as:

- Contact bank immediately
- Block/freeze card or account
- Save screenshots and UTR
- Report cybercrime
- Change UPI PIN/passwords
- Monitor bank statements

### 🤖 8. FinShield Assistant Chatbot

A project-specific chatbot that can answer questions like:

- Why is this risky?
- What should I do now?
- What is KYC scam?
- What if I shared OTP?
- How do I report fraud?
- How does Trust Score work?

### 📈 9. Dashboard Analytics

Logged-in users can view:

- Total analyses
- Critical cases
- High-risk cases
- Safe cases
- Risk level chart
- Scam category chart
- Recent analysis history

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- Lucide React
- React Hot Toast
- Tesseract.js
- jsPDF / html2canvas

### Backend

- Python
- FastAPI
- MongoDB
- Motor
- Pydantic
- JWT Authentication
- Passlib / bcrypt
- scikit-learn
- pandas
- joblib

### Database

- MongoDB Atlas / Local MongoDB

---

## 📁 Folder Structure

```bash
finshield/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── utils/
│   │   ├── main.py
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── api/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Backend Setup

### 1. Go to backend folder

```bash
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv
```

### 3. Activate virtual environment

For Windows:

```bash
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Create `.env` file

Create a `.env` file inside the backend folder:

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=finshield_db
JWT_SECRET=your_super_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

### 6. Run backend server

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```bash
http://localhost:8000
```

---

## 💻 Frontend Setup

### 1. Go to frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

Create a `.env` file inside the frontend folder:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run frontend

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 🧠 ML Model Training

FinShield uses a text classification model for scam category prediction.

To train the model:

```bash
cd backend
python app/ml/train_model.py
```

The ML model uses:

- TF-IDF Vectorizer
- Logistic Regression / Naive Bayes
- Scam training dataset

---

## 🔐 Authentication

FinShield supports JWT-based authentication.

Authenticated users can access:

- Dashboard
- Analyze Text
- Analyze Image
- History
- Report Scam
- Profile

Public users can access:

- Home
- Quick Scan
- Checker
- Awareness
- Emergency Guide

---

## 🧪 Example Test Inputs

### KYC Scam

```text
Dear customer, your KYC will be blocked today. Click http://bank-kyc-verify.com and pay Rs 10.
```

Expected result:

```text
Risk Level: Critical
Scam Type: KYC Scam
```

---

### OTP Scam

```text
Share your OTP to receive refund.
```

Expected result:

```text
Risk Level: Critical
Scam Type: OTP / UPI PIN Scam
```

---

### Reward Scam

```text
Congratulations! You won Rs 5000 cashback. Share your UPI PIN to claim.
```

Expected result:

```text
Risk Level: Critical
Scam Type: Reward Scam / OTP Scam
```

---

### Digital Arrest Scam

```text
You are under digital arrest. Transfer Rs 25000 immediately to avoid legal action.
```

Expected result:

```text
Risk Level: Critical
Scam Type: Digital Arrest Scam
```

---

### Safe Payment Message

```text
Your UPI payment of Rs 250 to grocery store was successful. Transaction ID AXI123456789.
```

Expected result:

```text
Risk Level: Safe / Low Risk
Scam Type: Safe Message
```

---

## 📌 Main Pages

| Page | Description |
|---|---|
| Home | Landing page with project overview |
| Quick Scan | Public scam message/link checker |
| Checker | URL and UPI ID risk checker |
| Awareness | UPI fraud awareness tips |
| Emergency Guide | Steps to follow after scam |
| Dashboard | User analysis analytics |
| Analyze Text | Authenticated text analysis |
| Analyze Image | Screenshot-based analysis |
| History | Previous analysis records |
| Report Scam | Submit scam report |
| Profile | User profile |

---

## 📊 Dashboard Features

The dashboard shows:

- Total analyses
- Critical cases
- High-risk cases
- Safe cases
- Risk level distribution
- Scam category distribution
- Recent analysis history

---

## 🤖 FinShield Assistant

FinShield Assistant is a chatbot that helps users understand scam risks and safety steps.

It can answer:

- Why is this risky?
- What should I do if I clicked a scam link?
- What if I shared OTP?
- How do I report cyber fraud?
- How does Trust Score work?

---

## 📄 PDF Report

Users can download a PDF report after analysis.  
The report includes:

- Date and time
- Original input
- OCR text if image was uploaded
- Risk score
- Trust score
- Scam category
- Detected signals
- Safety tips
- Recommended action
- Disclaimer

---

## ⚠️ Disclaimer

FinShield provides **risk-based awareness support only**.

It does not guarantee 100% fraud detection and should not be treated as a final legal, banking, or police authority.

Always verify suspicious messages, links, payment screenshots, or UPI requests through:

- Official bank app
- Official UPI app
- Official bank website
- Bank branch
- Cybercrime authorities

---

## 🧾 Resume Points

You can mention this project in your resume like this:

- Developed **FinShield**, a full-stack UPI fraud risk analysis platform using React, FastAPI, MongoDB, OCR, and ML-based text classification.
- Implemented a hybrid scam detection engine combining rule-based detection, URL/UPI ID analysis, OCR text extraction, and AI/ML scam category prediction.
- Built a professional dashboard with risk analytics, scan history, PDF report export, emergency guide, and chatbot-based scam awareness support.

---

## 👨‍💻 Developer

**Prem Parihar**

B.Tech CSE Student  
Project: FinShield - AI-Powered UPI Fraud & Scam Detection System
