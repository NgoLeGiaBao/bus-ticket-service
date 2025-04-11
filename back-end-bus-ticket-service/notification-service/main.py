from fastapi import FastAPI
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from config import SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

app = FastAPI()

class ForgotPasswordRequest(BaseModel):
    email: str
    otp: str

def get_reset_password_email(otp: str) -> str:
    return f"""
Kính gửi Quý khách,

Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Dưới đây là mã OTP dùng một lần:

Mã OTP: {otp}
Thời gian hiệu lực: 05 phút (kể từ khi nhận email này).

Lưu ý quan trọng:
- Không chia sẻ mã này với bất kỳ ai.
- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ hỗ trợ [Tên ứng dụng]
📞 Hotline: 0123.456.789
📧 Email: support@example.com
"""

@app.post("/send-reset-password")
def send_reset_password(req: ForgotPasswordRequest):
    subject = "Mã đặt lại mật khẩu của bạn"
    body = f"Mã OTP của bạn là: {req.otp}. Mã sẽ hết hạn sau 5 phút."

    msg = MIMEText(get_reset_password_email(req.otp), "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = req.email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Bật mã hóa TLS
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return {"message": "Email đang được gửi..."}

    except Exception as e:
        return {"message": f"Không thể gửi email: {str(e)}"}
