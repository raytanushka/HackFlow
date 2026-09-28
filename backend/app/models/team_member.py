from sqlalchemy import Column, String, Integer
from backend.app.db.database import Base

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, index=True, nullable=False)
    user_email = Column(String, index=True, nullable=False)
