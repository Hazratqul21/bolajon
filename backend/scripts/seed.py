import asyncio

from app.db.seed import seed_initial_data
from app.db.session import async_session_factory


async def main() -> None:
  async with async_session_factory() as session:
    await seed_initial_data(session)
    await session.commit()


if __name__ == "__main__":
  asyncio.run(main())


