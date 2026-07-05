from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings


settings = get_settings()
client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.database_name]


async def ping_database() -> bool:
    await client.admin.command("ping")
    return True


def get_collection(name: str):
    return db[name]
