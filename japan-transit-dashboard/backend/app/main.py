from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.transit import router as transit_router
from app.db.session import engine, Base
from app.models.transit import TransitAlert

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas de alertas de transporte
app.include_router(transit_router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": f"Bem-vindo à API do {settings.PROJECT_NAME}!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "database": "connected"}