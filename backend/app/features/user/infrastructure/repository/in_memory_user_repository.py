import builtins
import uuid

from ...domain import User


class InMemoryUserRepository:
    """In-memory repository implementation - for development/testing."""

    def __init__(self) -> None:
        self.users: dict[str, User] = {}

    @staticmethod
    def generate_id() -> str:
        return str(uuid.uuid4())

    async def create(self, user: User) -> User:
        self.users[user.id] = user
        return user

    async def get_by_id(self, user_id: str) -> User | None:
        return self.users.get(user_id)

    async def get_by_email(self, email: str) -> User | None:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    async def list(self, offset: int, limit: int) -> tuple[list[User], int]:
        """Return a slice of users and the total count."""
        items = list(self.users.values())
        return items[offset : offset + limit], len(items)

    async def update(self, user: User) -> User:
        self.users[user.id] = user
        return user

    async def delete(self, user_id: str) -> None:
        if user_id in self.users:
            del self.users[user_id]

    async def clear(self) -> None:
        self.users.clear()

    async def load_users(self, users: builtins.list[User]) -> None:
        for user in users:
            self.users[user.id] = user
