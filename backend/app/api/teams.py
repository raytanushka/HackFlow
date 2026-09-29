from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.db.database import get_db
from backend.app.models.team import Team

router = APIRouter(prefix="/api/teams", tags=["teams"])

class TeamResponse(BaseModel):
    id: str
    name: str
    event_id: Optional[str] = None
    created_by: Optional[str] = None

    class Config:
        orm_mode = True

@router.get("", response_model=List[TeamResponse])
def list_teams(db: Session = Depends(get_db)):
    """List all teams."""
    return db.query(Team).all()

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, db: Session = Depends(get_db)):
    """Get a specific team."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return team
