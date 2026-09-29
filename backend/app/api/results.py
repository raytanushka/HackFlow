import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.security import require_organizer
from backend.app.models.event import Event
from backend.app.models.project import Project
from backend.app.models.team import Team
from backend.app.models.track import Track
from backend.app.models.user import User
from backend.app.models.score import Score

router = APIRouter(tags=["results"])

@router.get("/api/export.csv")
@router.get("/api/events/{event_id}/export.csv")
@router.get("/export.csv")
def export_results_csv(
    event_id: Optional[str] = None,
    db: Session = Depends(get_db),
    session: dict = Depends(require_organizer),
):
    """
    Organizer-only CSV export of judging and project evaluation data.
    Requires authenticated organizer session (returns 401/403 otherwise).
    Returns real CSV content formatted with standard Python csv module.
    """
    query = (
        db.query(
            Event.id.label("event_id"),
            Event.name.label("event_name"),
            Project.id.label("project_id"),
            Project.title.label("project_title"),
            Team.name.label("team_name"),
            Track.name.label("track_name"),
            User.id.label("judge_id"),
            User.name.label("judge_name"),
            Score.functionality,
            Score.quality,
            Score.innovation,
            Score.comment,
        )
        .select_from(Project)
        .outerjoin(Score, Project.id == Score.project_id)
        .outerjoin(Event, Project.event_id == Event.id)
        .outerjoin(Team, Project.team_id == Team.id)
        .outerjoin(Track, Project.track_id == Track.id)
        .outerjoin(User, Score.judge_id == User.id)
    )

    if event_id:
        query = query.filter(Project.event_id == event_id)

    records = query.order_by(Event.id, Project.title, User.name, Score.id).all()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Header row
    writer.writerow([
        "Event ID",
        "Event Name",
        "Project ID",
        "Project Title",
        "Team",
        "Track",
        "Judge ID",
        "Judge Name",
        "Functionality",
        "Quality",
        "Innovation",
        "Total Score",
        "Comments",
    ])

    for r in records:
        if r.functionality is not None and r.quality is not None and r.innovation is not None:
            total_score = r.functionality + r.quality + r.innovation
            func_val = r.functionality
            qual_val = r.quality
            innov_val = r.innovation
        else:
            total_score = ""
            func_val = ""
            qual_val = ""
            innov_val = ""

        writer.writerow([
            r.event_id or "",
            r.event_name or "",
            r.project_id or "",
            r.project_title or "",
            r.team_name or "",
            r.track_name or "",
            r.judge_id or "",
            r.judge_name or "",
            func_val,
            qual_val,
            innov_val,
            total_score,
            r.comment or "",
        ])

    csv_content = output.getvalue()
    filename = f"hackflow-export-{event_id}.csv" if event_id else "hackflow-export.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
