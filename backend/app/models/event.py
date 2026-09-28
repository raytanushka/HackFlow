from sqlalchemy import Column, String, DateTime
from backend.app.db.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    submissions_close = Column(DateTime, nullable=False)
    organizer_id = Column(String, nullable=True)
