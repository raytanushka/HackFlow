import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.event import Event
from backend.app.models.track import Track
from backend.app.models.team import Team
from backend.app.models.team_member import TeamMember
from backend.app.models.project import Project
from backend.app.schemas.project import ProjectCreateRequest

class ProjectService:
    @staticmethod
    def _is_deadline_passed(submissions_close: datetime) -> bool:
        if not submissions_close:
            return False
        if submissions_close.tzinfo is not None:
            now = datetime.now(timezone.utc)
        else:
            now = datetime.utcnow()
        return now > submissions_close

    @staticmethod
    def submit_project(
        db: Session,
        event_id: str,
        req: ProjectCreateRequest,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> Project:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event '{event_id}' not found."
            )

        # 1. Enforce deadline from database
        if ProjectService._is_deadline_passed(event.submissions_close):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Submissions for event '{event.name}' are closed (deadline was {event.submissions_close.isoformat()}). Late submissions are rejected."
            )

        # 2. Enforce participant authentication
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required: please log in as a participant before submitting a project."
            )

        if user_role and user_role not in ["participant", "organizer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: only registered participants can submit projects."
            )

        # 3. Resolve Track
        track_id = req.track_id
        if not track_id and req.track:
            matched_track = db.query(Track).filter(
                Track.event_id == event_id,
                Track.name.ilike(f"%{req.track}%")
            ).first()
            if matched_track:
                track_id = matched_track.id

        if not track_id:
            first_track = db.query(Track).filter(Track.event_id == event_id).first()
            if first_track:
                track_id = first_track.id
            else:
                new_track = Track(
                    id=f"trk_{uuid.uuid4().hex[:6]}",
                    event_id=event_id,
                    name="General"
                )
                db.add(new_track)
                db.flush()
                track_id = new_track.id

        # 3. Resolve Team
        team_id = req.team
        if not team_id or not db.query(Team).filter(Team.id == team_id).first():
            t_name = req.team_name or req.team or f"Team-{req.title[:12]}"
            new_team = Team(
                id=f"tm_{uuid.uuid4().hex[:8]}",
                event_id=event_id,
                name=t_name,
                created_by=user_id
            )
            db.add(new_team)
            db.flush()
            team_id = new_team.id

            if req.teammates:
                for member_name in req.teammates.split(","):
                    name_clean = member_name.strip()
                    if name_clean:
                        db.add(TeamMember(team_id=team_id, user_email=name_clean))

        # 4. Resolve summary
        summary = req.summary
        if not summary or not summary.strip():
            summary_parts = []
            if req.problem:
                summary_parts.append(req.problem)
            if req.solution:
                summary_parts.append(req.solution)
            summary = " — ".join(summary_parts) if summary_parts else f"Submission for {req.title}"

        # 5. Create project
        project = Project(
            id=f"prj_{uuid.uuid4().hex[:8]}",
            event_id=event_id,
            team_id=team_id,
            track_id=track_id,
            title=req.title.strip(),
            summary=summary.strip(),
            repo_url=req.repo_url.strip() if req.repo_url else None,
            demo_url=req.demo_url or req.deck_url,
            submitted_at=datetime.utcnow()
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        return project

    @staticmethod
    def list_projects(db: Session, event_id: Optional[str] = None) -> List[dict]:
        query = db.query(Project)
        if event_id:
            query = query.filter(Project.event_id == event_id)
        
        projects = query.order_by(Project.submitted_at.desc()).all()
        result = []
        for p in projects:
            track = db.query(Track).filter(Track.id == p.track_id).first()
            team = db.query(Team).filter(Team.id == p.team_id).first()
            result.append({
                "id": p.id,
                "event_id": p.event_id,
                "team_id": p.team_id,
                "team_name": team.name if team else None,
                "track_id": p.track_id,
                "track_name": track.name if track else None,
                "title": p.title,
                "summary": p.summary,
                "repo_url": p.repo_url,
                "demo_url": p.demo_url,
                "submitted_at": p.submitted_at
            })
        return result
