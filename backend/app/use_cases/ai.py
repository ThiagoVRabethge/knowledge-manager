from app.infrastructure.ai_service import ai_service_instance

class AIUseCase:
    async def generate(self, prompt: str, context: str = "") -> str:
        full_prompt = f"""Você é um assistente de escrita para um gerenciador de conhecimento em Markdown.
O usuário está escrevendo uma nota e pediu ajuda para gerar conteúdo.

Contexto atual da nota:
{context}

Instrução do usuário:
{prompt}

Gere apenas o texto em Markdown puro, sem explicações adicionais."""
        return await ai_service_instance.generate_text(full_prompt)
