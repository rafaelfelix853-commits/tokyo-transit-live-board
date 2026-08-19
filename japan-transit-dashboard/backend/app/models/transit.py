from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class TransitAlert(Base):
    __tablename__ = "transit_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    line_name: Mapped[str] = mapped_column(String(100), index=True)
    operator: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50))
    delay_minutes: Mapped[int] = mapped_column(Integer, default=0)
    cause: Mapped[str] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())