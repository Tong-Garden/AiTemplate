class UserNotFoundError(Exception):
    def __init__(self, user_id: str) -> None:
        super().__init__(f"User with id {user_id} not found")


class InvalidEmailError(Exception):
    def __init__(self, email: str) -> None:
        super().__init__(f"Invalid email format: {email}")


class InvalidPhoneError(Exception):
    def __init__(self, phone: str) -> None:
        super().__init__(f"Invalid phone format: {phone}")


class DuplicateEmailError(Exception):
    def __init__(self, email: str) -> None:
        super().__init__(f"User with email {email} already exists")


class UserAlreadyInactiveError(Exception):
    pass


class UserAlreadyActiveError(Exception):
    pass
