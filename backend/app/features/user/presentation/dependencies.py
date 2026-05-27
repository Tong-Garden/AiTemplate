from typing import AsyncGenerator

from ..application import UserService
from ..application.interface import UserRepositoryInterface
from ..infrastructure import SAMPLE_USERS, InMemoryUserRepository

# Concrete implementation injected here (development with in-memory)
_repository: UserRepositoryInterface = InMemoryUserRepository()


async def initialize_sample_data() -> None:
    """Initialize mock repository with sample data on application startup."""
    await _repository.load_users(SAMPLE_USERS)


async def get_user_service() -> AsyncGenerator[UserService, None]:
    """Inject repository interface (not concrete class) into service."""
    yield UserService(repository=_repository)
