from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.auth import router as auth_router
from backend.app.api.events import router as events_router
from backend.app.api.projects import router as projects_router

app = FastAPI(title="HackFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = "Invalid request parameters."
    if errors:
        first = errors[0]
        field = first.get("loc", ["field"])[-1]
        raw_msg = first.get("msg", "Invalid value")
        if "value is not a valid email address" in raw_msg.lower():
            msg = "Please enter a valid email address."
        else:
            msg = f"{raw_msg} (field: {field})"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": msg, "errors": errors}
    )

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(projects_router)

@app.get("/")
def root():
    return {"message": "HackFlow API Server Running"}
