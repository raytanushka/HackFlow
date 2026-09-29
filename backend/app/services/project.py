import hashlib
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any
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
    def list_projects(
        db: Session,
        event_id: Optional[str] = None,
        seed: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[dict]:
        query = db.query(Project)
        if event_id:
            query = query.filter(Project.event_id == event_id)
        
        projects = query.order_by(Project.submitted_at.desc()).all()
        now = datetime.utcnow()
        
        # Cache events voting status
        event_voting_map = {}
        for ev in db.query(Event).all():
            if not ev.voting_open:
                st = "upcoming" if (ev.submissions_close and now < ev.submissions_close) else "open"
            elif now < ev.voting_open:
                st = "upcoming"
            elif ev.voting_close and now > ev.voting_close:
                st = "closed"
            else:
                st = "open"
            event_voting_map[ev.id] = st

        # User's voted project IDs if user_id is provided
        user_voted_set = set()
        if user_id:
            from backend.app.models.vote import Vote
            votes = db.query(Vote.project_id).filter(Vote.participant_id == user_id).all()
            user_voted_set = {v[0] for v in votes}

        result = []
        for p in projects:
            track = db.query(Track).filter(Track.id == p.track_id).first()
            team = db.query(Team).filter(Team.id == p.team_id).first()
            v_status = event_voting_map.get(p.event_id, "closed")
            
            proj_dict = {
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
                "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None,
                "status": "Submitted",
                "voting_status": v_status,
                "has_voted": p.id in user_voted_set if user_id else False
            }
            
            # Critical T3 requirement: Hide results during voting window!
            # If voting is open, vote counts must NOT be returned.
            if v_status == "closed":
                from backend.app.models.vote import Vote
                proj_dict["vote_count"] = db.query(Vote).filter(Vote.project_id == p.id).count()
            else:
                proj_dict["vote_count"] = None
                
            result.append(proj_dict)

        # Deterministic session-based randomized ballot ordering if seed is provided
        if seed:
            result.sort(key=lambda p: hashlib.sha256(f"{seed}:{p['id']}".encode()).hexdigest())

        return result

    @staticmethod
    def get_project(db: Session, project_id: str, user: Optional[Any] = None) -> dict:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project '{project_id}' not found")
        
        track = db.query(Track).filter(Track.id == project.track_id).first()
        team = db.query(Team).filter(Team.id == project.team_id).first()
        event = db.query(Event).filter(Event.id == project.event_id).first()
        
        teammates = []
        if team:
            members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
            teammates = [m.user_email for m in members]

        from backend.app.services.voting import VotingService
        voting_status = VotingService.get_event_voting_status(event) if event else "closed"

        has_voted = False
        is_own = False
        if user:
            from backend.app.models.vote import Vote
            existing = db.query(Vote).filter(Vote.participant_id == user.id, Vote.project_id == project.id).first()
            has_voted = bool(existing)
            is_own = VotingService.is_own_project(db, project, user)

        proj_dict = {
            "id": project.id,
            "event_id": project.event_id,
            "event_name": event.name if event else None,
            "team_id": project.team_id,
            "team_name": team.name if team else None,
            "teammates": teammates,
            "track_id": project.track_id,
            "track_name": track.name if track else None,
            "title": project.title,
            "summary": project.summary,
            "repo_url": project.repo_url,
            "demo_url": project.demo_url,
            "submitted_at": project.submitted_at.isoformat() if project.submitted_at else None,
            "voting_status": voting_status,
            "has_voted": has_voted,
            "is_own": is_own
        }

        # Hide vote count during active voting
        if voting_status == "closed":
            from backend.app.models.vote import Vote
            proj_dict["vote_count"] = db.query(Vote).filter(Vote.project_id == project.id).count()
        else:
            proj_dict["vote_count"] = None

        return proj_dict
