import math
from typing import Dict, Any

def calculate_recovery_plan(
    current_present: int,
    current_total: int,
    target_percentage: float = 75.0,
    classes_to_attend: int = 5
) -> Dict[str, Any]:
    if current_total == 0:
        return {
            "current_percentage": 0.0,
            "target_percentage": target_percentage,
            "classes_needed_for_target": 0,
            "projected_percentage": 100.0 if classes_to_attend > 0 else 0.0,
            "classes_to_attend": classes_to_attend,
            "can_reach_target": True,
            "message": "No historical classes recorded yet."
        }
        
    current_pct = round((current_present / current_total * 100), 2)
    t = target_percentage / 100.0
    
    if current_pct >= target_percentage:
        classes_needed = 0
        can_reach = True
        msg = f"Your current attendance ({current_pct}%) already meets or exceeds the target ({target_percentage}%)."
    elif t >= 1.0:
        classes_needed = -1
        can_reach = False
        msg = "Cannot reach 100% attendance if any past classes were missed."
    else:
        numerator = (t * current_total) - current_present
        denominator = 1.0 - t
        classes_needed = max(0, math.ceil(numerator / denominator))
        can_reach = True
        msg = f"You need to attend the next {classes_needed} consecutive classes to reach {target_percentage}%."
        
    projected_pres = current_present + classes_to_attend
    projected_total = current_total + classes_to_attend
    projected_pct = round((projected_pres / projected_total * 100), 2)
    
    return {
        "current_percentage": current_pct,
        "target_percentage": target_percentage,
        "classes_needed_for_target": classes_needed,
        "projected_percentage": projected_pct,
        "classes_to_attend": classes_to_attend,
        "can_reach_target": can_reach,
        "message": msg
    }
