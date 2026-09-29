from sqlalchemy import Column, String, DateTime, UniqueConstraint
from backend.app.db.database import Base

class Vote(Base):
    __tablename__ = "votes"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, index=True, nullable=False)
    participant_id = Column(String, index=True, nullable=False)
    project_id = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, nullable=False)

    __table_args__ = (
        UniqueConstraint("participant_id", "project_id", name="uq_participant_project_vote"),
    )
