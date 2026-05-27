from dataclasses import dataclass

from .exceptions import UserAlreadyActiveError, UserAlreadyInactiveError


@dataclass
class User:
    id: str
    name: str
    email: str
    phone: str
    is_active: bool = True

    def deactivate(self) -> None:
        if not self.is_active:
            raise UserAlreadyInactiveError("User is already inactive")
        self.is_active = False

    def activate(self) -> None:
        if self.is_active:
            raise UserAlreadyActiveError("User is already active")
        self.is_active = True
