import builtins
import re
from dataclasses import replace

from ..domain.exceptions import (
    DuplicateEmailError,
    InvalidEmailError,
    UserNotFoundError,
    UserValidationError,
)
from ..domain.user import User
from .interface.user_repository_interface import UserRepositoryInterface

EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
MIN_NAME_LENGTH = 2
MIN_PHONE_LENGTH = 5


class UserService:
    """Use cases and business rules for users."""

    def __init__(self, repository: UserRepositoryInterface) -> None:
        self.repository = repository

    async def create(self, name: str, email: str, phone: str, is_active: bool = True) -> User:
        """Create a user after validating every field.

        Raises:
            UserValidationError: A field breaks its rule.
            DuplicateEmailError: The email is already taken.
        """
        self._validate_name(name)
        self._validate_email(email)
        self._validate_phone(phone)

        if await self.repository.get_by_email(email):
            raise DuplicateEmailError(email)

        user = User(
            id=self.repository.generate_id(),
            name=name,
            email=email,
            phone=phone,
            is_active=is_active,
        )
        return await self.repository.create(user)

    async def get_by_id(self, user_id: str) -> User:
        """Return a user or raise UserNotFoundError."""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundError(user_id)
        return user

    async def list(self, page: int, limit: int) -> tuple[list[User], int]:
        """Return one page of users and the overall total."""
        return await self.repository.list((page - 1) * limit, limit)

    async def update(
        self,
        user_id: str,
        name: str | None = None,
        email: str | None = None,
        phone: str | None = None,
        is_active: bool | None = None,
    ) -> User:
        """Apply the supplied fields to a user.

        Changes are validated first and applied to a copy, so a failed update leaves the
        stored user untouched.

        Raises:
            UserNotFoundError: No user has this id.
            UserValidationError: A field breaks its rule.
            DuplicateEmailError: The new email belongs to another user.
        """
        user = await self.get_by_id(user_id)

        if name is not None:
            self._validate_name(name)

        if email is not None:
            self._validate_email(email)
            existing = await self.repository.get_by_email(email)
            if existing is not None and existing.id != user.id:
                raise DuplicateEmailError(email)

        if phone is not None:
            self._validate_phone(phone)

        updated = replace(
            user,
            name=user.name if name is None else name,
            email=user.email if email is None else email,
            phone=user.phone if phone is None else phone,
            is_active=user.is_active if is_active is None else is_active,
        )
        return await self.repository.update(updated)

    async def delete(self, user_id: str) -> None:
        """Delete a user or raise UserNotFoundError."""
        await self.get_by_id(user_id)
        await self.repository.delete(user_id)

    async def upload_from_excel(self, users: builtins.list[User]) -> int:
        """Store parsed users that are new, giving each a fresh id.

        Rows that break a validation rule or whose email already exists are skipped.

        Returns:
            How many users were stored.
        """
        count = 0
        for user in users:
            try:
                self._validate_name(user.name)
                self._validate_email(user.email)
                self._validate_phone(user.phone)
            except UserValidationError:
                continue
            if await self.repository.get_by_email(user.email):
                continue
            await self.repository.create(replace(user, id=self.repository.generate_id()))
            count += 1
        return count

    @staticmethod
    def _validate_name(name: str) -> None:
        if len(name.strip()) < MIN_NAME_LENGTH:
            raise UserValidationError("name", f"Name must be at least {MIN_NAME_LENGTH} characters")

    @staticmethod
    def _validate_email(email: str) -> None:
        if not EMAIL_PATTERN.match(email):
            raise InvalidEmailError(email)

    @staticmethod
    def _validate_phone(phone: str) -> None:
        if len(phone.strip()) < MIN_PHONE_LENGTH:
            raise UserValidationError(
                "phone", f"Phone must be at least {MIN_PHONE_LENGTH} characters"
            )
