import os
from dotenv import load_dotenv

# Load environment variables from .env file
env_file = os.getenv("ENV_FILE", ".env.dev")  
load_dotenv(env_file)

# Email smpt configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com") 
SMTP_PORT = int(os.getenv("SMTP_PORT", 587)) 
SMTP_USER = os.getenv("SMTP_USER", "") 
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  

# RabbitMQ configuration
RABBITMQ_BROKER = os.getenv("RABBITMQ_BROKER", "pyamqp://admin:admin@localhost//")  

# Application name
APP_NAME = "Notification Service"
