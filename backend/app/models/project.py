from sqlalchemy import Column, String, DateTime
from backend.app.db.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, index=True, nullable=False, default="evt_01")
    team_id = Column(String, index=True, nullable=False)
    track_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(String, nullable=False)
    repo_url = Column(String, nullable=True)
    demo_url = Column(String, nullable=True)
    submitted_at = Column(DateTime, nullable=False)
