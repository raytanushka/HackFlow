import math
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from backend.app.models.project import Project
from backend.app.models.track import Track
from backend.app.models.team import Team
from backend.app.models.team_member import TeamMember
from backend.app.models.user import User
from backend.app.models.score import Score
from backend.app.models.judge_assignment import JudgeAssignment
from backend.app.models.judge_comment import JudgeComment
from backend.app.models.audit import AuditLog

DEFAULT_RUBRIC = {
    "id": "rubric_default",
    "event_id": "evt_01",
    "name": "Default judging rubric",
    "criteria": [
        {"id": "functionality", "name": "Functionality", "weight": 40.0, "max_score": 5.0},
        {"id": "quality", "name": "Quality", "weight": 30.0, "max_score": 5.0},
        {"id": "innovation", "name": "Innovation", "weight": 30.0, "max_score": 5.0},
    ]
}

def get_rubric(event_id: str = "evt_01") -> Dict[str, Any]:
    return DEFAULT_RUBRIC

def validate_criteria(criteria: dict, rubric: dict = DEFAULT_RUBRIC) -> Optional[str]:
    if not isinstance(criteria, dict):
        return "criteria must be an object"
    criterion_ids = {c["id"] for c in rubric["criteria"]}
    for criterion in rubric["criteria"]:
        cid = criterion["id"]
        if cid not in criteria:
            return f"Missing criterion: {cid}"
        try:
            val = float(criteria[cid])
        except (ValueError, TypeError):
            return f"{cid} must be a number"
        if val < 0 or val > float(criterion["max_score"]):
            return f"{cid} must be between 0 and {criterion['max_score']}"
    for k in criteria.keys():
        if k not in criterion_ids:
            return f"Unknown criterion: {k}"
    return None

def calculate_weighted_score(criteria: dict, rubric: dict = DEFAULT_RUBRIC) -> float:
    total_weight = sum(float(c["weight"]) for c in rubric["criteria"])
    if total_weight <= 0:
        raise ValueError("Rubric weights must total more than zero")
    weighted = sum(
        (float(criteria[c["id"]]) / float(c["max_score"])) * float(c["weight"])
        for c in rubric["criteria"]
    )
    return round((weighted / total_weight) * 5.0, 4)

def can_judge_project(db: DBSession, judge_id: str, project_id: str) -> bool:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return False
    # Check if this judge is assigned to this project's track
    assigned = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.track_id == project.track_id
    ).first()
    return assigned is not None

def can_judge_track(db: DBSession, judge_id: str, track_id: str) -> bool:
    assigned = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.track_id == track_id
    ).first()
    return assigned is not None

def get_judge_projects(db: DBSession, judge_id: str) -> List[Dict[str, Any]]:
    assignments = db.query(JudgeAssignment.track_id).filter(JudgeAssignment.judge_id == judge_id).all()
    track_ids = [a[0] for a in assignments]
    if not track_ids:
        # If no explicit track assignment yet, allow evaluating submitted projects
        track_ids = [t[0] for t in db.query(Track.id).all()]

    projects = db.query(
        Project,
        Track.name.label("track_name"),
        Team.name.label("team_name")
    ).outerjoin(
        Track, Track.id == Project.track_id
    ).outerjoin(
        Team, Team.id == Project.team_id
    ).filter(
        Project.track_id.in_(track_ids)
    ).order_by(
        Track.name, Project.title
    ).all()

    results = []
    for p, track_name, team_name in projects:
        results.append({
            "id": p.id,
            "title": p.title,
            "summary": p.summary or "",
            "repo_url": p.repo_url or "",
            "demo_url": p.demo_url or "",
            "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None,
            "status": "submitted",
            "team_id": p.team_id,
            "track_id": p.track_id,
            "track_name": track_name or p.track_id,
            "team_name": team_name or p.team_id
        })
    return results

def get_judge_project_detail(db: DBSession, judge_id: str, project_id: str) -> Dict[str, Any]:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not can_judge_project(db, judge_id, project_id):
        raise HTTPException(status_code=403, detail="Project is not assigned to this judge")

    track = db.query(Track).filter(Track.id == project.track_id).first()
    team = db.query(Team).filter(Team.id == project.team_id).first()
    members = db.query(TeamMember.user_email).filter(TeamMember.team_id == project.team_id).all()

    return {
        "id": project.id,
        "title": project.title,
        "summary": project.summary,
        "repo_url": project.repo_url or "",
        "repoUrl": project.repo_url or "",
        "demo_url": project.demo_url or "",
        "submitted_at": project.submitted_at.isoformat() if project.submitted_at else None,
        "status": "submitted",
        "team_id": project.team_id,
        "track_id": project.track_id,
        "track": track.name if track else project.track_id,
        "track_name": track.name if track else project.track_id,
        "team": {
            "id": project.team_id,
            "name": team.name if team else project.team_id,
            "members": [m[0] for m in members]
        }
    }

def get_judge_scores(db: DBSession, judge_id: str) -> List[Dict[str, Any]]:
    scores = db.query(
        Score,
        Project.title.label("project_title")
    ).outerjoin(
        Project, Project.id == Score.project_id
    ).filter(
        Score.judge_id == judge_id
    ).order_by(
        Score.updated_at.desc() if hasattr(Score, "updated_at") else Score.id.desc()
    ).all()

    results = []
    for s, title in scores:
        crit = {
            "functionality": s.functionality,
            "quality": s.quality,
            "innovation": s.innovation
        }
        results.append({
            "id": s.id,
            "judge_id": s.judge_id,
            "project_id": s.project_id,
            "project_title": title or s.project_id,
            "criteria": crit,
            "comment": s.comment or "",
            "raw_score": calculate_weighted_score(crit),
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None
        })
    return results

def get_my_score(db: DBSession, judge_id: str, project_id: str) -> Optional[Dict[str, Any]]:
    s = db.query(Score).filter(
        Score.judge_id == judge_id,
        Score.project_id == project_id
    ).first()
    if not s:
        return None
    crit = {
        "functionality": s.functionality,
        "quality": s.quality,
        "innovation": s.innovation
    }
    return {
        "id": s.id,
        "judge_id": s.judge_id,
        "project_id": s.project_id,
        "criteria": crit,
        "comment": s.comment or "",
        "raw_score": calculate_weighted_score(crit),
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None
    }

def save_judge_score(db: DBSession, judge_id: str, project_id: str, criteria: dict, comment: str = "", rubric: dict = DEFAULT_RUBRIC) -> Dict[str, Any]:
    err = validate_criteria(criteria, rubric)
    if err:
        raise HTTPException(status_code=400, detail=err)
    if not can_judge_project(db, judge_id, project_id):
        raise HTTPException(status_code=403, detail="Project is not assigned to this judge")

    score = db.query(Score).filter(
        Score.judge_id == judge_id,
        Score.project_id == project_id
    ).first()

    now = datetime.utcnow()
    func_val = int(round(criteria.get("functionality", 0)))
    qual_val = int(round(criteria.get("quality", 0)))
    innov_val = int(round(criteria.get("innovation", 0)))

    if score:
        score.functionality = func_val
        score.quality = qual_val
        score.innovation = innov_val
        score.comment = comment or ""
        score.updated_at = now
    else:
        score = Score(
            judge_id=judge_id,
            project_id=project_id,
            functionality=func_val,
            quality=qual_val,
            innovation=innov_val,
            comment=comment or "",
            created_at=now,
            updated_at=now
        )
        db.add(score)
    db.commit()
    db.refresh(score)
    return get_my_score(db, judge_id, project_id)

def get_judge_progress(db: DBSession, judge_id: str) -> Dict[str, Any]:
    assignments = db.query(JudgeAssignment.track_id).filter(JudgeAssignment.judge_id == judge_id).all()
    track_ids = [a[0] for a in assignments]
    if not track_ids:
        track_ids = [t[0] for t in db.query(Track.id).all()]

    total = db.query(Project).filter(Project.track_id.in_(track_ids)).count() if track_ids else 0
    scored = db.query(Score).join(
        Project, Project.id == Score.project_id
    ).filter(
        Score.judge_id == judge_id,
        Project.track_id.in_(track_ids)
    ).count() if track_ids else 0

    pending = max(0, total - scored)
    percent = round((scored / total * 100.0), 2) if total > 0 else 0.0
    return {
        "total": total,
        "scored": scored,
        "pending": pending,
        "percent": percent
    }

def get_project_results(db: DBSession, project_id: str) -> Dict[str, Any]:
    rubric = DEFAULT_RUBRIC
    scores = db.query(Score).filter(Score.project_id == project_id).all()
    if not scores:
        return {
            "project_id": project_id,
            "judge_count": 0,
            "raw_average": None,
            "normalized_average": None,
            "scores": []
        }

    score_list = []
    for s in scores:
        crit = {
            "functionality": s.functionality,
            "quality": s.quality,
            "innovation": s.innovation
        }
        raw_val = calculate_weighted_score(crit, rubric)
        score_list.append({
            "judge_id": s.judge_id,
            "criteria": crit,
            "comment": s.comment or "",
            "raw_score": raw_val,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None
        })

    raw_average = sum(x["raw_score"] for x in score_list) / len(score_list)

    by_judge = {}
    for item in score_list:
        jid = item["judge_id"]
        if jid not in by_judge:
            all_judge_scores = db.query(Score).filter(Score.judge_id == jid).all()
            all_raw = [
                calculate_weighted_score({
                    "functionality": js.functionality,
                    "quality": js.quality,
                    "innovation": js.innovation
                }, rubric)
                for js in all_judge_scores
            ]
            if all_raw:
                mean = sum(all_raw) / len(all_raw)
                variance = sum((x - mean) ** 2 for x in all_raw) / len(all_raw)
                sd = math.sqrt(variance)
            else:
                mean = 2.5
                sd = 0.0
            by_judge[jid] = {"mean": mean, "sd": sd}

    # Normalization: centered at 2.5, scaled by 0.75 SD, clipped to [0, 5]
    normalized_list = []
    for item in score_list:
        stats = by_judge[item["judge_id"]]
        if stats["sd"] == 0.0:
            norm_val = 2.5
        else:
            norm_val = 2.5 + ((item["raw_score"] - stats["mean"]) / stats["sd"]) * 0.75
        clamped = max(0.0, min(5.0, norm_val))
        normalized_list.append({
            **item,
            "normalized_score": round(clamped, 4)
        })

    normalized_average = sum(x["normalized_score"] for x in normalized_list) / len(normalized_list)

    return {
        "project_id": project_id,
        "judge_count": len(score_list),
        "raw_average": round(raw_average, 4),
        "normalized_average": round(normalized_average, 4),
        "scores": normalized_list
    }

def get_track_comments(db: DBSession, track_id: str) -> List[Dict[str, Any]]:
    comments = db.query(JudgeComment).filter(
        JudgeComment.track_id == track_id
    ).order_by(JudgeComment.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "judge_id": c.judge_id,
            "track_id": c.track_id,
            "comment": c.comment,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in comments
    ]

def add_track_comment(db: DBSession, judge_id: str, track_id: str, comment: str) -> Dict[str, Any]:
    cid = str(uuid.uuid4())
    now = datetime.utcnow()
    c = JudgeComment(
        id=cid,
        judge_id=judge_id,
        track_id=track_id,
        comment=comment,
        created_at=now
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {
        "id": c.id,
        "judge_id": c.judge_id,
        "track_id": c.track_id,
        "comment": c.comment,
        "created_at": c.created_at.isoformat()
    }

def log_audit(db: DBSession, user_id: str, action: str, target_type: str, target_id: str, details: str = ""):
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        created_at=datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()
