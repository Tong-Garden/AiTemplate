import builtins
from typing import Protocol

from app.features.company.domain import Company


class CompanyRepositoryInterface(Protocol):
    """Repository contract every company storage implementation must follow."""

    async def create(self, company: Company) -> Company:
        """Persist a new company."""
        ...

    async def get_by_id(self, company_id: str) -> Company | None:
        """Return the company with this id, or None."""
        ...

    async def get_by_name(self, name: str) -> Company | None:
        """Return the company with this name, ignoring case, or None."""
        ...

    async def list(self, offset: int, limit: int) -> tuple[list[Company], int]:
        """Return one page of companies and the total number stored."""
        ...

    async def update(self, company: Company) -> Company:
        """Replace an existing company."""
        ...

    async def delete(self, company_id: str) -> None:
        """Remove the company with this id."""
        ...

    async def load_companies(self, companies: builtins.list[Company]) -> None:
        """Bulk-load companies (initialisation and tests)."""
        ...

    def generate_id(self) -> str:
        """Return a new unique id."""
        ...
