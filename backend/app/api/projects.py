from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.security import get_current_session
from backend.app.schemas.project import ProjectCreateRequest, ProjectResponse
from backend.app.services.project import ProjectService

router = APIRouter(tags=["projects"])

@router.get("/projects")
@router.get("/api/projects")
def get_public_projects(
    request: Request,
    event_id: Optional[str] = Query(None),
    seed: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Public project gallery endpoint.
    Requires no authentication and returns HTTP 200.
    Returns project data from the database (including fixture projects).
    Supports randomized ballot ordering (via seed parameter or participant session).
    Hides vote totals during active voting window.
    """
    user_id = None
    if request:
        try:
            session = get_current_session(request, db)
            user_id = session.get("user_id")
        except Exception:
            pass

    effective_seed = seed or (user_id if (user_id and event_id) else None)

    return ProjectService.list_projects(
        db,
        event_id=event_id,
        seed=effective_seed,
        user_id=user_id
    )

@router.post("/projects/new", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def submit_project_generic(
    req: ProjectCreateRequest,
    request: Request,
    event_id: str = Query("evt_01"),
    db: Session = Depends(get_db)
):
    """
    Submission route fallback defaulting to fixture event evt_01.
    Checks the target event's deadline in the database and rejects closed events with 4xx.
    """
    user_id = None
    user_role = None
    try:
        session = get_current_session(request, db)
        user_id = session.get("user_id")
        user_role = session.get("role")
    except Exception:
        pass

    return ProjectService.submit_project(
        db=db,
        event_id=event_id,
        req=req,
        user_id=user_id,
        user_role=user_role
    )
