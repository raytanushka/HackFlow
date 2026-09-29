from sqlalchemy import Column, String
from backend.app.db.database import Base

class JudgeAssignment(Base):
    __tablename__ = "judge_assignments"

    judge_id = Column(String, primary_key=True, index=True)
    track_id = Column(String, primary_key=True, index=True)
