import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional, Dict, Any
from app.config import settings
from app.database import get_collection

async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notif_type: str,
    meta_data: Optional[Dict[str, Any]] = None,
    send_email: bool = True
):
    notif_col = get_collection("notifications")
    doc = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "read": False,
        "meta_data": meta_data or {},
        "created_at": datetime.utcnow().isoformat()
    }
    await notif_col.insert_one(doc)
    
    if send_email:
        users_col = get_collection("users")
        user = await users_col.find_one({"_id": user_id})
        if user and user.get("email"):
            asyncio.create_task(dispatch_email(user.get("email"), title, message))

async def dispatch_email(recipient_email: str, subject: str, body_text: str):
    settings_col = get_collection("settings")
    sys_settings = await settings_col.find_one({}) or {}
    
    smtp_host = sys_settings.get("smtp_host") or settings.SMTP_HOST
    smtp_port = sys_settings.get("smtp_port") or settings.SMTP_PORT
    smtp_user = sys_settings.get("smtp_user") or settings.SMTP_USER
    smtp_pass = sys_settings.get("smtp_password") or settings.SMTP_PASSWORD
    
    if not smtp_host or not smtp_user:
        print(f"[EMAIL-DISPATCHER (Log Mode)] To: {recipient_email} | Subject: {subject} | Body: {body_text}")
        return
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[Smart Attendance] {subject}"
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = recipient_email
        
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #0B132B; padding: 15px; border-radius: 6px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Smart Attendance System</h2>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Real-Time Student Attendance & Risk Management</p>
            </div>
            <div style="padding: 20px 10px; color: #1E293B;">
                <h3 style="color: #0F172A; margin-top: 0;">{subject}</h3>
                <p style="font-size: 15px; line-height: 1.6;">{body_text}</p>
                <div style="margin-top: 25px; padding: 12px; background-color: #F8FAFC; border-left: 4px solid #6366F1; font-size: 13px; color: #64748B;">
                    This is an automated academic alert.
                </div>
            </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(settings.EMAIL_FROM, [recipient_email], msg.as_string())
        server.quit()
    except Exception as e:
        print(f"[EMAIL-DISPATCHER] Failed to send email to {recipient_email}: {e}")
