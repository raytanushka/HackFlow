from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session as DBSession
from backend.app.db.database import get_db
from backend.app.models.session import Session as SessionModel
from backend.app.models.user import User

def get_current_session(request: Request, db: DBSession = Depends(get_db)):
    token = request.cookies.get("session")

    if not token:
        cookie_header = request.headers.get("cookie") or request.headers.get("Cookie")
        if cookie_header and "session=" in cookie_header:
            for part in cookie_header.split(";"):
                part = part.strip()
                if part.startswith("session="):
                    token = part.split("session=")[1]
                    break

    if not token:
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth_header:
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1].strip()
            elif "session=" in auth_header:
                token = auth_header.split("session=")[1].strip()
            else:
                token = auth_header.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
        )

    db_session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
        )

    user = db.query(User).filter(User.id == db_session.user_id).first()
    return {
        "session_token": db_session.token,
        "user_id": db_session.user_id,
        "role": db_session.role,
        "user": user
    }
