from sqlalchemy import Column, String
from backend.app.db.database import Base

class Track(Base):
    __tablename__ = "tracks"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
