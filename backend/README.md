# FinShield Backend

FastAPI backend for FinShield: AI-Powered UPI Fraud & Scam Detection System.

## Run

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

MongoDB should be running at `mongodb://localhost:27017` or set `MONGO_URI` to your Atlas connection string.

OCR image scanning requires the Tesseract OCR binary to be installed on your system. If it is missing, the API returns a clean message and text analysis still works.
