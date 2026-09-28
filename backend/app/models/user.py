from sqlalchemy import Column, String, Index
from backend.app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False, default="participant")
    org_id = Column(String, nullable=True)

    __table_args__ = (
        Index(
            "uq_users_organizer_org_id",
            "org_id",
            unique=True,
            postgresql_where=(role == "organizer"),
        ),
    )
