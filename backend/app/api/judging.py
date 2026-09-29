import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session as DBSession

from backend.app.db.database import get_db
from backend.app.core.security import get_current_session, require_judge
from backend.app.models.user import User
from backend.app.models.track import Track
from backend.app.models.judge_assignment import JudgeAssignment
from backend.app.schemas.judging import (
    RubricSchema,
    ScoreSubmitSchema,
    ScoreResponseSchema,
    JudgeProgressSchema,
    ProjectResultSchema,
    TrackCommentCreateSchema,
    TrackCommentSchema
)
from backend.app.services.judging import (
    get_rubric,
    get_judge_projects,
    get_judge_project_detail,
    get_judge_scores,
    get_my_score,
    save_judge_score,
    get_judge_progress,
    get_project_results,
    get_track_comments,
    add_track_comment,
    log_audit
)

router = APIRouter(prefix="/api/judge", tags=["judging"])

@router.get("/me")
def get_current_judge_profile(
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    user = db.query(User).filter(User.id == judge_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Judge not found")

    tracks = db.query(
        Track.id,
        Track.name
    ).join(
        JudgeAssignment, JudgeAssignment.track_id == Track.id
    ).filter(
        JudgeAssignment.judge_id == judge_id
    ).order_by(
        Track.name
    ).all()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "tracks": [{"id": t.id, "name": t.name} for t in tracks]
    }

@router.get("/rubric")
def get_judging_rubric():
    return get_rubric()

@router.get("/projects")
def list_judge_assigned_projects(
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    return get_judge_projects(db, judge_id)

@router.get("/projects/{project_id}")
def get_project_for_evaluation(
    project_id: str,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    return get_judge_project_detail(db, judge_id, project_id)

@router.get("/scores")
def list_judge_scores(
    judge: Optional[str] = Query(None, description="Judge ID query parameter"),
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    """
    Critical T2 peer isolation:
    A judge can ONLY access their own scores.
    If 'judge' query param is provided and doesn't match session user_id, 403 Forbidden is returned.
    Participants are blocked by require_judge (returns 403 Forbidden).
    """
    current_judge_id = session["user_id"]
    if judge is not None and str(judge).strip() != current_judge_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Judges may only access their own scores"
        )
    return get_judge_scores(db, current_judge_id)

@router.get("/scores/{project_id}")
def get_project_score(
    project_id: str,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    score = get_my_score(db, judge_id, project_id)
    return score

@router.post("/scores")
def submit_judge_score(
    payload: ScoreSubmitSchema,
    request: Request,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    target_project_id = payload.projectId or payload.project_id
    if not target_project_id:
        raise HTTPException(status_code=400, detail="projectId is required")

    score = save_judge_score(
        db=db,
        judge_id=judge_id,
        project_id=target_project_id,
        criteria=payload.criteria,
        comment=payload.comment or ""
    )
    log_audit(
        db=db,
        user_id=judge_id,
        action="score_upsert",
        target_type="score",
        target_id=f"{judge_id}:{target_project_id}",
        details=json.dumps({"projectId": target_project_id, "criteria": payload.criteria})
    )
    return score

@router.put("/scores/{project_id}")
def update_judge_score(
    project_id: str,
    payload: ScoreSubmitSchema,
    request: Request,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    score = save_judge_score(
        db=db,
        judge_id=judge_id,
        project_id=project_id,
        criteria=payload.criteria,
        comment=payload.comment or ""
    )
    log_audit(
        db=db,
        user_id=judge_id,
        action="score_update",
        target_type="score",
        target_id=f"{judge_id}:{project_id}",
        details=json.dumps({"projectId": project_id, "criteria": payload.criteria})
    )
    return score

@router.get("/progress")
def get_progress_stats(
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    return get_judge_progress(db, judge_id)

@router.get("/projects/{project_id}/result")
def get_project_result_analysis(
    project_id: str,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    return get_project_results(db, project_id)

@router.get("/tracks/{track_id}/comments")
def get_comments_for_track(
    track_id: str,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    # Verify judge is assigned to track
    assigned = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.track_id == track_id
    ).first()
    if not assigned and session.get("role") not in ("organizer", "admin"):
        raise HTTPException(status_code=403, detail="Track is not assigned to this judge")
    return get_track_comments(db, track_id)

@router.post("/tracks/{track_id}/comments", status_code=201)
def add_comment_for_track(
    track_id: str,
    payload: TrackCommentCreateSchema,
    db: DBSession = Depends(get_db),
    session: dict = Depends(require_judge)
):
    judge_id = session["user_id"]
    assigned = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.track_id == track_id
    ).first()
    if not assigned and session.get("role") not in ("organizer", "admin"):
        raise HTTPException(status_code=403, detail="Track is not assigned to this judge")

    comment_text = payload.comment.strip()
    if not comment_text:
        raise HTTPException(status_code=400, detail="comment is required")

    result = add_track_comment(db, judge_id, track_id, comment_text)
    log_audit(
        db=db,
        user_id=judge_id,
        action="track_comment",
        target_type="judge_comment",
        target_id=result["id"],
        details=json.dumps({"trackId": track_id})
    )
    return result
