from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import init_db
from app.config import settings
from app.interfaces import auth, folders, notes, export, ai, sync, collections, share

app = FastAPI(title="Knowledge Manager", version="2.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(folders.router)
app.include_router(notes.router)
app.include_router(export.router)
app.include_router(ai.router)
app.include_router(sync.router)
app.include_router(collections.router)
app.include_router(share.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok"}