import json
import redis.asyncio as aioredis
from typing import Optional, Any
from app.core.config import settings

# Inicializa o cliente assíncrono do Redis
redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

class RedisService:
    @staticmethod
    async def get_cache(key: str) -> Optional[Any]:
        """Recupera um valor em JSON do cache pelo nome da chave."""
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
        return None

    @staticmethod
    async def set_cache(key: str, value: Any, expire_seconds: int = 60) -> None:
        """Salva um objeto no cache serializado em JSON com tempo de expiração (TTL)."""
        await redis_client.set(
            key, 
            json.dumps(value, default=str), 
            ex=expire_seconds
        )

    @staticmethod
    async def clear_cache(key: str) -> None:
        """Invalida/deleta uma chave do cache."""
        await redis_client.delete(key)