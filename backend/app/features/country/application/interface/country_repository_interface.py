import builtins
from typing import Protocol

from app.features.country.domain import Country


class CountryRepositoryInterface(Protocol):
    """Repository contract every country storage implementation must follow."""

    async def create(self, country: Country) -> Country:
        """Persist a new country."""
        ...

    async def get_by_id(self, country_id: str) -> Country | None:
        """Return the country with this id, or None."""
        ...

    async def get_by_name(self, name: str) -> Country | None:
        """Return the country with this name, ignoring case, or None."""
        ...

    async def get_by_iso_code(self, iso_code: str) -> Country | None:
        """Return the country with this ISO code, or None."""
        ...

    async def list(self, offset: int, limit: int) -> tuple[list[Country], int]:
        """Return one page of countries and the total number stored."""
        ...

    async def update(self, country: Country) -> Country:
        """Replace an existing country."""
        ...

    async def delete(self, country_id: str) -> None:
        """Remove the country with this id."""
        ...

    async def load_countries(self, countries: builtins.list[Country]) -> None:
        """Bulk-load countries (initialisation and tests)."""
        ...

    def generate_id(self) -> str:
        """Return a new unique id."""
        ...
