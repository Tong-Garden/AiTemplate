class CountryNotFoundError(Exception):
    """Raised when no country exists for the requested id."""

    def __init__(self, country_id: str) -> None:
        super().__init__(f"Country '{country_id}' not found.")


class DuplicateCountryNameError(Exception):
    """Raised when another country already uses the name, ignoring case."""

    def __init__(self, name: str) -> None:
        super().__init__(f"A country named '{name}' already exists.")


class DuplicateIsoCodeError(Exception):
    """Raised when another country already uses the ISO code."""

    def __init__(self, iso_code: str) -> None:
        super().__init__(f"A country with ISO code '{iso_code}' already exists.")


class CountryValidationError(Exception):
    """Raised when a field breaks a business rule.

    Attributes:
        field: Name of the offending field, reported back to the client.
        detail: Human-readable explanation.
    """

    def __init__(self, field: str, detail: str) -> None:
        super().__init__(detail)
        self.field = field
        self.detail = detail


class InvalidIsoCodeError(CountryValidationError):
    """Raised when the ISO code is not two letters."""

    def __init__(self, iso_code: str) -> None:
        super().__init__("iso_code", f"'{iso_code}' is not a two-letter ISO 3166-1 code.")


class InvalidPhoneCodeError(CountryValidationError):
    """Raised when the phone code is not a plus followed by one to four digits."""

    def __init__(self, phone_code: str) -> None:
        super().__init__("phone_code", f"'{phone_code}' is not a valid dialling code like +65.")
