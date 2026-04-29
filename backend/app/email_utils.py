import os
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from .config import settings


def send_email_code(to_email: str, code: str) -> None:
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    sender = os.getenv("SMTP_FROM", user or "no-reply@trackit.local")

    if not host or not user or not password:
        raise RuntimeError("SMTP not configured")

    subject = "TrackIt NG verification code"
    body = f"Your TrackIt verification code is: {code}\nThis code expires in 10 minutes."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.app_name, sender))
    msg["To"] = to_email

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
