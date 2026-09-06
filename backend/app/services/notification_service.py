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
            asyncio.create_task(dispatch_email(user.get("email"), title, message, meta_data))

async def dispatch_email(recipient_email: str, subject: str, body_text: str, meta_data: Optional[Dict[str, Any]] = None):
    settings_col = get_collection("settings")
    sys_settings = await settings_col.find_one({}) or {}
    
    smtp_host = sys_settings.get("smtp_host") or settings.SMTP_HOST
    smtp_port = sys_settings.get("smtp_port") or settings.SMTP_PORT
    smtp_user = sys_settings.get("smtp_user") or settings.SMTP_USER
    smtp_pass = sys_settings.get("smtp_password") or settings.SMTP_PASSWORD
    
    upi_intent = (meta_data or {}).get("upi_intent", "")
    upi_id = (meta_data or {}).get("upi_id", "7708881295@ptyes")
    amount = (meta_data or {}).get("amount", 500.0)
    due_date = (meta_data or {}).get("due_date", "Within 48 Hours")
    
    if not smtp_host or not smtp_user:
        safe_body = body_text.encode("ascii", "replace").decode("ascii")
        safe_subject = subject.encode("ascii", "replace").decode("ascii")
        print(f"[EMAIL-DISPATCHER (Log Mode)] To: {recipient_email} | Subject: {safe_subject} | UPI ID: {upi_id} | Amount: Rs.{amount} | Body: {safe_body}")
        return
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[Smart Attendance] {subject}"
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = recipient_email
        
        qr_section = ""
        if upi_intent or upi_id:
            qr_section = f"""
            <div style="margin-top: 20px; padding: 18px; background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid #334155; border-radius: 12px; text-align: center; color: #ffffff;">
                <div style="display: inline-block; background-color: #00BAF2; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; margin-bottom: 12px;">
                    Paytm UPI • Google Pay • PhonePe • BHIM
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.3); margin: 8px 0;">
                    <img src="http://localhost:3000/assets/penalty_qr.png" alt="Penalty Payment QR Scanner" style="width: 180px; height: auto; display: block;" />
                </div>
                <p style="margin: 8px 0 2px 0; font-size: 13px; font-weight: bold; color: #38bdf8;">UPI ID: <span style="font-family: monospace; color: #ffffff; background: #0b132b; padding: 3px 8px; border-radius: 6px;">{upi_id}</span></p>
                <p style="margin: 2px 0; font-size: 12px; color: #94a3b8;">Shortage Penalty Amount: <strong style="color: #4ade80;">Rs.{amount:.2f}</strong></p>
                <p style="margin: 2px 0 14px 0; font-size: 11px; color: #fbbf24;">Due Deadline: {due_date}</p>
                <a href="{upi_intent}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
                    Click to Pay via UPI / GPay / Paytm App
                </a>
            </div>
            """
            
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="background-color: #0B132B; padding: 15px; border-radius: 6px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Smart College Attendance Portal</h2>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Attendance Risk Warning & Fine Clearance Notice</p>
            </div>
            <div style="padding: 20px 10px; color: #1E293B;">
                <h3 style="color: #0F172A; margin-top: 0;">{subject}</h3>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">{body_text}</p>
                {qr_section}
                <div style="margin-top: 25px; padding: 12px; background-color: #F8FAFC; border-left: 4px solid #6366F1; font-size: 12px; color: #64748B;">
                    This is an automated academic attendance clearance notification. Settle fine before deadline to avoid exam hall ticket blocking.
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
