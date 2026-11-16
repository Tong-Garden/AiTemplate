from dataclasses import dataclass


@dataclass
class Company:
    """A company and the contact and locale details other features depend on.

    Attributes:
        id: Unique identifier.
        name: Display name, unique ignoring case.
        address: Postal address.
        phone_number: Contact phone number.
        timezone: IANA timezone name, e.g. ``Asia/Singapore``.
    """

    id: str
    name: str
    address: str
    phone_number: str
    timezone: str
