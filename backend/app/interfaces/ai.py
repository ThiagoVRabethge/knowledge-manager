from fastapi import APIRouter, Depends
from app.infrastructure.security import get_current_user
from app.use_cases.ai import AIUseCase
from app.schemas import AIGenerateRequest, AIGenerateResponse
from app.domain.models import User

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/generate", response_model=AIGenerateResponse)
async def generate(data: AIGenerateRequest, user: User = Depends(get_current_user)):
    text = await AIUseCase().generate(data.prompt, data.context)
    return AIGenerateResponse(text=text)
