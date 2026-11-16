import builtins
import uuid

from app.features.company.domain import Company


class InMemoryCompanyRepository:
    """In-memory company storage for development and tests."""

    def __init__(self) -> None:
        self.companies: dict[str, Company] = {}

    @staticmethod
    def generate_id() -> str:
        """Return a new UUID string."""
        return str(uuid.uuid4())

    async def create(self, company: Company) -> Company:
        """Store a new company."""
        self.companies[company.id] = company
        return company

    async def get_by_id(self, company_id: str) -> Company | None:
        """Return the company with this id, or None."""
        return self.companies.get(company_id)

    async def get_by_name(self, name: str) -> Company | None:
        """Return the company whose name matches ignoring case, or None."""
        wanted = name.casefold()
        return next((c for c in self.companies.values() if c.name.casefold() == wanted), None)

    async def list(self, offset: int, limit: int) -> tuple[list[Company], int]:
        """Return a slice of companies and the total count."""
        items = list(self.companies.values())
        return items[offset : offset + limit], len(items)

    async def update(self, company: Company) -> Company:
        """Replace the stored company."""
        self.companies[company.id] = company
        return company

    async def delete(self, company_id: str) -> None:
        """Remove the company if present."""
        self.companies.pop(company_id, None)

    async def load_companies(self, companies: builtins.list[Company]) -> None:
        """Bulk-load companies, keyed by id."""
        for company in companies:
            self.companies[company.id] = company
