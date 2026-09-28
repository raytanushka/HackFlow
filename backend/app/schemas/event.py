from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TrackResponse(BaseModel):
    id: str
    name: str
    event_id: str

    class Config:
        orm_mode = True

class EventResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    submissions_close: datetime
    is_open: bool
    organizer_id: Optional[str] = None

    class Config:
        orm_mode = True

class EventDetailResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    submissions_close: datetime
    is_open: bool
    organizer_id: Optional[str] = None
    tracks: List[TrackResponse] = []

    class Config:
        orm_mode = True
