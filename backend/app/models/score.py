from sqlalchemy import Column, String, Integer, DateTime
from backend.app.db.database import Base
from datetime import datetime

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    judge_id = Column(String, index=True, nullable=False)
    project_id = Column(String, index=True, nullable=False)
    functionality = Column(Integer, nullable=False)
    quality = Column(Integer, nullable=False)
    innovation = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)
