from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransitAlertBase(BaseModel):
    line_name: str
    operator: str
    status: str
    delay_minutes: int = 0
    cause: Optional[str] = None

class TransitAlertCreate(TransitAlertBase):
    pass

class TransitAlertResponse(TransitAlertBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True