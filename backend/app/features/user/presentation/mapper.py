from ..domain import User
from .schemas import UserResponse


class UserMapper:
    """Maps between domain entities and presentation schemas."""

    @staticmethod
    def to_response(user: User) -> UserResponse:
        """Convert domain entity to HTTP response DTO."""
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            is_active=user.is_active,
        )

    @staticmethod
    def to_response_list(users: list[User]) -> list[UserResponse]:
        """Convert list of domain entities to HTTP response DTOs."""
        return [UserMapper.to_response(user) for user in users]

    @staticmethod
    def from_excel_row(row: dict) -> User:
        """Convert Excel row data to domain entity."""
        is_active = row.get("is_active", True)
        if isinstance(is_active, str):
            is_active = is_active.lower() in ("true", "1", "yes", "active")
        return User(
            id="",
            name=row.get("name", ""),
            email=row.get("email", ""),
            phone=row.get("phone", ""),
            is_active=is_active,
        )
