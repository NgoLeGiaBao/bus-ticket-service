import os
from dotenv import load_dotenv

# Load biến môi trường từ file .env
env_file = os.getenv("ENV_FILE", ".env.dev")  # Dùng file môi trường dev hoặc prod
load_dotenv(env_file)

# Email (SMTP) cấu hình
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")  # Default SMTP server (Gmail)
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Default port cho Gmail
SMTP_USER = os.getenv("SMTP_USER", "")  # Email của bạn (ví dụ: your_email@gmail.com)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Mật khẩu email (hoặc App Password nếu dùng Gmail)

# RabbitMQ cấu hình
RABBITMQ_BROKER = os.getenv("RABBITMQ_BROKER", "pyamqp://admin:admin@localhost//")  # Broker mặc định

# Các cấu hình khác (nếu cần)
APP_NAME = "Notification Service"
