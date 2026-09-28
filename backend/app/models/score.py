from sqlalchemy import Column, String, Integer
from backend.app.db.database import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    judge_id = Column(String, index=True, nullable=False)
    project_id = Column(String, index=True, nullable=False)
    functionality = Column(Integer, nullable=False)
    quality = Column(Integer, nullable=False)
    innovation = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
