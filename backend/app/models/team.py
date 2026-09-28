from sqlalchemy import Column, String
from backend.app.db.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, index=True, nullable=False, default="evt_01")
    name = Column(String, nullable=False)
    created_by = Column(String, nullable=True)
