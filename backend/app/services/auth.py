from typing import Optional, Tuple, Dict, Any
import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.app.models.user import User
from backend.app.models.session import Session as SessionModel
from backend.app.models.event import Event

class AuthService:
    @staticmethod
    def get_event_info(db: Session, event_id: Optional[str]) -> Optional[Dict[str, Any]]:
        target_id = event_id if (event_id and event_id != "evt_smart_hack_2027") else "evt_01"
        event = db.query(Event).filter(Event.id == target_id).first()
        if not event:
            event = db.query(Event).filter(Event.id == "evt_01").first()
        if not event:
            return None
        now = datetime.utcnow()
        is_open = event.submissions_close > now if event.submissions_close else False
        return {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "is_open": is_open,
            "submissions_close": event.submissions_close.isoformat() if event.submissions_close else None
        }

    @staticmethod
    def register_organizer(
        db: Session,
        name: str,
        email: str,
        org_id: str,
        event_id: Optional[str] = None
    ) -> Tuple[User, str, Optional[Dict[str, Any]]]:
        normalized_email = email.strip().lower()
        normalized_org_id = org_id.strip()

        # 1. Check if email already exists
        existing_email = db.query(User).filter(User.email == normalized_email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Please log in instead."
            )

        # 2. Application-level check: Organizer ID must be unique among organizer accounts
        existing_org = db.query(User).filter(
            User.role == "organizer",
            User.org_id == normalized_org_id
        ).first()
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organizer ID is already registered."
            )

        user_id = f"org_{uuid.uuid4().hex[:8]}"
        user = User(
            id=user_id,
            name=name.strip(),
            email=normalized_email,
            role="organizer",
            org_id=normalized_org_id,
        )
        db.add(user)

        session_token = f"session_org_{uuid.uuid4().hex}"
        new_session = SessionModel(
            token=session_token,
            user_id=user_id,
            role="organizer",
            created_at=datetime.utcnow()
        )
        db.add(new_session)

        try:
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organizer ID is already registered."
            )

        event_info = AuthService.get_event_info(db, event_id)
        return user, session_token, event_info

    @staticmethod
    def login_organizer(
        db: Session,
        email: str,
        organizer_id: str,
        event_id: Optional[str] = None
    ) -> Tuple[User, str, Optional[Dict[str, Any]]]:
        normalized_email = email.strip().lower()
        user = db.query(User).filter(User.email == normalized_email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or organizer ID"
            )

        if user.role != "organizer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: user is not an organizer"
            )

        if not user.org_id or user.org_id.strip() != organizer_id.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or organizer ID"
            )

        # Generate a new session upon successful login (login never creates a user)
        session_token = f"session_org_{uuid.uuid4().hex}"
        new_session = SessionModel(
            token=session_token,
            user_id=user.id,
            role=user.role,
            created_at=datetime.utcnow()
        )
        db.add(new_session)
        db.commit()
        db.refresh(user)

        event_info = AuthService.get_event_info(db, event_id)
        return user, session_token, event_info

    @staticmethod
    def register_or_login_participant(
        db: Session,
        name: str,
        email: str,
        student_id: Optional[str] = None,
        college: Optional[str] = None,
        event_id: Optional[str] = None
    ) -> Tuple[User, str, Optional[Dict[str, Any]]]:
        normalized_email = email.strip().lower()
        user = db.query(User).filter(User.email == normalized_email).first()

        if not user:
            user_id = f"prt_{uuid.uuid4().hex[:8]}"
            user = User(
                id=user_id,
                name=name.strip() if name else "Participant",
                email=normalized_email,
                role="participant"
            )
            db.add(user)
            db.flush()
        else:
            if name and (not user.name or user.name == "Participant"):
                user.name = name.strip()

        session_token = f"session_prt_{uuid.uuid4().hex}"
        new_session = SessionModel(
            token=session_token,
            user_id=user.id,
            role="participant",
            created_at=datetime.utcnow()
        )
        db.add(new_session)
        db.commit()
        db.refresh(user)

        event_info = AuthService.get_event_info(db, event_id)
        return user, session_token, event_info

    @staticmethod
    def login_participant(
        db: Session,
        email: str,
        event_id: Optional[str] = None
    ) -> Tuple[User, str, Optional[Dict[str, Any]]]:
        normalized_email = email.strip().lower()
        user = db.query(User).filter(User.email == normalized_email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant account not found. Please register as a participant first."
            )

        if user.role not in ["participant", "organizer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is not authorized for participant access."
            )

        session_token = f"session_prt_{uuid.uuid4().hex}"
        new_session = SessionModel(
            token=session_token,
            user_id=user.id,
            role="participant",
            created_at=datetime.utcnow()
        )
        db.add(new_session)
        db.commit()
        db.refresh(user)

        effective_event_id = event_id
        if not effective_event_id or effective_event_id == "evt_smart_hack_2027":
            from backend.app.models.team_member import TeamMember
            from backend.app.models.team import Team
            member = db.query(TeamMember).filter(TeamMember.user_email.ilike(normalized_email)).first()
            if member:
                tm = db.query(Team).filter(Team.id == member.team_id).first()
                if tm and tm.event_id:
                    effective_event_id = tm.event_id
        if not effective_event_id or effective_event_id == "evt_smart_hack_2027":
            effective_event_id = "evt_01"

        event_info = AuthService.get_event_info(db, effective_event_id)
        return user, session_token, event_info

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.strip().lower()).first()
