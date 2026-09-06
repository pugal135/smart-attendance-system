import io
import csv
from datetime import datetime
from typing import List, Dict, Any
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_attendance_csv(records: List[Dict[str, Any]]) -> io.StringIO:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student Name", "Register No", "Class", "Subject", "Date", "Period", "Status", "Entry Mode"])
    for r in records:
        writer.writerow([
            r.get("student_name", ""),
            r.get("register_number", ""),
            r.get("class_name", ""),
            r.get("subject_name", ""),
            r.get("date", ""),
            r.get("period", ""),
            r.get("status", ""),
            r.get("entry_mode", "MANUAL")
        ])
    output.seek(0)
    return output

def generate_attendance_excel(records: List[Dict[str, Any]]) -> io.BytesIO:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Attendance Records"
    
    headers = ["Student Name", "Register No", "Class", "Subject", "Date", "Period", "Status", "Entry Mode"]
    ws.append(headers)
    
    for r in records:
        ws.append([
            r.get("student_name", ""),
            r.get("register_number", ""),
            r.get("class_name", ""),
            r.get("subject_name", ""),
            r.get("date", ""),
            r.get("period", ""),
            r.get("status", ""),
            r.get("entry_mode", "MANUAL")
        ])
        
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output

def generate_attendance_pdf(title: str, records: List[Dict[str, Any]]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name="TitleStyle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        textColor=colors.HexColor("#0B132B"),
        alignment=1,
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        name="SubStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748B"),
        alignment=1,
        spaceAfter=15
    )
    
    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Official Academic Record", subtitle_style))
    elements.append(Spacer(1, 10))
    
    table_data = [["Student Name", "Register No", "Subject", "Date", "Period", "Status"]]
    for r in records[:200]:
        table_data.append([
            str(r.get("student_name", "")),
            str(r.get("register_number", "")),
            str(r.get("subject_name", "")),
            str(r.get("date", "")),
            f"P{r.get('period', '')}",
            str(r.get("status", ""))
        ])
        
    t = Table(table_data, colWidths=[120, 90, 130, 80, 50, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0B132B")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    elements.append(t)
    doc.build(elements)
    buffer.seek(0)
    return buffer
