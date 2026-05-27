import re
from typing import List

from ..domain.exceptions import DuplicateEmailError, InvalidEmailError, UserNotFoundError
from ..domain.user import User
from .interface.user_repository_interface import UserRepositoryInterface


class UserService:
    def __init__(self, repository: UserRepositoryInterface) -> None:
        self.repository = repository

    async def create(self, name: str, email: str, phone: str, is_active: bool = True) -> User:
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")

        if not self._is_valid_email(email):
            raise InvalidEmailError(email)

        if not phone or len(phone.strip()) < 5:
            raise ValueError("Phone must be at least 5 characters")

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
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundError(user_id)
        return user

    async def list_all(self) -> List[User]:
        return await self.repository.list_all()

    async def update(
        self,
        user_id: str,
        name: str | None = None,
        email: str | None = None,
        phone: str | None = None,
        is_active: bool | None = None,
    ) -> User:
        user = await self.get_by_id(user_id)

        if name is not None:
            if len(name.strip()) < 2:
                raise ValueError("Name must be at least 2 characters")
            user.name = name

        if email is not None:
            if not self._is_valid_email(email):
                raise InvalidEmailError(email)
            if email != user.email and await self.repository.get_by_email(email):
                raise DuplicateEmailError(email)
            user.email = email

        if phone is not None:
            if len(phone.strip()) < 5:
                raise ValueError("Phone must be at least 5 characters")
            user.phone = phone

        if is_active is not None:
            user.is_active = is_active

        return await self.repository.update(user)

    async def delete(self, user_id: str) -> None:
        await self.get_by_id(user_id)
        await self.repository.delete(user_id)

    async def upload_from_excel(self, users: List[User]) -> int:
        count = 0
        for user in users:
            try:
                if not await self.repository.get_by_email(user.email):
                    await self.repository.create(user)
                    count += 1
            except Exception:
                continue
        return count

    @staticmethod
    def _is_valid_email(email: str) -> bool:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))
