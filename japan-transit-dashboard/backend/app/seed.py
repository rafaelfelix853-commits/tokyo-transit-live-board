import asyncio
from app.db.session import AsyncSessionLocal
from app.models.transit import TransitAlert  # Import direto do modelo correto


async def seed_data():
    async with AsyncSessionLocal() as db:
        sample_alerts = [
            TransitAlert(
                line_name="Yamanote Line",
                operator="JR East",
                status="Delay",
                delay_minutes=15,
                cause="Signal troubleshooting near Shinjuku Station (Platform 14)",
            ),
            TransitAlert(
                line_name="Chuo Main Line",
                operator="JR East",
                status="Normal",
                delay_minutes=0,
                cause="Operating on normal schedule through Tokyo Station",
            ),
            TransitAlert(
                line_name="Ginza Line",
                operator="Tokyo Metro",
                status="Normal",
                delay_minutes=0,
                cause="Normal operation across Shibuya and Asakusa",
            ),
            TransitAlert(
                line_name="Keihin-Tohoku Line",
                operator="JR East",
                status="Delay",
                delay_minutes=8,
                cause="Passenger assistance delay at Ueno Station",
            ),
            TransitAlert(
                line_name="Tokaido Shinkansen",
                operator="JR Central",
                status="Normal",
                delay_minutes=0,
                cause="High-speed services operating on time",
            ),
        ]

        db.add_all(sample_alerts)
        await db.commit()
        print("✅ Successfully seeded 5 realistic Japanese transit alerts!")


if __name__ == "__main__":
    asyncio.run(seed_data())