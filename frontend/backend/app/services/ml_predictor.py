import numpy as np
from typing import Dict, Any, Optional
from app.database import get_collection

async def predict_student_academic_range(student_id: str, subject_id: Optional[str] = None) -> Dict[str, Any]:
    records_col = get_collection("academic_records")
    att_col = get_collection("attendance")
    
    query = {"student_id": student_id}
    if subject_id:
        query["subject_id"] = subject_id
    records = await records_col.find(query)
    
    if not records:
        return {
            "has_data": False,
            "predicted_range": None,
            "predicted_grade": None,
            "performance_category": None,
            "confidence": 0.0,
            "message": "Insufficient real academic evaluation data for prediction."
        }
        
    total_samples = len(records)
    scores = []
    for r in records:
        i1 = float(r.get("internal_1_marks", 0)) / 50.0 * 25.0
        i2 = float(r.get("internal_2_marks", 0)) / 50.0 * 25.0
        asn = float(r.get("assignment_marks", 0)) / 20.0 * 10.0
        ut = float(r.get("unit_test_marks", 0)) / 30.0 * 15.0
        score_75 = i1 + i2 + asn + ut
        scores.append(score_75)
        
    avg_internal_75 = sum(scores) / total_samples
    
    # Correlation with verified attendance
    att_records = await att_col.find({"student_id": student_id})
    att_factor = 1.0
    if att_records:
        pres = sum(1 for a in att_records if a.get("status") in ["PRESENT", "LATE"])
        att_pct = (pres / len(att_records)) * 100.0
        if att_pct >= 85:
            att_factor = 1.05
        elif att_pct >= 75:
            att_factor = 1.0
        elif att_pct >= 65:
            att_factor = 0.94
        else:
            att_factor = 0.88
            
    estimated_final = min(98.0, max(35.0, (avg_internal_75 / 75.0 * 100.0) * att_factor))
    lower_bound = max(0, int(np.floor(estimated_final - 3.5)))
    upper_bound = min(100, int(np.ceil(estimated_final + 3.5)))
    
    range_str = f"{lower_bound} - {upper_bound}"
    
    if estimated_final >= 85:
        grade = "O (Outstanding)"
        category = "Excellent"
    elif estimated_final >= 75:
        grade = "A+ (Distinction)"
        category = "Very Good"
    elif estimated_final >= 65:
        grade = "A (First Class)"
        category = "Good"
    elif estimated_final >= 50:
        grade = "B (Second Class)"
        category = "Average"
    else:
        grade = "RA (Re-appear)"
        category = "Critical Risk"
        
    confidence = min(0.92, 0.65 + (total_samples * 0.05))
    
    return {
        "has_data": True,
        "predicted_range": range_str,
        "predicted_grade": grade,
        "performance_category": category,
        "confidence": round(confidence, 2),
        "message": f"Predicted using {total_samples} verified academic evaluation marks and live attendance correlation."
    }
