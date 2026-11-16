import builtins
from typing import Protocol

from ...domain import User


class UserRepositoryInterface(Protocol):
    """Repository interface - all implementations must follow this contract."""

    async def create(self, user: User) -> User:
        """Create and persist a user."""
        ...

    async def get_by_id(self, user_id: str) -> User | None:
        """Retrieve user by ID."""
        ...

    async def get_by_email(self, email: str) -> User | None:
        """Retrieve user by email."""
        ...

    async def list(self, offset: int, limit: int) -> tuple[builtins.list[User], int]:
        """Return one page of users and the total number stored."""
        ...

    async def update(self, user: User) -> User:
        """Update existing user."""
        ...

    async def delete(self, user_id: str) -> None:
        """Delete user by ID."""
        ...

    async def load_users(self, users: builtins.list[User]) -> None:
        """Load multiple users (for initialization/testing)."""
        ...

    def generate_id(self) -> str:
        """Generate a unique ID for a new user."""
        ...
