from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.export import ExportUseCase
from app.domain.models import User

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/markdown")
def export_markdown(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    buf = ExportUseCase(session).export_markdown(user.id)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=knowledge-backup.zip"}
    )
