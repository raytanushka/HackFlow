from sqlalchemy import Column, String, DateTime
from backend.app.db.database import Base
from datetime import datetime

class JudgeComment(Base):
    __tablename__ = "judge_comments"

    id = Column(String, primary_key=True, index=True)
    judge_id = Column(String, index=True, nullable=False)
    track_id = Column(String, index=True, nullable=False)
    comment = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
