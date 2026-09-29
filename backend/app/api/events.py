from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.security import get_current_session
from backend.app.schemas.event import EventResponse, EventDetailResponse, TrackResponse
from backend.app.schemas.project import ProjectCreateRequest, ProjectResponse
from backend.app.models.track import Track
from backend.app.services.event import EventService
from backend.app.services.project import ProjectService

router = APIRouter(prefix="/api/events", tags=["events"])

@router.get("", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db)):
    """List all hackathon events."""
    return EventService.list_events(db)

@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    """Get details of a specific event including its tracks and open status."""
    detail = EventService.get_event_detail(db, event_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found"
        )
    return detail

@router.get("/{event_id}/tracks", response_model=List[TrackResponse])
def get_event_tracks(event_id: str, db: Session = Depends(get_db)):
    """List tracks for a specific event."""
    tracks = db.query(Track).filter(Track.event_id == event_id).order_by(Track.id).all()
    return tracks


@router.post("/{event_id}/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def submit_project_to_event(
    event_id: str,
    req: ProjectCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submit a project to a specific event.
    Authoritatively checks the event's submissions_close deadline from the database.
    If the deadline has passed, rejects with 4xx.
    """
    user_id = None
    user_role = None
    try:
        session = get_current_session(request, db)
        user_id = session.get("user_id")
        user_role = session.get("role")
    except HTTPException:
        # If no auth header was provided at all, still let deadline check execute first
        # so closed events fail with proper deadline/closed 4xx response
        pass

    project = ProjectService.submit_project(
        db=db,
        event_id=event_id,
        req=req,
        user_id=user_id,
        user_role=user_role
    )
    return project

import uuid
from datetime import datetime
from backend.app.models.event import Event
from backend.app.models.team import Team
from backend.app.models.team_member import TeamMember

@router.get("/{event_id}/projects")
def get_event_projects(event_id: str, db: Session = Depends(get_db)):
    """Get all submitted projects for a specific event."""
    return ProjectService.list_projects(db, event_id=event_id)

@router.post("/{event_id}/join")
def join_event(
    event_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Join an open hackathon as an authenticated participant.
    Authoritatively checks that:
    1. User is authenticated with an active session
    2. Event exists
    3. Event is currently open (submissions_close > now)
    4. If participant is already a member, returns idempotent success
    5. If not, adds participant as a member/team in that event
    """
    session = get_current_session(request, db)
    user = session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to join an event."
        )

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found."
        )

    now = datetime.utcnow()
    if event.submissions_close and event.submissions_close <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This hackathon is closed for participation."
        )

    # Check if participant already has a team/membership in this event
    user_email = (user.email or "").strip().lower()
    existing_team = None
    if user_email:
        member = db.query(TeamMember).join(Team, Team.id == TeamMember.team_id).filter(
            Team.event_id == event_id,
            TeamMember.user_email.ilike(user_email)
        ).first()
        if member:
            existing_team = db.query(Team).filter(Team.id == member.team_id).first()

    if not existing_team:
        existing_team = db.query(Team).filter(
            Team.event_id == event_id,
            Team.created_by == user.id
        ).first()

    if existing_team:
        return {
            "message": "Already a member of this hackathon",
            "event_id": event.id,
            "event_name": event.name,
            "team_id": existing_team.id,
            "already_member": True
        }

    # Create team & membership for this participant
    new_team_id = f"tm_{uuid.uuid4().hex[:8]}"
    team_name = f"{user.name}'s Team" if user.name else "Participant Team"
    new_team = Team(
        id=new_team_id,
        event_id=event.id,
        name=team_name,
        created_by=user.id
    )
    db.add(new_team)
    if user.email:
        db.add(TeamMember(team_id=new_team_id, user_email=user.email.strip().lower()))

    db.commit()
    db.refresh(new_team)

    return {
        "message": "Successfully joined hackathon",
        "event_id": event.id,
        "event_name": event.name,
        "team_id": new_team.id,
        "already_member": False
    }
