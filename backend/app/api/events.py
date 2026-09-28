from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.security import get_current_session
from backend.app.schemas.event import EventResponse, EventDetailResponse
from backend.app.schemas.project import ProjectCreateRequest, ProjectResponse
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

@router.get("/{event_id}/projects")
def get_event_projects(event_id: str, db: Session = Depends(get_db)):
    """Get all submitted projects for a specific event."""
    return ProjectService.list_projects(db, event_id=event_id)
