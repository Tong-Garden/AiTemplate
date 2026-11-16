from typing import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.features.user.application import UserService
from app.features.user.domain import User
from app.features.user.infrastructure import InMemoryUserRepository
from app.features.user.presentation import get_user_service, router


@pytest.fixture
def seeded_users() -> list[User]:
    """Three users with distinct emails for list and duplicate tests."""
    return [
        User("id-1", "Alice Anders", "alice@example.com", "+65 6000 0001"),
        User("id-2", "Bob Brown", "bob@example.com", "+65 6000 0002"),
        User("id-3", "Cara Cole", "cara@example.com", "+65 6000 0003", is_active=False),
    ]


@pytest.fixture
def client(seeded_users: list[User]) -> Iterator[TestClient]:
    """TestClient on an app that mounts only the user router over a fresh repository."""
    repository = InMemoryUserRepository()
    repository.users = {user.id: user for user in seeded_users}
    app = FastAPI()
    app.include_router(router, prefix="/v1")
    app.dependency_overrides[get_user_service] = lambda: UserService(repository)
    with TestClient(app) as test_client:
        yield test_client
