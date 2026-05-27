from typing import List, Optional, Protocol

from ...domain import User


class UserRepositoryInterface(Protocol):
    """Repository interface - all implementations must follow this contract."""

    async def create(self, user: User) -> User:
        """Create and persist a user."""
        ...

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Retrieve user by ID."""
        ...

    async def get_by_email(self, email: str) -> Optional[User]:
        """Retrieve user by email."""
        ...

    async def list_all(self) -> List[User]:
        """List all users."""
        ...

    async def update(self, user: User) -> User:
        """Update existing user."""
        ...

    async def delete(self, user_id: str) -> None:
        """Delete user by ID."""
        ...

    async def load_users(self, users: List[User]) -> None:
        """Load multiple users (for initialization/testing)."""
        ...

    def generate_id(self) -> str:
        """Generate a unique ID for a new user."""
        ...
