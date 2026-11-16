class CompanyNotFoundError(Exception):
    """Raised when no company exists for the requested id."""

    def __init__(self, company_id: str) -> None:
        super().__init__(f"Company '{company_id}' not found.")


class DuplicateCompanyNameError(Exception):
    """Raised when another company already uses the name, ignoring case."""

    def __init__(self, name: str) -> None:
        super().__init__(f"A company named '{name}' already exists.")


class CompanyValidationError(Exception):
    """Raised when a field breaks a business rule.

    Attributes:
        field: Name of the offending field, reported back to the client.
        detail: Human-readable explanation.
    """

    def __init__(self, field: str, detail: str) -> None:
        super().__init__(detail)
        self.field = field
        self.detail = detail


class InvalidTimezoneError(CompanyValidationError):
    """Raised when the timezone is not a known IANA name."""

    def __init__(self, timezone: str) -> None:
        super().__init__("timezone", f"'{timezone}' is not a valid IANA timezone.")


class InvalidPhoneNumberError(CompanyValidationError):
    """Raised when the phone number has an unsupported format."""

    def __init__(self, phone_number: str) -> None:
        super().__init__("phone_number", f"'{phone_number}' is not a valid phone number.")
