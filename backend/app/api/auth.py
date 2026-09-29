from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.schemas.auth import (
    OrganizerRegisterRequest,
    OrganizerLoginRequest,
    ParticipantRegisterRequest,
    ParticipantLoginRequest,
    JudgeRegisterRequest,
    JudgeLoginRequest,
    UserResponse,
    AuthResponse
)
from backend.app.services.auth import AuthService
from backend.app.core.security import get_current_session
from backend.app.models.session import Session as SessionModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register-organizer", response_model=AuthResponse)
def register_organizer(
    req: OrganizerRegisterRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    org_id = req.get_organizer_id()
    user, token, event_info = AuthService.register_organizer(
        db=db,
        name=req.name,
        email=req.email,
        org_id=org_id
    )
    response.set_cookie(key="session", value=token, httponly=False, samesite="lax", path="/")
    return AuthResponse(token=token, token_type="cookie", user=UserResponse.from_orm(user), event=event_info)

@router.post("/register-participant", response_model=AuthResponse)
def register_participant(
    req: ParticipantRegisterRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user, token, event_info = AuthService.register_or_login_participant(
        db=db,
        name=req.name,
        email=req.email,
        student_id=req.student_id,
        college=req.college,
        event_id=req.event_id
    )
    response.set_cookie(key="session", value=token, httponly=False, samesite="lax", path="/")
    return AuthResponse(token=token, token_type="cookie", user=UserResponse.from_orm(user), event=event_info)

@router.post("/login-participant", response_model=AuthResponse)
def login_participant(
    req: ParticipantLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user, token, event_info = AuthService.login_participant(
        db=db,
        email=req.email,
        event_id=req.event_id
    )
    response.set_cookie(key="session", value=token, httponly=False, samesite="lax", path="/")
    return AuthResponse(token=token, token_type="cookie", user=UserResponse.from_orm(user), event=event_info)

@router.post("/register-judge", response_model=AuthResponse)
def register_judge(
    req: JudgeRegisterRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Judge registration is not available."
    )

@router.post("/login-judge", response_model=AuthResponse)
def login_judge(
    req: JudgeLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    judge_id = req.get_judge_id()
    user, token, event_info = AuthService.login_judge(
        db=db,
        email=req.email,
        judge_id=judge_id
    )
    response.set_cookie(key="session", value=token, httponly=False, samesite="lax", path="/")
    return AuthResponse(token=token, token_type="cookie", user=UserResponse.from_orm(user), event=event_info)

@router.post("/login", response_model=AuthResponse)
def login_user(
    req: OrganizerLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    if req.role == "judge":
        user, token, event_info = AuthService.login_judge(
            db=db,
            email=req.email,
            judge_id=req.organizer_id or req.org_id
        )
    elif req.role == "participant" or (not req.organizer_id and not req.org_id):
        user, token, event_info = AuthService.login_participant(
            db=db,
            email=req.email,
            event_id=req.event_id
        )
    else:
        org_id = req.get_organizer_id()
        user, token, event_info = AuthService.login_organizer(
            db=db,
            email=req.email,
            organizer_id=org_id,
            event_id=req.event_id
        )
    response.set_cookie(key="session", value=token, httponly=False, samesite="lax", path="/")
    return AuthResponse(token=token, token_type="cookie", user=UserResponse.from_orm(user), event=event_info)

@router.get("/me", response_model=UserResponse)
def get_current_user(
    email: str = None,
    db: Session = Depends(get_db),
    request: Request = None
):
    if email:
        user = AuthService.get_user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.from_orm(user)
    
    # Try session auth if no email is supplied
    try:
        session_data = get_current_session(request, db)
        if session_data and session_data.get("user"):
            return UserResponse.from_orm(session_data["user"])
    except HTTPException as e:
        raise e
    except Exception:
        pass

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session required or expired")

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        session_data = get_current_session(request, db)
        if session_data and session_data.get("session_token"):
            db.query(SessionModel).filter(SessionModel.token == session_data["session_token"]).delete()
            db.commit()
    except Exception:
        pass
    response.delete_cookie(key="session", path="/")
    return {"message": "Logged out successfully"}
