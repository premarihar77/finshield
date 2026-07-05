from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "scam_training_data.csv"
MODEL_PATH = BASE_DIR / "model.joblib"
VECTORIZER_PATH = BASE_DIR / "vectorizer.joblib"

TARGET_EXAMPLES_PER_LABEL = 80

EXTRA_TEMPLATES = {
    "Safe Message": [
        "Your UPI payment of Rs {amount} to grocery store was successful transaction id {code}",
        "Rs {amount} received from Rahul through UPI",
        "Payment received from Neha Rs {amount}",
        "Aapka UPI payment Rs {amount} successful ho gaya",
        "Bank debit alert Rs {amount} paid through official UPI app",
    ],
    "KYC Scam": [
        "Your KYC will be blocked today click {link} and pay Rs {amount}",
        "Aapka KYC band ho jayega turant link par click kare",
        "KYC update pending verify now or account blocked",
        "Bank account band ho jayega KYC update karo",
        "PAN update required click fake bank KYC link",
    ],
    "Reward Scam": [
        "Congratulations you won Rs {amount} cashback claim now",
        "Lucky winner free gift claim karne ke liye fee pay kare",
        "Aapko reward mila hai UPI PIN enter karo",
        "Lottery prize release ke liye processing fee pay karo",
        "Cashback reward claim now share OTP",
    ],
    "OTP/UPI PIN Scam": [
        "Share your OTP to receive refund",
        "OTP batao refund milega",
        "UPI PIN enter karo cashback claim karne ke liye",
        "Apna OTP bhejo verification complete hoga",
        "Verification code share karo payment receive hoga",
    ],
    "Digital Arrest Scam": [
        "You are under digital arrest transfer Rs {amount} immediately",
        "Aap digital arrest me ho payment karo",
        "Cyber cell investigation legal action avoid karne ke liye paisa bhejo",
        "Police case and FIR filed pay fine now",
        "Money laundering case avoid jail by transferring money",
    ],
    "Fake Customer Care Scam": [
        "Fake customer care asks OTP for UPI refund",
        "Bank support helpline bol raha hu OTP batao",
        "Customer support number se refund ke liye card details do",
        "UPI helpdesk verification ke liye PIN share karo",
        "Refund support agent asks to install app",
    ],
    "Remote Access Scam": [
        "Install AnyDesk and share your screen for UPI support",
        "AnyDesk install karo support ke liye",
        "TeamViewer code share karo bank issue solve hoga",
        "QuickSupport app install karke screen share karo",
        "Remote access do payment problem fix karenge",
    ],
    "Suspicious Payment Request": [
        "Send Rs {amount} security deposit to unlock refund",
        "Security deposit bhejo tab refund milega",
        "Pay processing fee now to release cashback",
        "Transfer amount urgently for account verification",
        "Registration fee pay karo reward claim karne ke liye",
    ],
    "Fake Payment Proof": [
        "Fake payment screenshot shows UTR but money not credited",
        "Payment proof bheja hai goods release karo",
        "Maine payment kar diya screenshot dekho",
        "Edited UPI success screenshot sent on WhatsApp",
        "Fake transaction successful proof with wrong UTR",
    ],
}


def augment_dataset(data: pd.DataFrame) -> pd.DataFrame:
    rows = data.to_dict("records")
    amounts = [10, 99, 250, 499, 1000, 5000, 25000, 75000]
    links = ["http://bank-kyc-verify.com", "http://bit.ly/kyc-update", "http://reward-claim.xyz"]
    codes = ["AXI123456789", "UPI998877", "TXN445566"]

    for label, templates in EXTRA_TEMPLATES.items():
        existing = sum(1 for row in rows if row["Label"] == label)
        index = 0
        while existing < TARGET_EXAMPLES_PER_LABEL:
            template = templates[index % len(templates)]
            rows.append(
                {
                    "Text": template.format(
                        amount=amounts[index % len(amounts)],
                        link=links[index % len(links)],
                        code=codes[index % len(codes)],
                    ),
                    "Label": label,
                }
            )
            existing += 1
            index += 1
    return pd.DataFrame(rows)


def main() -> None:
    data = augment_dataset(pd.read_csv(DATASET_PATH))
    x_train, x_test, y_train, y_test = train_test_split(
        data["Text"],
        data["Label"],
        test_size=0.25,
        random_state=42,
        stratify=data["Label"],
    )

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True, min_df=1)
    x_train_vec = vectorizer.fit_transform(x_train)
    x_test_vec = vectorizer.transform(x_test)

    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(x_train_vec, y_train)
    predictions = model.predict(x_test_vec)
    accuracy = accuracy_score(y_test, predictions)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print(f"Model trained. Accuracy: {accuracy:.2%}")
    print(f"Saved: {MODEL_PATH}")
    print(f"Saved: {VECTORIZER_PATH}")


if __name__ == "__main__":
    main()
