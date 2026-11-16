class UserNotFoundError(Exception):
    """Raised when no user exists for the requested id."""

    def __init__(self, user_id: str) -> None:
        super().__init__(f"User with id {user_id} not found")


class UserValidationError(Exception):
    """Raised when a field breaks a business rule.

    Attributes:
        field: Name of the offending field, reported back to the client.
        detail: Human-readable explanation.
    """

    def __init__(self, field: str, detail: str) -> None:
        super().__init__(detail)
        self.field = field
        self.detail = detail


class InvalidEmailError(UserValidationError):
    """Raised when the email address has an invalid format."""

    def __init__(self, email: str) -> None:
        super().__init__("email", f"Invalid email format: {email}")


class InvalidPhoneError(UserValidationError):
    """Raised when the phone number has an invalid format."""

    def __init__(self, phone: str) -> None:
        super().__init__("phone", f"Invalid phone format: {phone}")


class DuplicateEmailError(Exception):
    """Raised when another user already uses the email."""

    def __init__(self, email: str) -> None:
        super().__init__(f"User with email {email} already exists")


class UserAlreadyInactiveError(Exception):
    """Raised when deactivating a user that is already inactive."""


class UserAlreadyActiveError(Exception):
    """Raised when activating a user that is already active."""
