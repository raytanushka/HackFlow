from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreateRequest(BaseModel):
    title: str
    summary: Optional[str] = ""
    problem: Optional[str] = None
    solution: Optional[str] = None
    track_id: Optional[str] = None
    track: Optional[str] = None
    team: Optional[str] = None
    team_name: Optional[str] = None
    teammates: Optional[str] = None
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    deck_url: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    event_id: str
    team_id: str
    track_id: str
    title: str
    summary: str
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    submitted_at: datetime

    class Config:
        orm_mode = True
