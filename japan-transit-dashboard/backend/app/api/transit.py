from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.models.transit import TransitAlert
from app.schemas.transit import TransitAlertCreate, TransitAlertResponse
from app.services.redis import RedisService

router = APIRouter(prefix="/alerts", tags=["Transit Alerts"])

CACHE_KEY_ALERTS = "alerts_list"


# --- READ (com Cache Redis) ---
@router.get("/", response_model=List[TransitAlertResponse])
async def list_alerts(db: AsyncSession = Depends(get_db)):
    # 1. Tenta buscar no Redis primeiro (Hit)
    cached_alerts = await RedisService.get_cache(CACHE_KEY_ALERTS)
    if cached_alerts:
        return cached_alerts

    # 2. Se não estiver no cache (Miss), busca no banco PostgreSQL
    result = await db.execute(select(TransitAlert))
    alerts = result.scalars().all()

    # 3. Converte os modelos ORM para dicionários e salva no Redis por 60 segundos
    alerts_data = [
        TransitAlertResponse.model_validate(alert).model_dump() 
        for alert in alerts
    ]
    await RedisService.set_cache(CACHE_KEY_ALERTS, alerts_data, expire_seconds=60)

    return alerts


# --- CREATE ---
@router.post("/", response_model=TransitAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(alert_in: TransitAlertCreate, db: AsyncSession = Depends(get_db)):
    new_alert = TransitAlert(**alert_in.model_dump())
    db.add(new_alert)
    await db.commit()
    await db.refresh(new_alert)

    # Invalida o cache para atualizar as listagens imediatamente
    await RedisService.clear_cache(CACHE_KEY_ALERTS)
    return new_alert


# --- UPDATE ---
@router.put("/{alert_id}", response_model=TransitAlertResponse)
async def update_alert(
    alert_id: int, 
    alert_in: TransitAlertCreate, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TransitAlert).where(TransitAlert.id == alert_id))
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Alerta de trânsito não encontrado."
        )

    for field, value in alert_in.model_dump().items():
        setattr(alert, field, value)

    await db.commit()
    await db.refresh(alert)

    # Invalida o cache antigo
    await RedisService.clear_cache(CACHE_KEY_ALERTS)
    return alert


# --- DELETE ---
@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransitAlert).where(TransitAlert.id == alert_id))
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Alerta de trânsito não encontrado."
        )

    await db.delete(alert)
    await db.commit()

    # Invalida o cache
    await RedisService.clear_cache(CACHE_KEY_ALERTS)
    return None