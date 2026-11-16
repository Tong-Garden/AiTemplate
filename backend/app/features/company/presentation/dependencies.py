from typing import AsyncGenerator

from app.features.company.application import CompanyRepositoryInterface, CompanyService
from app.features.company.infrastructure import SAMPLE_COMPANIES, InMemoryCompanyRepository

_repository: CompanyRepositoryInterface = InMemoryCompanyRepository()


async def initialize_sample_data() -> None:
    """Load the sample companies into the in-memory repository on startup."""
    await _repository.load_companies(SAMPLE_COMPANIES)


async def get_company_service() -> AsyncGenerator[CompanyService, None]:
    """Inject the repository interface, not the concrete class, into the service."""
    yield CompanyService(repository=_repository)
