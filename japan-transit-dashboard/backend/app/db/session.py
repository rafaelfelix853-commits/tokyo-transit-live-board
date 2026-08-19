from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Engine assíncrona do SQLAlchemy v2.0
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Fabrica de sessões assíncronas
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Classe Base para os Models ORM
class Base(DeclarativeBase):
    pass

# Dependency Injection para rotas da API
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session