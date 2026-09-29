from sqlalchemy import Column, String, DateTime, Text
from backend.app.db.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    author_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)
