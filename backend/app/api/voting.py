from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.security import get_current_session
from backend.app.services.voting import VotingService
from backend.app.services.project import ProjectService

router = APIRouter(tags=["voting"])

class CommentCreateRequest(BaseModel):
    content: str

@router.get("/api/participant/status")
def get_participant_status(
    request: Request,
    event_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns the authoritative participant state from the database:
    - active event information and deadlines
    - participant's team
    - submission state ('submitted', 'not_submitted_open', 'submissions_closed')
    - community voting status ('open', 'upcoming', 'closed')
    - list of voted project IDs
    """
    session = get_current_session(request, db)
    user = session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Participant authentication required."
        )

    return VotingService.get_participant_status(db=db, user=user, event_id=event_id)

@router.get("/api/projects/{project_id}")
def get_project_details(
    project_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a single project.
    If authenticated, returns whether the user has voted and whether it is their own project.
    Vote totals are hidden while community voting is active.
    """
    user = None
    try:
        session = get_current_session(request, db)
        user = session.get("user")
    except Exception:
        pass

    return ProjectService.get_project(db=db, project_id=project_id, user=user)

@router.post("/api/projects/{project_id}/vote")
def cast_vote(
    project_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Cast a community vote for a project.
    Authoritatively verified:
    - authenticated participant
    - voting window must be active
    - participant cannot vote for their own project (HTTP 400)
    - participant cannot vote multiple times for the same project (HTTP 400 + DB UNIQUE)
    - rate-limited and logged to audit trail
    """
    session = get_current_session(request, db)
    user = session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in as a participant to vote."
        )

    client_ip = request.client.host if request.client else ""
    return VotingService.cast_vote(db=db, user=user, project_id=project_id, client_ip=client_ip)

@router.delete("/api/projects/{project_id}/vote")
def retract_vote(
    project_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Remove or toggle off a previously cast vote while voting window is open.
    """
    session = get_current_session(request, db)
    user = session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in as a participant."
        )

    return VotingService.retract_vote(db=db, user=user, project_id=project_id)

@router.get("/api/projects/{project_id}/comments")
def get_project_comments(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve persisted community comments for a project.
    Publicly readable.
    """
    return VotingService.list_comments(db=db, project_id=project_id)

@router.post("/api/projects/{project_id}/comments")
def post_project_comment(
    project_id: str,
    req: CommentCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Post a comment on a project.
    Requires authenticated participant session.
    Persisted to database, rate-limited, and logged to audit trail.
    """
    session = get_current_session(request, db)
    user = session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in as a participant to leave a comment."
        )

    return VotingService.create_comment(
        db=db,
        user=user,
        project_id=project_id,
        content=req.content
    )
