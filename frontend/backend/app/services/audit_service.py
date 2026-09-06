from datetime import datetime
from typing import Optional, Any
from app.database import get_collection

async def record_audit_log(
    actor_id: str,
    actor_name: str,
    actor_role: str,
    action_type: str,
    entity_name: str,
    entity_id: Optional[str] = None,
    details: Optional[str] = None,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
):
    audit_col = get_collection("audit_logs")
    log_entry = {
        "actor_id": actor_id,
        "actor_name": actor_name,
        "actor_role": actor_role,
        "action_type": action_type,
        "entity_name": entity_name,
        "entity_id": entity_id,
        "details": details,
        "old_value": old_value,
        "new_value": new_value,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await audit_col.insert_one(log_entry)
