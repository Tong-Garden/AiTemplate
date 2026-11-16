import builtins
import uuid

from app.features.country.domain import Country


class InMemoryCountryRepository:
    """In-memory country storage for development and tests."""

    def __init__(self) -> None:
        self.countries: dict[str, Country] = {}

    @staticmethod
    def generate_id() -> str:
        """Return a new UUID string."""
        return str(uuid.uuid4())

    async def create(self, country: Country) -> Country:
        """Store a new country."""
        self.countries[country.id] = country
        return country

    async def get_by_id(self, country_id: str) -> Country | None:
        """Return the country with this id, or None."""
        return self.countries.get(country_id)

    async def get_by_name(self, name: str) -> Country | None:
        """Return the country whose name matches ignoring case, or None."""
        wanted = name.casefold()
        return next((c for c in self.countries.values() if c.name.casefold() == wanted), None)

    async def get_by_iso_code(self, iso_code: str) -> Country | None:
        """Return the country with this ISO code, or None."""
        return next((c for c in self.countries.values() if c.iso_code == iso_code), None)

    async def list(self, offset: int, limit: int) -> tuple[list[Country], int]:
        """Return a slice of countries and the total count."""
        items = list(self.countries.values())
        return items[offset : offset + limit], len(items)

    async def update(self, country: Country) -> Country:
        """Replace the stored country."""
        self.countries[country.id] = country
        return country

    async def delete(self, country_id: str) -> None:
        """Remove the country if present."""
        self.countries.pop(country_id, None)

    async def load_countries(self, countries: builtins.list[Country]) -> None:
        """Bulk-load countries, keyed by id."""
        for country in countries:
            self.countries[country.id] = country
