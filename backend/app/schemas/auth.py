from pydantic import BaseModel, EmailStr
from typing import Optional

class OrganizerRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    org_id: Optional[str] = None
    organizer_id: Optional[str] = None

    def get_organizer_id(self) -> str:
        val = self.organizer_id or self.org_id
        if not val or not val.strip():
            raise ValueError("organizer_id is required")
        return val.strip()

class OrganizerLoginRequest(BaseModel):
    email: str
    organizer_id: Optional[str] = None
    org_id: Optional[str] = None
    role: Optional[str] = None
    event_id: Optional[str] = None

    def get_organizer_id(self) -> str:
        val = self.organizer_id or self.org_id
        if not val or not val.strip():
            raise ValueError("organizer_id is required")
        return val.strip()

class ParticipantRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    student_id: Optional[str] = None
    college: Optional[str] = None
    event_id: Optional[str] = None

class ParticipantLoginRequest(BaseModel):
    email: str
    student_id: Optional[str] = None
    event_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    org_id: Optional[str] = None

    class Config:
        orm_mode = True

class AuthResponse(BaseModel):
    token: str
    token_type: str = "cookie"
    user: UserResponse
    event: Optional[dict] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    event: Optional[dict] = None

