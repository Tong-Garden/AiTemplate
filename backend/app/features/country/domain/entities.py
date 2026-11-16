from dataclasses import dataclass


@dataclass
class Country:
    """A country with its ISO code and international dialling code.

    Attributes:
        id: Unique identifier.
        name: Display name, unique ignoring case.
        iso_code: ISO 3166-1 alpha-2 code, upper-case and unique, e.g. ``SG``.
        phone_code: International dialling code with a leading plus, e.g. ``+65``.
    """

    id: str
    name: str
    iso_code: str
    phone_code: str
