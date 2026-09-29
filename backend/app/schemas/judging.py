from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union
from datetime import datetime

class CriterionSchema(BaseModel):
    id: str
    name: str
    weight: float
    max_score: float = 5.0

class RubricSchema(BaseModel):
    id: str
    event_id: str
    name: str
    criteria: List[CriterionSchema]

class ScoreSubmitSchema(BaseModel):
    projectId: Optional[str] = None
    project_id: Optional[str] = None
    criteria: Dict[str, float]
    comment: Optional[str] = ""

class ScoreResponseSchema(BaseModel):
    id: Union[int, str]
    judge_id: str
    project_id: str
    criteria: Dict[str, float]
    comment: Optional[str] = ""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    project_title: Optional[str] = None

class JudgeProgressSchema(BaseModel):
    total: int
    scored: int
    pending: int
    percent: float

class NormalizedScoreSchema(BaseModel):
    judge_id: str
    criteria: Dict[str, float]
    comment: Optional[str] = ""
    raw_score: float
    normalized_score: float
    updated_at: Optional[str] = None

class ProjectResultSchema(BaseModel):
    project_id: str
    judge_count: int
    raw_average: Optional[float] = None
    normalized_average: Optional[float] = None
    scores: List[NormalizedScoreSchema] = []

class TrackCommentCreateSchema(BaseModel):
    comment: str

class TrackCommentSchema(BaseModel):
    id: str
    judge_id: str
    track_id: str
    comment: str
    created_at: str
