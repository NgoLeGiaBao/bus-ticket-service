from celery import Celery
from config import SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, RABBITMQ_BROKER
import smtplib
from email.mime.text import MIMEText

celery_app = Celery("notification", broker=RABBITMQ_BROKER)

@celery_app.task
def send_reset_password_email(email: str, otp: str):
    subject = "Mã đặt lại mật khẩu của bạn"
    body = f"Mã OTP của bạn là: {otp}. Mã sẽ hết hạn sau 5 phút."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

    print(f"Đã gửi OTP tới {email}")