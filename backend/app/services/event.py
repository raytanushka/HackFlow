from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.event import Event
from backend.app.models.track import Track

class EventService:
    @staticmethod
    def list_events(db: Session) -> List[dict]:
        events = db.query(Event).all()
        now = datetime.utcnow()
        result = []
        for e in events:
            is_open = e.submissions_close > now if e.submissions_close else False
            result.append({
                "id": e.id,
                "name": e.name,
                "description": e.description,
                "submissions_close": e.submissions_close,
                "is_open": is_open,
                "organizer_id": e.organizer_id
            })
        return result

    @staticmethod
    def get_event_detail(db: Session, event_id: str) -> Optional[dict]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return None
        now = datetime.utcnow()
        is_open = event.submissions_close > now if event.submissions_close else False
        tracks = db.query(Track).filter(Track.event_id == event_id).all()
        return {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "submissions_close": event.submissions_close,
            "is_open": is_open,
            "organizer_id": event.organizer_id,
            "tracks": tracks
        }
