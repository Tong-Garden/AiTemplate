import uuid
from typing import List, Optional

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

    async def get_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    async def get_by_email(self, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    async def list_all(self) -> List[User]:
        return list(self.users.values())

    async def update(self, user: User) -> User:
        self.users[user.id] = user
        return user

    async def delete(self, user_id: str) -> None:
        if user_id in self.users:
            del self.users[user_id]

    async def clear(self) -> None:
        self.users.clear()

    async def load_users(self, users: List[User]) -> None:
        for user in users:
            self.users[user.id] = user
